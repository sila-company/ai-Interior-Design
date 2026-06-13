import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import { getDb, redesigns, rooms } from "@workspace/db";
import { buildRedesignPrompt, getStyleById } from "../data/styles";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";
import {
  generateRoomRedesign,
  verifyInventoryCompliance,
} from "../services/openai";
import {
  readStoredImage,
  saveUserImage,
  toPublicUploadUrl,
} from "../services/storage";

const router: IRouter = Router();

const createRedesignBodySchema = z.object({
  roomId: z.string().min(1),
  styleId: z.string().min(1),
  products: z
    .array(
      z.object({
        category: z.string(),
        title: z.string(),
        price: z.string().optional(),
        retailer: z.string(),
        color: z.string().optional(),
        material: z.string().optional(),
        dimensions: z.string().optional(),
        visualDescription: z.string().optional(),
      }),
    )
    .optional(),
});

const redesignSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  styleId: z.string(),
  mimeType: z.string(),
  resultImageUrl: z.string(),
  originalImageUrl: z.string(),
  imageBase64: z.string().optional(),
  createdAt: z.string(),
});

const errorResponseSchema = z.object({
  message: z.string(),
});

router.use(requireAuth);

router.get("/", async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const rows = await db
    .select({
      redesign: redesigns,
      room: rooms,
    })
    .from(redesigns)
    .innerJoin(rooms, eq(redesigns.roomId, rooms.id))
    .where(eq(redesigns.userId, req.user!.id))
    .orderBy(desc(redesigns.createdAt));

  res.json(
    rows.map(({ redesign, room }) =>
      redesignSchema.parse({
        id: redesign.id,
        roomId: redesign.roomId,
        styleId: redesign.styleId,
        mimeType: redesign.mimeType,
        resultImageUrl: toPublicUploadUrl(redesign.resultImagePath),
        originalImageUrl: toPublicUploadUrl(room.originalImagePath),
        createdAt: redesign.createdAt.toISOString(),
      }),
    ),
  );
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  const parsedBody = createRedesignBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json(
      errorResponseSchema.parse({ message: "roomId and styleId are required." }),
    );
    return;
  }

  const style = getStyleById(parsedBody.data.styleId);
  if (!style) {
    res.status(400).json(
      errorResponseSchema.parse({
        message: `Unknown styleId: ${parsedBody.data.styleId}`,
      }),
    );
    return;
  }

  const db = getDb();
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, parsedBody.data.roomId))
    .limit(1);

  if (!room || room.userId !== req.user!.id) {
    res.status(404).json(errorResponseSchema.parse({ message: "Room not found." }));
    return;
  }

  try {
    const originalBuffer = await readStoredImage(room.originalImagePath);
    const products = parsedBody.data.products ?? [];
    const redesigned = await generateInventorySafeRedesign(
      originalBuffer,
      buildProductAwarePrompt(style, products),
      products,
    );

    const resultImagePath = await saveUserImage(
      req.user!.id,
      ["rooms", room.id, "redesigns"],
      redesigned,
      "jpg",
    );

    const [created] = await db
      .insert(redesigns)
      .values({
        roomId: room.id,
        userId: req.user!.id,
        styleId: style.id,
        resultImagePath,
        mimeType: "image/jpeg",
      })
      .returning();

    await db
      .update(rooms)
      .set({ updatedAt: new Date() })
      .where(eq(rooms.id, room.id));

    if (!created) {
      res.status(500).json(
        errorResponseSchema.parse({ message: "Could not save redesign." }),
      );
      return;
    }

    const data = redesignSchema.parse({
      id: created.id,
      roomId: created.roomId,
      styleId: created.styleId,
      mimeType: created.mimeType,
      resultImageUrl: toPublicUploadUrl(created.resultImagePath),
      originalImageUrl: toPublicUploadUrl(room.originalImagePath),
      imageBase64: redesigned.toString("base64"),
      createdAt: created.createdAt.toISOString(),
    });

    res.status(201).json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate redesign.";
    res.status(502).json(errorResponseSchema.parse({ message }));
  }
});

