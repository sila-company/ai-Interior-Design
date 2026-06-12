import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import { getDb, redesigns, rooms } from "@workspace/db";
import { buildRedesignPrompt, getStyleById } from "../data/styles";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";
import { generateRoomRedesign } from "../services/openai";
import {
  readStoredImage,
  saveUserImage,
  toPublicUploadUrl,
} from "../services/storage";

const router: IRouter = Router();

const createRedesignBodySchema = z.object({
  roomId: z.string().min(1),
  styleId: z.string().min(1),
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
    const redesigned = await generateRoomRedesign(
      originalBuffer,
      buildRedesignPrompt(style),
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

export default router;
