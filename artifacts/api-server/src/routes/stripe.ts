import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { getDb, users } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { stripe } from "../services/stripe";

const router: IRouter = Router();

const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// ── POST /api/subscription/stripe/checkout ────────────────────────────────────
// Creates (or reuses) a Stripe Customer then returns a Checkout session URL.
router.post("/checkout", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const db = getDb();

  const [userRow] = await db
    .select({
      email: users.email,
      name: users.name,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  let customerId = userRow.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userRow.email,
      name: userRow.name,
      metadata: { userId },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId));
  }

  const origin = (req.headers.origin as string | undefined) ?? `https://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Do NOT pass payment_method_types — Stripe dynamically selects the best
    // eligible methods per customer to maximize conversion.
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/membership`,
  });

  res.json({ url: session.url });
});

// ── POST /api/subscription/stripe/portal ──────────────────────────────────────
// Returns a Stripe Billing Portal URL so the user can manage their subscription.
router.post("/portal", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const db = getDb();

  const [userRow] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow?.stripeCustomerId) {
    res.status(400).json({ message: "No Stripe billing account found." });
    return;
  }

  const origin = (req.headers.origin as string | undefined) ?? `https://${req.headers.host}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: userRow.stripeCustomerId,
    return_url: `${origin}/membership`,
  });

  res.json({ url: session.url });
});

// ── POST /api/webhooks/stripe ─────────────────────────────────────────────────
// Registered in app.ts with express.raw() BEFORE express.json() so that the
// raw body Buffer is available for Stripe's signature verification.
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(400).json({ message: "Missing stripe-signature header." });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.error({ err }, "Stripe webhook signature verification failed");
    res.status(400).json({ message: "Webhook signature invalid." });
    return;
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    logger.error({ err, type: event.type }, "Stripe webhook handler error");
    res.status(500).json({ message: "Webhook handler error." });
    return;
  }

  res.json({ received: true });
}

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const db = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) break;
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      await upsertStripeSubscription(db, session.customer as string, subscription);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertStripeSubscription(db, subscription.customer as string, subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db
        .update(users)
        .set({
          subscriptionStatus: "expired",
          stripeSubscriptionId: subscription.id,
          subscriptionProvider: "stripe",
        })
        .where(eq(users.stripeCustomerId, subscription.customer as string));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // In Stripe v22 the subscription reference lives under parent.subscription_details
      const invoiceSub = invoice.parent?.subscription_details?.subscription;
      if (!invoiceSub) break;
      await db
        .update(users)
        .set({ subscriptionStatus: "grace", subscriptionProvider: "stripe" })
        .where(eq(users.stripeCustomerId, invoice.customer as string));
      break;
    }

    default:
      break;
  }
}

async function upsertStripeSubscription(
  db: ReturnType<typeof getDb>,
  customerId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  const status: string = isActive
    ? "active"
    : subscription.status === "past_due"
      ? "grace"
      : "expired";
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price.id ?? null;
  // In Stripe v22, current_period_end moved to the SubscriptionItem level
  const periodEnd = firstItem?.current_period_end;
  const expiresAt = periodEnd ? new Date(periodEnd * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      subscriptionStatus: status,
      subscriptionProductId: priceId,
      subscriptionExpiresAt: expiresAt,
      stripeSubscriptionId: subscription.id,
      subscriptionProvider: "stripe",
    })
    .where(eq(users.stripeCustomerId, customerId));
}

export { router as stripeSubscriptionRouter };