async function generateInventorySafeRedesign(
  originalBuffer: Buffer,
  prompt: string,
  products: NonNullable<z.infer<typeof createRedesignBodySchema>["products"]>,
) {
  if (products.length === 0) {
    return generateRoomRedesign(originalBuffer, prompt);
  }

  let lastFailure = "The generated image did not pass inventory verification.";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const retryPrompt =
      attempt === 1
        ? prompt
        : [
            prompt,
            "Previous attempt failed inventory compliance.",
            `Failure reason: ${lastFailure}`,
            "Regenerate the room with STRICTLY no extra furniture or decor beyond the listed inventory.",
          ].join("\n");

    const redesigned = await generateRoomRedesign(originalBuffer, retryPrompt);
    const verification = await verifyInventoryCompliance(redesigned, products);

    if (verification.passed && verification.confidence >= 0.7) {
      return redesigned;
    }

    const extraItems =
      verification.extraItems.length > 0
        ? ` Extra unlisted items: ${verification.extraItems.join(", ")}.`
        : "";
    const missing =
      verification.missingInventoryCategories.length > 0
        ? ` Missing inventory categories: ${verification.missingInventoryCategories.join(", ")}.`
        : "";
    lastFailure = `${verification.reasoning}${extraItems}${missing}`.trim();
  }

  throw new Error(
    `Could not generate an inventory-safe redesign after 3 attempts. ${lastFailure}`,
  );
}

function buildProductAwarePrompt(
  style: NonNullable<ReturnType<typeof getStyleById>>,
  products: NonNullable<z.infer<typeof createRedesignBodySchema>["products"]>,
) {
  if (products.length === 0) {
    return buildRedesignPrompt(style);
  }

  const productLines = products
    .map((product, index) => {
      const details = [
        product.visualDescription ? `visual description: ${product.visualDescription}` : "",
        product.color ? `color: ${product.color}` : "",
        product.material ? `material: ${product.material}` : "",
        product.dimensions ? `dimensions: ${product.dimensions}` : "",
      ].filter(Boolean);

      return `${index + 1}. ${product.category}: ${product.title} from ${product.retailer}${
        details.length > 0 ? ` (${details.join(", ")})` : ""
      }`;
    })
    .join("\n");

  const allowedCategories = Array.from(
    new Set(products.map((product) => product.category.toLowerCase())),
  ).join(", ");

  return [
    `Redesign this room in a ${style.name.toLowerCase()} style.`,
    style.description,
    "Preserve the original room architecture: walls, windows, doors, ceiling, floor plan, flooring, camera angle, and perspective.",
    "INVENTORY LOCK: Use ONLY the shoppable inventory listed below for all visible furniture, rugs, lamps, wall art, bedding, storage, and decor.",
    "Do NOT create, add, or replace with any sofa, chair, table, rug, bed, dresser, nightstand, lamp, artwork, plant, pillow, throw, shelf, cabinet, or decor item that is not represented in the inventory list.",
    "If a normal interior design would need an item that is not in the inventory list, leave that area clean and empty rather than inventing an unlisted product.",
    `Allowed visible product categories: ${allowedCategories}. Do not show other product categories.`,
    "The visual description for each inventory item is the source of truth for how that item should appear.",
    "For each visible staged item, preserve its category, color, material, scale, silhouette, and key design details from the visual description.",
    "It is acceptable for the final room to look sparse if the inventory is limited. Product accuracy is more important than filling the room.",
    "Photorealistic interior design photograph with natural lighting, realistic shadows, and matching perspective.",
    "SHOULD NOT INCLUDE: generic furniture, unlisted products, extra sofas, extra chairs, extra tables, extra rugs, extra lamps, extra art, plants, books, vases, or decorative objects unless they are in the inventory list.",
    "Allowed inventory:",
    productLines,
  ].join("\n");
}

export default router;
