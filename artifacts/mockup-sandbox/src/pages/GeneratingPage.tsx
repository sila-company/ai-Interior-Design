import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Redirect, useRoute } from "wouter";

import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import { createRedesign, redesignToDataUrl } from "@/lib/api";
import { bundleProducts, toRedesignProducts } from "@/lib/product-catalog";

const statusMessages = [
  "Analyzing your room...",
  "Applying your style...",
  "Refining materials and lighting...",
  "Almost there...",
];

const estimatedGenerationMs = 45_000;
const initialProgress = 8;

function progressForElapsedTime(elapsedMs: number): number {
  const normalizedElapsed = Math.min(elapsedMs / estimatedGenerationMs, 1);
  const easedProgress = 1 - Math.pow(1 - normalizedElapsed, 2.15);
  const progressBeforeCap = initialProgress + easedProgress * 84;
  const overtimeProgress =
    elapsedMs > estimatedGenerationMs
      ? Math.min(
          ((elapsedMs - estimatedGenerationMs) / estimatedGenerationMs) * 4,
          4,
        )
      : 0;

  return Math.min(96, Math.round(progressBeforeCap + overtimeProgress));
}

function formatRemainingTime(elapsedMs: number): string {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((estimatedGenerationMs - elapsedMs) / 1000),
  );

  if (remainingSeconds === 0) return "Finalizing";
  if (remainingSeconds < 10) return "Under 10 sec";
  if (remainingSeconds < 60) return `${remainingSeconds} sec`;

  return "About 1 min";
}

export function GeneratingPage() {
  const [, params] = useRoute("/rooms/:roomId/generating");
  const { room, selectedStyle, completeGeneration } = useAppFlow();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState(statusMessages[0]);
  const [progress, setProgress] = useState(initialProgress);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!room || !selectedStyle || errorMessage) return;
    if (room.id !== params?.roomId) return;

    let cancelled = false;
    let statusIndex = 0;
    const startedAt = Date.now();

    const statusTimer = window.setInterval(() => {
      statusIndex = (statusIndex + 1) % statusMessages.length;
      setStatusText(statusMessages[statusIndex] ?? statusMessages[0]);
    }, 3000);

    const progressTimer = window.setInterval(() => {
      const currentElapsed = Date.now() - startedAt;
      setElapsedMs(currentElapsed);
      setProgress(progressForElapsedTime(currentElapsed));
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
        setElapsedMs(estimatedGenerationMs);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["rooms"] }),
          queryClient.invalidateQueries({ queryKey: ["redesigns"] }),
          queryClient.invalidateQueries({ queryKey: ["room", room.id] }),
        ]);
        completeGeneration(redesignToDataUrl(result));
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Generation failed.",
        );
      } finally {
        window.clearInterval(statusTimer);
        window.clearInterval(progressTimer);
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(statusTimer);
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
    return (
      <PageFrame className="flex min-h-dvh items-center justify-center">
        <Surface className="w-full max-w-md p-8 text-center">
          <p className="mb-2 text-[24px] font-semibold text-[#1D1D1F]">
            Generation failed
          </p>
          <p className="mb-6 text-[15px] text-[#6E6E73]">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setStatusText(statusMessages[0]);
              setProgress(initialProgress);
              setElapsedMs(0);
              setAttempt((value) => value + 1);
            }}
            className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
          >
            Try again
          </button>
        </Surface>
      </PageFrame>
    );
  }

  const Icon = selectedStyle.Icon;
  const remainingTime = formatRemainingTime(elapsedMs);

  return (
    <PageFrame className="flex min-h-dvh items-center justify-center">
      <Surface className="w-full max-w-xl overflow-hidden p-6 text-center sm:p-8">
        <div className="relative mx-auto mb-7 flex h-[96px] w-[96px] items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#0071E3 ${progress * 3.6}deg, rgba(0,113,227,0.1) 0deg)`,
            }}
          />
          <div className="absolute inset-[6px] rounded-full bg-white" />
          <div
            className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${selectedStyle.gradient[0]}, ${selectedStyle.gradient[1]})`,
            }}
          >
            <Icon className="h-7 w-7 text-[#1D1D1F]/70" />
          </div>
        </div>

        <h2 className="mb-2.5 text-[24px] font-semibold text-[#1D1D1F]">
          Creating your redesign
        </h2>
        <p className="mb-7 text-[16px] text-[#6E6E73]">{statusText}</p>

        <div className="mb-5">
          <div className="mb-2.5 flex items-end justify-between gap-4">
            <div className="text-left">
              <p className="text-[13px] font-medium uppercase tracking-wider text-[#6E6E73]">
                Progress
              </p>
              <p className="text-[14px] text-[#6E6E73]">
                Estimated time left: {remainingTime}
              </p>
            </div>
            <p className="text-[32px] font-semibold leading-none text-[#1D1D1F]">
              {progress}%
            </p>
          </div>

          <div
            aria-label="Generation progress"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="h-3 overflow-hidden rounded-full bg-black/[0.06]"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0071E3,#49B4FF,#B5E2FF)] shadow-[0_0_18px_rgba(0,113,227,0.28)] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
          {statusMessages.map((message, index) => {
            const stepProgress = ((index + 1) / statusMessages.length) * 100;
            const isActive = progress >= stepProgress - 18;

            return (
              <div
                key={message}
                className={`rounded-lg border px-3 py-2.5 transition-colors ${
                  isActive
                    ? "border-[#0071E3]/20 bg-[#0071E3]/[0.07] text-[#1D1D1F]"
                    : "border-black/[0.06] bg-black/[0.02] text-[#6E6E73]"
                }`}
              >
                <div
                  className={`mb-2 h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-[#0071E3]" : "bg-black/[0.14]"
                  }`}
                />
                <p className="text-[12px] font-medium leading-4">
                  {message.replace("...", "")}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0071E3]/[0.08] px-3.5 py-2 text-[14px] font-medium text-[#0071E3]">
          <Icon className="h-4 w-4" />
          {selectedStyle.name}
        </div>
      </Surface>
    </PageFrame>
  );
}
