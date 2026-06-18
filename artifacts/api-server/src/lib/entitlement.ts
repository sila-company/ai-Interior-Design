import { and, count, eq, gte } from "drizzle-orm";

import { getDb, redesigns, users } from "@workspace/db";

export type SubscriptionStatus = "none" | "active" | "expired" | "grace";

export interface UserSubscriptionRecord {
  subscriptionStatus: string;
  subscriptionProductId: string | null;
  subscriptionExpiresAt: Date | null;
  subscriptionProvider: string | null;
}

export interface MembershipSnapshot {
  isActive: boolean;
  freeRemaining: number;
  expiresAt: string | null;
  redesignCount: number;
  productId: string | null;
  subscriptionStatus: SubscriptionStatus;
  provider: "apple" | "stripe" | null;
}

export type RedesignEntitlementResult =
  | { allowed: true; membership: MembershipSnapshot }
  | {
      allowed: false;
      code: "subscription_required" | "daily_limit_reached";
      message: string;
      freeRemaining: 0;
    };

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function isSubscriptionActive(user: UserSubscriptionRecord): boolean {
  if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "grace") {
    return false;
  }

  if (!user.subscriptionExpiresAt) {
    return false;
  }

  return user.subscriptionExpiresAt.getTime() > Date.now();
}

function toSubscriptionStatus(value: string): SubscriptionStatus {
  if (
    value === "active" ||
    value === "expired" ||
    value === "grace" ||
    value === "none"
  ) {
    return value;
  }

  return "none";
}

export async function getRedesignCount(userId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(redesigns)
    .where(eq(redesigns.userId, userId));

  return Number(row?.value ?? 0);
}

async function getTodayRedesignCount(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(redesigns)
    .where(and(eq(redesigns.userId, userId), gte(redesigns.createdAt, startOfDay)));

  return Number(row?.value ?? 0);
}

export async function loadUserSubscription(
  userId: string,
): Promise<UserSubscriptionRecord | null> {
  const db = getDb();
  const [user] = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      subscriptionProductId: users.subscriptionProductId,
      subscriptionExpiresAt: users.subscriptionExpiresAt,
      subscriptionProvider: users.subscriptionProvider,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function getMembershipSnapshot(userId: string): Promise<MembershipSnapshot> {
  const subscription = await loadUserSubscription(userId);
  const redesignCount = await getRedesignCount(userId);
  const freeLimit = readPositiveIntegerEnv("FREE_REDESIGN_LIMIT", 2);
  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const freeRemaining = isActive ? 0 : Math.max(0, freeLimit - redesignCount);

  const rawProvider = subscription?.subscriptionProvider ?? null;
  const provider: "apple" | "stripe" | null =
    rawProvider === "apple" || rawProvider === "stripe" ? rawProvider : null;

  return {
    isActive,
    freeRemaining,
    expiresAt: subscription?.subscriptionExpiresAt?.toISOString() ?? null,
    redesignCount,
    productId: subscription?.subscriptionProductId ?? null,
    subscriptionStatus: toSubscriptionStatus(subscription?.subscriptionStatus ?? "none"),
    provider,
  };
}

export async function checkRedesignEntitlement(
  userId: string,
): Promise<RedesignEntitlementResult> {
  const membership = await getMembershipSnapshot(userId);

  if (membership.isActive) {
    const dailyCap = readPositiveIntegerEnv("SUBSCRIBER_DAILY_CAP", 50);
    const dailyCount = await getTodayRedesignCount(userId);

    if (dailyCount >= dailyCap) {
      return {
        allowed: false,
        code: "daily_limit_reached",
        message: "Daily redesign limit reached. Try again tomorrow.",
        freeRemaining: 0,
      };
    }

    return { allowed: true, membership };
  }

  const freeLimit = readPositiveIntegerEnv("FREE_REDESIGN_LIMIT", 2);
  if (membership.redesignCount < freeLimit) {
    return { allowed: true, membership };
  }

  return {
    allowed: false,
    code: "subscription_required",
    message: "Subscribe to Atelier Membership for unlimited redesigns.",
    freeRemaining: 0,
  };
}
