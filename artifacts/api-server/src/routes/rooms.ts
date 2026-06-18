import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import multer from "multer";
import { z } from "zod/v4";

import { getDb, redesigns, rooms } from "@workspace/db";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";
import { ensureInventoryDatabase } from "../services/inventory";
import {
  readStoredImage,
  saveUserImage,
  toPublicUploadUrl,
} from "../services/storage";
import {
  parseRoomPreferences,
  roomPreferencesFromRecord,
} from "../lib/room-context";

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  originalImageUrl: z.string(),
  createdAt: z.string(),
  redesignCount: z.number(),
  description: z.string().nullable(),
  length: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  dimensionUnit: z.enum(["meters", "feet"]).nullable(),
  budgetAmount: z.number().int().nullable(),
  budgetCurrency: z.string(),
});

function serializeRoom(
  room: {
    id: string;
    name: string;
    originalImagePath: string;
    createdAt: Date;
    description: string | null;
    length: number | null;
    width: number | null;
    height: number | null;
    dimensionUnit: string | null;
    budgetAmount: number | null;
    budgetCurrency: string | null;
  },
  redesignCount: number,
) {
  const preferences = roomPreferencesFromRecord(room as never);
  return roomSchema.parse({
    id: room.id,
    name: room.name,
    originalImageUrl: toPublicUploadUrl(room.originalImagePath),
    createdAt: room.createdAt.toISOString(),
    redesignCount,
    ...preferences,
  });
}

const redesignSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  styleId: z.string(),
  mimeType: z.string(),
  resultImageUrl: z.string(),
  products: z.array(z.unknown()).optional(),
  createdAt: z.string(),
});

router.use(requireAuth);

router.get("/", async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const userRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.userId, req.user!.id))
    .orderBy(desc(rooms.updatedAt));

  const counts = await Promise.all(
    userRooms.map(async (room) => {
      const rows = await db
        .select({ id: redesigns.id })
        .from(redesigns)
        .where(eq(redesigns.roomId, room.id));
      return rows.length;
    }),
  );

  res.json(
    userRooms.map((room, index) => serializeRoom(room, counts[index] ?? 0)),
  );
});

router.post("/", upload.single("image"), async (req: AuthenticatedRequest, res) => {
  const name = String(req.body.name ?? "").trim();
  if (!name) {
    res.status(400).json({ message: "Room name is required." });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "Room photo is required." });
    return;
  }

  const originalImagePath = await saveUserImage(
    req.user!.id,
    ["rooms"],
    req.file.buffer,
    "jpg",
  );

  const preferences = parseRoomPreferences(req.body as Record<string, unknown>);

  const db = getDb();
  const [created] = await db
    .insert(rooms)
    .values({
      userId: req.user!.id,
      name,
      originalImagePath,
      description: preferences.description,
      length: preferences.length,
      width: preferences.width,
      height: preferences.height,
      dimensionUnit: preferences.dimensionUnit,
      budgetAmount: preferences.budgetAmount,
      budgetCurrency: preferences.budgetCurrency,
    })
    .returning();

  if (!created) {
    res.status(500).json({ message: "Could not create room." });
    return;
  }

  res.status(201).json(serializeRoom(created, 0));
});

router.get("/:roomId", async (req: AuthenticatedRequest, res) => {
  await ensureInventoryDatabase();

  const roomId = String(req.params.roomId);
  const db = getDb();
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  if (!room || room.userId !== req.user!.id) {
    res.status(404).json({ message: "Room not found." });
    return;
  }

  const roomRedesigns = await db
    .select()
    .from(redesigns)
    .where(eq(redesigns.roomId, room.id))
    .orderBy(desc(redesigns.createdAt));

  res.json({
    room: serializeRoom(room, roomRedesigns.length),
    redesigns: roomRedesigns.map((item) =>
      redesignSchema.parse({
        id: item.id,
        roomId: item.roomId,
        styleId: item.styleId,
        mimeType: item.mimeType,
        resultImageUrl: toPublicUploadUrl(item.resultImagePath),
        products: Array.isArray(item.inventoryProducts)
          ? item.inventoryProducts
          : undefined,
        createdAt: item.createdAt.toISOString(),
      }),
    ),
  });
});

router.patch("/:roomId", async (req: AuthenticatedRequest, res) => {
  const roomId = String(req.params.roomId);
  const name = String(req.body.name ?? "").trim();
  if (!name) {
    res.status(400).json({ message: "Room name is required." });
    return;
  }

  const preferences = parseRoomPreferences(req.body as Record<string, unknown>);

  const db = getDb();
  const [updated] = await db
    .update(rooms)
    .set({
      name,
      description: preferences.description,
      length: preferences.length,
      width: preferences.width,
      height: preferences.height,
      dimensionUnit: preferences.dimensionUnit,
      budgetAmount: preferences.budgetAmount,
      budgetCurrency: preferences.budgetCurrency,
      updatedAt: new Date(),
    })
    .where(eq(rooms.id, roomId))
    .returning();

  if (!updated || updated.userId !== req.user!.id) {
    res.status(404).json({ message: "Room not found." });
    return;
  }

  res.json(serializeRoom(updated, 0));
});

router.delete("/:roomId", async (req: AuthenticatedRequest, res) => {
  const roomId = String(req.params.roomId);
  const db = getDb();
  const [deleted] = await db
    .delete(rooms)
    .where(eq(rooms.id, roomId))
    .returning();

  if (!deleted || deleted.userId !== req.user!.id) {
    res.status(404).json({ message: "Room not found." });
    return;
  }

  res.status(204).send();
});

router.get("/:roomId/original", async (req: AuthenticatedRequest, res) => {
  const roomId = String(req.params.roomId);
  const db = getDb();
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  if (!room || room.userId !== req.user!.id) {
    res.status(404).json({ message: "Room not found." });
    return;
  }

  const buffer = await readStoredImage(room.originalImagePath);
  res.setHeader("Content-Type", "image/jpeg");
  res.send(buffer);
});

export default router;
