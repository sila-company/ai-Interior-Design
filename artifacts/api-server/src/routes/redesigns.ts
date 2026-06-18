import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import { getDb, redesigns, rooms } from "@workspace/db";
import { buildRedesignPrompt, customStyleDefinition, getStyleById } from "../data/styles";
import { logger } from "../lib/logger";
import {
  buildRoomContextLines,
  roomPreferencesFromRecord,
} from "../lib/room-context";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";
import {
  generateRoomRedesign,
  type ReferenceImage,
} from "../services/openai";
import {
  ensureInventoryDatabase,
  selectInventoryProducts,
  type InventoryProduct,
} from "../services/inventory";
import {
  readStoredImage,
  saveUserImage,
  toPublicUploadUrl,
} from "../services/storage";

const router: IRouter = Router();

type RedesignProduct = InventoryProduct;

const MAX_REFERENCE_PRODUCTS = readPositiveIntegerEnv("MAX_REFERENCE_PRODUCTS", 3);
const MAX_REFERENCE_IMAGE_BYTES = 8 * 1024 * 1024;
const REFERENCE_IMAGE_FETCH_TIMEOUT_MS = readPositiveIntegerEnv(
  "REFERENCE_IMAGE_FETCH_TIMEOUT_MS",
  8_000,
);

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const GENERATION_CATEGORY_PRIORITY: Record<string, number> = {
  sofa: 0,
  sectional: 0,
  bed_frame: 1,
  rug: 2,
  coffee_table: 3,
  dresser: 4,
  accent_chair: 5,
  nightstand: 6,
  side_table: 7,
  wall_art: 8,
};

function generationPriority(category: string): number {
  return GENERATION_CATEGORY_PRIORITY[category.toLowerCase()] ?? 50;
}

function prioritizeProducts(products: RedesignProduct[]): RedesignProduct[] {
  const sorted = [...products].sort(
    (a, b) => generationPriority(a.category) - generationPriority(b.category),
  );
  const selected: RedesignProduct[] = [];
  const selectedCategories = new Set<string>();

  for (const product of sorted) {
    const category = product.category.toLowerCase();
    if (selectedCategories.has(category)) continue;

    selected.push(product);
    selectedCategories.add(category);

    if (selected.length >= MAX_REFERENCE_PRODUCTS) {
      return selected;
    }
  }

  for (const product of sorted) {
    if (selected.some((item) => item.id === product.id)) continue;

    selected.push(product);

    if (selected.length >= MAX_REFERENCE_PRODUCTS) {
      return selected;
    }
  }

  return selected;
}

interface ReferencedProduct {
  product: RedesignProduct;
  reference: ReferenceImage;
}

async function fetchReferenceImage(
  url: string,
  index: number,
): Promise<ReferenceImage | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REFERENCE_IMAGE_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) return null;
    if (arrayBuffer.byteLength > MAX_REFERENCE_IMAGE_BYTES) return null;

    const mimeType = contentType.split(";")[0]?.trim() || "image/jpeg";
    const extension = mimeType.includes("png") ? "png" : "jpg";
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType,
      filename: `product-${index + 1}.${extension}`,
    };
  } catch {
    return null;
  }
}

async function loadProductReferenceImages(
  products: RedesignProduct[],
): Promise<{ referenced: ReferencedProduct[]; textOnly: RedesignProduct[] }> {
  const referenced: ReferencedProduct[] = [];
  const textOnly: RedesignProduct[] = [];

  const fetched = await Promise.all(
    products.map(async (product, index) => {
      if (!product.imageUrl) return null;
      return fetchReferenceImage(product.imageUrl, index);
    }),
  );

  products.forEach((product, index) => {
    const reference = fetched[index];
    if (reference) {
      referenced.push({ product, reference });
    } else {
      textOnly.push(product);
    }
  });

  return { referenced, textOnly };
}

const createRedesignBodySchema = z
  .object({
    roomId: z.string().min(1),
    styleId: z.string().min(1).optional(),
    customStyleDescription: z.string().trim().min(3).max(500).optional(),
    revisionInstruction: z.string().trim().max(800).optional(),
  })
  .superRefine((data, ctx) => {
    const hasStyleId = Boolean(data.styleId);
    const hasCustomStyle = Boolean(data.customStyleDescription);

    if (!hasStyleId && !hasCustomStyle) {
      ctx.addIssue({
        code: "custom",
        message: "Either styleId or customStyleDescription is required.",
        path: ["styleId"],
      });
    }

    if (hasStyleId && hasCustomStyle) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either styleId or customStyleDescription, not both.",
        path: ["customStyleDescription"],
      });
    }
  });

