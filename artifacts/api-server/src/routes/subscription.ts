import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import { getDb, users } from "@workspace/db";
import { getMembershipSnapshot } from "../lib/entitlement";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";
import { verifySignedTransaction } from "../services/apple-iap";

const router: IRouter = Router();

const syncBodySchema = z.object({
  signedTransaction: z.string().min(1),
});

const statusSchema = z.object({
  isActive: z.boolean(),
  freeRemaining: z.number(),
  expiresAt: z.string().nullable(),
  redesignCount: z.number(),
  productId: z.string().nullable(),
  provider: z.enum(["apple", "stripe"]).nullable(),
});

router.use(requireAuth);

router.get("/status", async (req: AuthenticatedRequest, res) => {
  const membership = await getMembershipSnapshot(req.user!.id);
  res.json(statusSchema.parse(membership));
});

router.post("/sync", async (req: AuthenticatedRequest, res) => {
  const parsed = syncBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "signedTransaction is required." });
    return;
  }

  try {
    const verified = await verifySignedTransaction(parsed.data.signedTransaction);
    const db = getDb();

    const [updated] = await db
      .update(users)
      .set({
        subscriptionStatus: verified.status,
        subscriptionProductId: verified.productId,
        subscriptionExpiresAt: verified.expiresAt,
        appleOriginalTransactionId: verified.originalTransactionId,
      })
      .where(eq(users.id, req.user!.id))
      .returning({ id: users.id });

    if (!updated) {
      res.status(500).json({ message: "Could not update subscription." });
      return;
    }

    const membership = await getMembershipSnapshot(req.user!.id);
    res.json(statusSchema.parse(membership));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not verify signed transaction.";
    res.status(400).json({ message });
  }
});

export default router;
