import { BadgeCheck, Home, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Redirect } from "wouter";

import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";
import { getMembershipStatus } from "@/lib/api";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

export function SubscriptionSuccessPage() {
  const { user, isLoading, refreshMembership } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const attempts = useRef(0);

  useEffect(() => {
    if (!user) return;

    const poll = async () => {
      attempts.current += 1;
      try {
        const status = await getMembershipStatus();
        if (status.isActive) {
          await refreshMembership();
          setConfirmed(true);
          return;
        }
      } catch {
        // retry on transient errors
      }

      if (attempts.current >= MAX_POLL_ATTEMPTS) {
        setTimedOut(true);
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    };

    const timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [user, refreshMembership]);

  if (!isLoading && !user) {
    return <Redirect to="/login" />;
  }

  return (
    <PageFrame className="flex min-h-dvh items-center justify-center">
      <div className="mx-auto w-full max-w-sm">
        <Surface className="p-8 text-center">
          {confirmed ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#0071E3]/[0.08] text-[#0071E3]">
                <BadgeCheck className="h-8 w-8" />
              </div>
              <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                You're a member!
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-[#6E6E73]">
                Your Atelier Membership is now active. Start creating unlimited
                AI room redesigns.
              </p>
              <Link
                href="/rooms"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(0,113,227,0.18)]"
              >
                <Home className="h-4 w-4" />
                Go to my rooms
              </Link>
            </>
          ) : timedOut ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#86868B]/[0.08] text-[#86868B]">
                <BadgeCheck className="h-8 w-8" />
              </div>
              <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                Payment received
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-[#6E6E73]">
                Your payment was successful. It may take a moment for your
                membership to activate — check back shortly.
              </p>
              <Link
                href="/membership"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(0,113,227,0.18)]"
              >
                View membership
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#0071E3]/[0.08] text-[#0071E3]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                Confirming your membership…
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-[#6E6E73]">
                Your payment was successful. Activating your membership — this
                only takes a moment.
              </p>
            </>
          )}
        </Surface>
      </div>
    </PageFrame>
  );
}
