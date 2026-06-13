import { Redirect, useRoute } from "wouter";

import { BeforeAfterCompare } from "@/components/BeforeAfterCompare";
import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";

export function ResultsPage() {
  const [, params] = useRoute("/rooms/:roomId/results");
  const {
    room,
    selectedStyle,
    redesignedImageUrl,
    savedRedesignId,
    tryAnotherStyle,
    startOver,
  } = useAppFlow();

  if (!room || room.id !== params?.roomId || !redesignedImageUrl) {
    return <Redirect to="/rooms" />;
  }

  const shareImage = async () => {
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
            text: `My ${room.name} redesign`,
            files: [file],
          });
          return;
        }
      }
    } catch {
      // fall through to download
    }

    const link = document.createElement("a");
    link.href = redesignedImageUrl;
    link.download = `atelier-${room.name}.png`;
    link.click();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Results" showBack={false} />

      <PageFrame className="flex-1">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="mb-6">
              <h2 className="mb-2 text-[30px] font-semibold text-[#1D1D1F]">
                {room.name}
              </h2>
              {selectedStyle ? (
                <p className="text-[17px] text-[#6E6E73]">
                  {savedRedesignId
                    ? `${selectedStyle.name} style - saved to your account.`
                    : `${selectedStyle.name} style saved to your account.`}
                </p>
              ) : null}
            </div>

            <BeforeAfterCompare
              beforeSrc={room.originalImageUrl}
              afterSrc={redesignedImageUrl}
            />

            <p className="mt-4 text-center text-[14px] text-[#6E6E73]">
              Drag the slider to compare your original room with the redesign.
            </p>
          </section>

          <Surface className="h-fit p-5">
            <p className="mb-3 text-[13px] font-medium uppercase text-[#6E6E73]">
              Next steps
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void shareImage()}
                className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
              >
                Share redesign
              </button>

              <button
                type="button"
                onClick={tryAnotherStyle}
                className="w-full rounded-full bg-[#0071E3]/[0.06] px-4 py-3.5 text-[15px] font-medium text-[#0071E3]"
              >
                Try another style
              </button>

              <button
                type="button"
                onClick={startOver}
                className="w-full rounded-full bg-black/[0.04] px-4 py-3.5 text-[15px] font-medium text-[#1D1D1F]"
              >
                Back to rooms
              </button>
            </div>
          </Surface>
        </div>
      </PageFrame>
    </div>
  );
}
