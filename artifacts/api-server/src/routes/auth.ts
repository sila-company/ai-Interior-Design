import { Router, type IRouter, type Response } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import { getDb, redesigns, rooms, users } from "@workspace/db";
import { getMembershipSnapshot } from "../lib/entitlement";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAuthToken, TOKEN_COOKIE } from "../lib/tokens";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

const membershipSchema = z.object({
  isActive: z.boolean(),
  freeRemaining: z.number(),
  expiresAt: z.string().nullable(),
  redesignCount: z.number(),
  productId: z.string().nullable(),
});

const meResponseSchema = z.object({
  user: userSchema,
  membership: membershipSchema,
});

function setAuthCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

router.post("/register", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Enter a valid email and password (8+ characters)." });
    return;
  }

  const db = getDb();
  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    res.status(409).json({ message: "An account with this email already exists." });
    return;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const name = parsed.data.name?.trim() || email.split("@")[0] || "Guest";

  const [created] = await db
    .insert(users)
    .values({ email, passwordHash, name })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  if (!created) {
    res.status(500).json({ message: "Could not create account." });
    return;
  }

  const token = signAuthToken({ sub: created.id, email: created.email });
  setAuthCookie(res, token);

  res.status(201).json({
    token,
    user: userSchema.parse(created),
  });
});

router.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Enter a valid email and password." });
    return;
  }

  const db = getDb();
  const email = parsed.data.email.toLowerCase();
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ message: "Incorrect email or password." });
    return;
  }

  const token = signAuthToken({ sub: user.id, email: user.email });
  setAuthCookie(res, token);

  res.json({
    token,
    user: userSchema.parse({
      id: user.id,
      email: user.email,
      name: user.name,
    }),
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(TOKEN_COOKIE, { path: "/" });
  res.status(204).send();
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const membership = await getMembershipSnapshot(req.user!.id);
  res.json(
    meResponseSchema.parse({
      user: userSchema.parse(req.user),
      membership,
    }),
  );
});

router.delete("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const userId = req.user!.id;

  const userRooms = await db
    .select({
      originalImagePath: rooms.originalImagePath,
    })
    .from(rooms)
    .where(eq(rooms.userId, userId));

  const userRedesigns = await db
    .select({
      resultImagePath: redesigns.resultImagePath,
    })
    .from(redesigns)
    .where(eq(redesigns.userId, userId));

  const imagePaths = [
    ...userRooms.map((room) => room.originalImagePath),
    ...userRedesigns.map((redesign) => redesign.resultImagePath),
  ];

  const { deleteStoredImage } = await import("../services/storage");
  await Promise.allSettled(imagePaths.map((imagePath) => deleteStoredImage(imagePath)));

  const [deleted] = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
  if (!deleted) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  res.clearCookie(TOKEN_COOKIE, { path: "/" });
  res.status(204).send();
});

export default router;
