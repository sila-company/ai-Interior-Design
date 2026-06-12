import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Redirect, useRoute } from "wouter";

import { useAppFlow } from "@/context/AppFlowContext";
import { createRedesign, redesignToDataUrl } from "@/lib/api";

const statusMessages = [
  "Analyzing your room…",
  "Applying your style…",
  "Refining materials and lighting…",
  "Almost there…",
];

export function GeneratingPage() {
  const [, params] = useRoute("/rooms/:roomId/generating");
  const { room, selectedStyle, completeGeneration } = useAppFlow();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState(statusMessages[0]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!room || !selectedStyle || errorMessage) return;
    if (room.id !== params?.roomId) return;

    let cancelled = false;
    let statusIndex = 0;

    const statusTimer = window.setInterval(() => {
      statusIndex = (statusIndex + 1) % statusMessages.length;
      setStatusText(statusMessages[statusIndex] ?? statusMessages[0]);
    }, 3000);

    void (async () => {
      try {
        const result = await createRedesign(room.id, selectedStyle.id);
        if (cancelled) return;
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
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(statusTimer);
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
      <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <p className="mb-2 text-[22px] font-semibold text-[#1D1D1F]">
          Generation failed
        </p>
        <p className="mb-6 text-[15px] text-[#6E6E73]">{errorMessage}</p>
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setStatusText(statusMessages[0]);
            setAttempt((value) => value + 1);
          }}
          className="w-full max-w-xs rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const Icon = selectedStyle.Icon;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="relative mb-7 flex h-[72px] w-[72px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-black/[0.06]" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
      </div>

      <h2 className="mb-2.5 text-[22px] font-semibold text-[#1D1D1F]">
        Creating your redesign
      </h2>
      <p className="mb-6 text-[16px] text-[#6E6E73]">{statusText}</p>

      <div className="inline-flex items-center gap-2 rounded-full bg-[#0071E3]/[0.08] px-3.5 py-2 text-[14px] font-medium text-[#0071E3]">
        <Icon className="h-4 w-4" />
        {selectedStyle.name}
      </div>
    </div>
  );
}
