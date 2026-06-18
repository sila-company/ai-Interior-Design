import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, Redirect, useLocation, useRoute } from "wouter";

import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import { ApiError, createRedesign, redesignToDataUrl } from "@/lib/api";
import { bundleProducts, toRedesignProducts } from "@/lib/product-catalog";

const statusMessages = [
  "Analyzing your room...",
  "Matching shoppable products...",
  "Staging only inventory items...",
  "Rendering the final image...",
  "Waiting for the finished redesign...",
];

const estimatedGenerationMs = 70_000;
const initialProgress = 2;

function progressForElapsedTime(elapsedMs: number): number {
  const elapsedFraction = Math.min(elapsedMs / estimatedGenerationMs, 1);
  return Math.min(
    96,
    Math.max(initialProgress, Math.round(elapsedFraction * 96)),
  );
}

function statusForElapsedTime(elapsedMs: number): string {
  if (elapsedMs < 8_000) return statusMessages[0];
  if (elapsedMs < 20_000) return statusMessages[1];
  if (elapsedMs < 45_000) return statusMessages[2];
  if (elapsedMs < 90_000) return statusMessages[3];
  return statusMessages[4];
}

export function GeneratingPage() {
  const [, params] = useRoute("/rooms/:roomId/generating");
  const [, setLocation] = useLocation();
  const { room, selectedStyle, completeGeneration } = useAppFlow();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState(statusMessages[0]);
  const [progress, setProgress] = useState(initialProgress);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!room || !selectedStyle || errorMessage) return;
    if (room.id !== params?.roomId) return;

    let cancelled = false;
    const startedAt = Date.now();

    const progressTimer = window.setInterval(() => {
      const currentElapsed = Date.now() - startedAt;
      setProgress(progressForElapsedTime(currentElapsed));
      setStatusText(statusForElapsedTime(currentElapsed));
    }, 250);

    void (async () => {
      try {
        const products = toRedesignProducts(
          bundleProducts(room.name, selectedStyle.id),
        );
        const result = await createRedesign(
          room.id,
          selectedStyle.id,
          products,
        );
        if (cancelled) return;
        setProgress(100);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["rooms"] }),
          queryClient.invalidateQueries({ queryKey: ["redesigns"] }),
          queryClient.invalidateQueries({ queryKey: ["room", room.id] }),
        ]);
        completeGeneration(redesignToDataUrl(result));
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof ApiError && error.status === 402
            ? "subscription_required"
            : error instanceof Error
              ? error.message
              : "Generation failed.",
        );
      } finally {
        window.clearInterval(progressTimer);
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
    };
  }, [
    attempt,
    room,
    selectedStyle,
    completeGeneration,
    errorMessage,
    params?.roomId,
    queryClient,
  ]);

  if (!room || room.id !== params?.roomId || !selectedStyle) {
    return <Redirect to="/rooms" />;
  }

  if (errorMessage) {
    const isMembershipRequired = errorMessage === "subscription_required";

    return (
      <PageFrame className="flex min-h-dvh items-center justify-center">
        <Surface className="w-full max-w-md p-8 text-center">
          <p className="mb-2 text-[24px] font-semibold text-[#1D1D1F]">
            {isMembershipRequired ? "Membership required" : "Generation failed"}
          </p>
          <p className="mb-6 text-[15px] leading-6 text-[#6E6E73]">
            {isMembershipRequired
              ? "Subscribe to Atelier Membership for unlimited redesigns."
              : errorMessage}
          </p>
          {isMembershipRequired ? (
            <>
              <Link
                href="/membership"
                className="mb-3 inline-flex w-full items-center justify-center rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
              >
                View membership
              </Link>
              <button
                type="button"
                onClick={() => setLocation("/rooms")}
                className="w-full cursor-pointer rounded-full bg-black/[0.04] px-4 py-3.5 text-[15px] font-medium text-[#1D1D1F]"
              >
                Back to rooms
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setStatusText(statusMessages[0]);
                setProgress(initialProgress);
                setAttempt((value) => value + 1);
              }}
              className="w-full cursor-pointer rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
            >
              Try again
            </button>
          )}
        </Surface>
      </PageFrame>
    );
  }

  const Icon = selectedStyle.Icon;

  return (
    <PageFrame className="flex min-h-dvh items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center px-8 py-10 text-center">
        <div className="w-full max-w-[280px]">
          <p className="text-[34px] font-semibold leading-none text-[#1D1D1F] tabular-nums transition-all">
            {progress}%
          </p>
          <div
            aria-label="Generation progress"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.08]"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[#0071E3] transition-[width] duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-7 space-y-2.5">
          <h2 className="text-[22px] font-semibold text-[#1D1D1F]">
            Creating your redesign
          </h2>
          <p className="min-h-6 text-[16px] leading-6 text-[#6E6E73] transition-colors">
            {statusText}
          </p>
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0071E3]/[0.08] px-3.5 py-2 text-[14px] font-medium text-[#0071E3]">
          <Icon className="h-4 w-4" />
          {selectedStyle.name}
        </div>

        <p className="mt-7 max-w-[280px] text-[13px] leading-5 text-[#6E6E73]">
          Keep this tab open while Atelier creates the finished room.
        </p>
      </div>
    </PageFrame>
  );
}