const redesignProductSchema = z.object({
  id: z.string(),
  roomType: z.string(),
  category: z.string(),
  title: z.string(),
  price: z.string().optional(),
  currency: z.string(),
  retailer: z.string(),
  affiliateUrl: z.string(),
  productUrl: z.string(),
  imageUrl: z.string().optional(),
  width: z.number().optional(),
  depth: z.number().optional(),
  height: z.number().optional(),
  dimensionUnit: z.string(),
  color: z.string().optional(),
  material: z.string().optional(),
  styleTags: z.array(z.string()),
  visualDescription: z.string().optional(),
});

const redesignSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  styleId: z.string(),
  mimeType: z.string(),
  resultImageUrl: z.string(),
  originalImageUrl: z.string(),
  imageBase64: z.string().optional(),
  products: z.array(redesignProductSchema).optional(),
  createdAt: z.string(),
});

const errorResponseSchema = z.object({
  message: z.string(),
});

router.use(requireAuth);

router.get("/", async (req: AuthenticatedRequest, res) => {
  await ensureInventoryDatabase();

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
        products: parseStoredProducts(redesign.inventoryProducts),
        createdAt: redesign.createdAt.toISOString(),
      }),
    ),
  );
});

router.delete("/:redesignId", async (req: AuthenticatedRequest, res) => {
  const redesignId = String(req.params.redesignId);
  const db = getDb();
  const [deleted] = await db
    .delete(redesigns)
    .where(eq(redesigns.id, redesignId))
    .returning();

  if (!deleted || deleted.userId !== req.user!.id) {
    res.status(404).json({ message: "Redesign not found." });
    return;
  }

  res.status(204).send();
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  await ensureInventoryDatabase();

  const parsedBody = createRedesignBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json(
      errorResponseSchema.parse({
        message: "roomId and a style choice are required.",
      }),
    );
    return;
  }

  const style = parsedBody.data.customStyleDescription
    ? customStyleDefinition(parsedBody.data.customStyleDescription)
    : getStyleById(parsedBody.data.styleId!);

  if (!style) {
    res.status(400).json(
      errorResponseSchema.parse({
        message: `Unknown styleId: ${parsedBody.data.styleId}`,
      }),
    );
    return;
  }

  const inventoryStyleId = style.id === "custom" ? "modern" : style.id;

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
    const roomContext = buildRoomContextLines(roomPreferencesFromRecord(room));
    const inventoryProducts = await selectInventoryProducts(room, inventoryStyleId);
    const prioritizedProducts = prioritizeProducts(
      inventoryProducts,
    );
    const { referenced, textOnly } =
      await loadProductReferenceImages(prioritizedProducts);
    const referenceImages = referenced.map((item) => item.reference);
    const redesigned = await generateInventoryBasedRedesign(
      originalBuffer,
      buildProductAwarePrompt(
        style,
        referenced,
        textOnly,
        roomContext,
        parsedBody.data.revisionInstruction,
      ),
      prioritizedProducts,
      referenceImages,
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
        inventoryProducts: prioritizedProducts,
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
      products: prioritizedProducts,
      createdAt: created.createdAt.toISOString(),
    });

    res.status(201).json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate redesign.";
    res.status(502).json(errorResponseSchema.parse({ message }));
  }
});

async function generateInventoryBasedRedesign(
  originalBuffer: Buffer,
  prompt: string,
  products: RedesignProduct[],
  referenceImages: ReferenceImage[] = [],
) {
  if (products.length === 0) {
    throw new Error("No active inventory products are available for this room.");
  }

  logger.info(
    {
      productCount: products.length,
      referenceImageCount: referenceImages.length,
    },
    "Generating redesign from selected inventory products",
  );

  return generateRoomRedesign(originalBuffer, prompt, referenceImages);
}

function describeProduct(product: RedesignProduct): string {
  const details = [
    product.visualDescription
      ? `visual description: ${product.visualDescription}`
      : "",
    product.color ? `color: ${product.color}` : "",
    product.material ? `material: ${product.material}` : "",
    product.dimensions ? `real-world size: ${product.dimensions}` : "",
  ].filter(Boolean);

  return `${product.category}: ${product.title}${
    details.length > 0 ? ` (${details.join(", ")})` : ""
  }`;
}

