import { useState } from "react";
import { Redirect } from "wouter";

import { BeforeAfterCompare } from "@/components/BeforeAfterCompare";
import { MobileNavBar } from "@/components/MobileNavBar";
import { useAppFlow } from "@/context/AppFlowContext";

type SaveState = "idle" | "saved" | "failed";

export function ResultsPage() {
  const {
    roomImageUrl,
    redesignedImageUrl,
    selectedStyle,
    tryAnotherStyle,
    startOver,
  } = useAppFlow();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  if (!roomImageUrl || !redesignedImageUrl) {
    return <Redirect to="/" />;
  }

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = redesignedImageUrl;
    link.download = `atelier-${selectedStyle?.id ?? "redesign"}.png`;
    link.click();
    setSaveState("saved");
  };

  const shareImage = async () => {
    if (!redesignedImageUrl) return;

    try {
      if (navigator.share) {
        const response = await fetch(redesignedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], "atelier-redesign.png", {
          type: blob.type || "image/png",
        });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "Atelier redesign",
            text: "Check out my AI interior redesign.",
            files: [file],
          });
          return;
        }
      }

      downloadImage();
    } catch {
      downloadImage();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Results" showBack={false} />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">
            Your redesign
          </h2>
          {selectedStyle ? (
            <p className="text-[17px] text-[#6E6E73]">
              {selectedStyle.name} style applied to your room.
            </p>
          ) : null}
        </div>

        <BeforeAfterCompare
          beforeSrc={roomImageUrl}
          afterSrc={redesignedImageUrl}
        />

        <p className="mt-4 text-center text-[14px] text-[#6E6E73]">
          Drag the slider to compare your original room with the redesign.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={downloadImage}
            className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
          >
            {saveState === "saved" ? "Downloaded" : "Save redesign"}
          </button>

          <button
            type="button"
            onClick={() => void shareImage()}
            className="w-full rounded-full bg-[#0071E3]/[0.06] px-4 py-3.5 text-[15px] font-medium text-[#0071E3]"
          >
            Share redesign
          </button>

          <button
            type="button"
            onClick={tryAnotherStyle}
            className="w-full rounded-full bg-black/[0.04] px-4 py-3.5 text-[15px] font-medium text-[#1D1D1F]"
          >
            Try another style
          </button>

          <button
            type="button"
            onClick={startOver}
            className="w-full px-4 py-2.5 text-[15px] text-[#6E6E73]"
          >
            Start over
          </button>
        </div>

        {saveState === "saved" ? (
          <p className="mt-4 text-center text-[14px] text-[#6E6E73]">
            Image saved to your downloads.
          </p>
        ) : null}
      </div>
    </div>
  );
}
