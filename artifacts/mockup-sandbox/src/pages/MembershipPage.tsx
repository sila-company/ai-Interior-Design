import {
  BadgeCheck,
  Boxes,
  ExternalLink,
  Images,
  Lock,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, Redirect } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";
import { createStripeCheckout, getStripePortal, type MembershipStatus } from "@/lib/api";

const monthlyPrice = "$19.99";

function membershipSummary(membership: MembershipStatus | null): string {
  if (!membership) return "Checking membership...";
  if (membership.isActive) {
    if (membership.expiresAt) {
      return `Member — renews ${new Date(membership.expiresAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    return "Atelier Member";
  }

  if (membership.freeRemaining > 0) {
    const total = Math.max(membership.redesignCount + membership.freeRemaining, 2);
    return `${membership.freeRemaining} of ${total} free redesigns remaining`;
  }

  return "Subscribe for unlimited redesigns";
}

function footerCopy(membership: MembershipStatus | null): string {
  if (membership?.isActive && membership.provider === "apple") {
    return "Payment charged to your Apple ID. Subscription renews unless canceled at least 24 hours before the current period ends. Manage in Settings → Apple ID → Subscriptions.";
  }
  if (membership?.isActive && membership.provider === "stripe") {
    return "Your subscription is managed through Stripe. Use the billing portal to update payment details or cancel.";
  }
  return "Subscription renews monthly. Cancel anytime before the next billing date.";
}

export function MembershipPage() {
  const { user, membership, isLoading } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isLoading && !user) {
    return <Redirect to="/login" />;
  }

  async function handleSubscribe() {
    setActionError(null);
    setCheckoutLoading(true);
    try {
      const { url } = await createStripeCheckout();
      window.location.href = url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  }

  async function handleManageBilling() {
    setActionError(null);
    setPortalLoading(true);
    try {
      const { url } = await getStripePortal();
      window.location.href = url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPortalLoading(false);
    }
  }

  const isAppleMember = membership?.isActive && membership.provider === "apple";
  const isStripeMember = membership?.isActive && membership.provider === "stripe";
  const isNotSubscribed = !membership?.isActive;

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Membership" backTo="/account" />
      <PageFrame className="flex-1">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <section>
            <div className="mb-6">
              <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#86868B]">
                Atelier
              </p>
              <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                Atelier Membership
              </h1>
              <p className="mt-2 text-[17px] leading-7 text-[#6E6E73]">
                {monthlyPrice}/month · cancel anytime
              </p>
            </div>

            <Surface className="p-5 sm:p-6">
              <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
                What's included
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Benefit
                  icon={<Sparkles className="h-[18px] w-[18px]" />}
                  text="Unlimited AI room redesigns"
                />
                <Benefit
                  icon={<Boxes className="h-[18px] w-[18px]" />}
                  text="Save unlimited rooms and designs"
                />
                <Benefit
                  icon={<ShoppingBag className="h-[18px] w-[18px]" />}
                  text="Shoppable product suggestions"
                />
                <Benefit
                  icon={<Images className="h-[18px] w-[18px]" />}
                  text="Before/after comparisons"
                />
              </div>
            </Surface>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-8 lg:pt-28">
            <Surface className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0071E3]/[0.08] text-[#0071E3]">
                {membership?.isActive ? (
                  <BadgeCheck className="h-6 w-6" />
                ) : (
                  <Lock className="h-6 w-6" />
                )}
              </div>

              <h2 className="text-[20px] font-semibold text-[#1D1D1F]">
                {membership?.isActive ? "You're a member" : "Membership status"}
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-[#6E6E73]">
                {membershipSummary(membership)}
              </p>

              {/* Active — subscribed via Apple (manage through Apple ID) */}
              {isAppleMember && (
                <a
                  href="https://apps.apple.com/account/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(0,113,227,0.18)]"
                >
                  Manage subscription
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              {/* Active — subscribed via Stripe (manage through billing portal) */}
              {isStripeMember && (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(0,113,227,0.18)] disabled:opacity-60"
                >
                  {portalLoading ? "Loading…" : "Manage billing"}
                  {!portalLoading && <ExternalLink className="h-4 w-4" />}
                </button>
              )}

              {/* Not subscribed — Stripe checkout */}
              {isNotSubscribed && (
                <button
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(0,113,227,0.18)] disabled:opacity-60"
                >
                  {checkoutLoading ? "Loading…" : `Subscribe · ${monthlyPrice}/month`}
                </button>
              )}

              {actionError && (
                <p className="mt-3 text-[13px] text-red-500">{actionError}</p>
              )}

              {isAppleMember && (
                <p className="mt-3 text-[12px] leading-5 text-[#86868B]">
                  This membership was purchased through the iOS app and is managed via Apple ID.
                </p>
              )}
            </Surface>

            <div className="text-[13px] leading-5 text-[#6E6E73]">
              {footerCopy(membership)}
              <div className="mt-3 flex gap-4 font-medium">
                <Link href="/privacy" className="text-[#0071E3]">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-[#0071E3]">
                  Terms of Use
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </PageFrame>
    </div>
  );
}

function Benefit({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0071E3]/[0.08] text-[#0071E3]">
        {icon}
      </div>
      <p className="text-[15px] font-medium text-[#1D1D1F]">{text}</p>
    </div>
  );
}