function parseStoredProducts(value: unknown) {
  const parsed = z.array(redesignProductSchema).safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function buildProductAwarePrompt(
  style: NonNullable<ReturnType<typeof getStyleById>>,
  referenced: ReferencedProduct[],
  textOnly: RedesignProduct[],
  roomContextLines: string[] = [],
  revisionInstruction?: string,
) {
  if (referenced.length === 0 && textOnly.length === 0) {
    return buildRedesignPrompt(style, roomContextLines);
  }

  const allProducts = [
    ...referenced.map((item) => item.product),
    ...textOnly,
  ];
  const allowedCategories = Array.from(
    new Set(allProducts.map((product) => product.category.toLowerCase())),
  ).join(", ");
  const shoppableProducts = allProducts
    .map((product) => `- ${product.category}: ${product.title}`)
    .join("\n");

  const lines: string[] = [
    "Image 1 is a photograph of the actual room to redesign.",
    "Keep the room architecture exactly as in Image 1: walls, windows, doors, ceiling, floor plan, flooring, camera angle, and perspective. Do not move walls or change the viewpoint.",
    ...roomContextLines,
  ];

  if (revisionInstruction) {
    lines.push(
      `User requested revision: ${revisionInstruction}`,
      "Apply the requested revision only if it can be done using the listed inventory products. If the requested change requires an unlisted item, do not invent it; use the closest listed inventory item or leave the area empty.",
    );
  }

  if (referenced.length > 0) {
    lines.push(
      "The remaining images are the EXACT products to place into the room. Reproduce each product faithfully: match the same color, material, shape, proportions, hardware, and design details shown in its reference photo. Scale each product to its stated real-world size.",
      "Do not use the product reference images as loose inspiration. Treat them as the purchasable catalog items that must appear in the output.",
    );
    referenced.forEach((item, index) => {
      lines.push(`- Image ${index + 2}: ${describeProduct(item.product)}`);
    });
  }

  if (textOnly.length > 0) {
    lines.push(
      "Also stage these inventory items (no reference photo provided, follow the description precisely):",
    );
    textOnly.forEach((product) => {
      lines.push(`- ${describeProduct(product)}`);
    });
  }

  lines.push(
    style.id === "custom"
      ? `Style direction from the homeowner: ${style.description}`
      : `Arrange these products into a coherent ${style.name.toLowerCase()} layout. ${style.description}`,
    "MANDATORY PRODUCT VISIBILITY: include every shoppable inventory product listed above in the final image. If a product is listed above, it must be clearly visible and recognizable in the room.",
    "SHOPPABLE FURNITURE RULE: every major furniture item must be one of the listed inventory products. Do not create, add, or substitute any unlisted sofa, sectional, chair, coffee table, side table, bed frame, dresser, nightstand, rug, wall art, cabinet, shelf, desk, dining table, or other major furniture item.",
    "Use these shoppable inventory products as the actual furniture in the design:",
    shoppableProducts,
    `Allowed shoppable product categories: ${allowedCategories}. Do not introduce other major furniture categories.`,
    "QUANTITY RULE: use normal residential quantities unless the homeowner vision or revision explicitly asks for more. For a bedroom, default to exactly ONE bed. Do not add a second bed, twin beds, bunk beds, or extra bed frame unless the homeowner specifically asks for multiple beds, a shared room, guest beds, kids beds, twin beds, bunk beds, or similar wording.",
    "For living rooms, default to one main seating area. Do not duplicate major sofas, sectionals, coffee tables, rugs, or media/storage pieces unless the homeowner explicitly asks for multiples.",
    "VISUAL STAGING ALLOWANCE: you may add minor non-shoppable styling accessories only when they make the room feel realistic, such as neutral bedding, pillows, throws, books, bowls, small vases, small plants, candles, tabletop objects, and subtle wall styling. These accessories are decorative only and should not replace or obscure the listed inventory products.",
    "For bedrooms, a mattress, bedding, pillows, and blankets are allowed as staging around a listed bed frame. The bed frame itself must visibly match the listed inventory product.",
    "For living rooms, small pillows, throws, books, plants, and tabletop decor are allowed as staging. Sofas, chairs, tables, rugs, storage, and wall art must come from the listed inventory.",
    "Do not include a shoppable inventory product in the design plan unless it appears in the final rendered room. The product list returned to the app is exactly what users will see under Shop this room.",
    "The final image should clearly feature the listed inventory furniture so users can shop those exact products. Do not make up alternate core furniture.",
    "Photorealistic interior design photograph with natural lighting, realistic contact shadows, and matching perspective so the products look genuinely placed in the room.",
  );

  return lines.join("\n");
}

export default router;
