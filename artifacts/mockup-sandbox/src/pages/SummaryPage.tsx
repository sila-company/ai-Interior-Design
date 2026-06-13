import { Redirect, useRoute } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";

export function SummaryPage() {
  const [, params] = useRoute("/rooms/:roomId/summary");
  const { room, selectedStyle, beginGeneration } = useAppFlow();

  if (!room || room.id !== params?.roomId) {
    return <Redirect to="/rooms" />;
  }

  if (!selectedStyle) {
    return <Redirect to={`/rooms/${room.id}/style`} />;
  }

  const Icon = selectedStyle.Icon;

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Summary" backTo={`/rooms/${room.id}/style`} />

      <PageFrame className="flex-1">
        <div className="mb-6 max-w-3xl">
          <h2 className="mb-2 text-[30px] font-semibold text-[#1D1D1F]">
            Ready to redesign
          </h2>
          <p className="text-[17px] leading-7 text-[#6E6E73]">
            We will redesign <strong>{room.name}</strong> in a{" "}
            {selectedStyle.name.toLowerCase()} style and save it to your
            account.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Surface className="overflow-hidden">
            <img
              src={room.originalImageUrl}
              alt={room.name}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-5">
              <p className="mb-2 text-[13px] font-medium uppercase text-[#6E6E73]">
                Your room
              </p>
              <h3 className="text-[22px] font-semibold text-[#1D1D1F]">
                {room.name}
              </h3>
            </div>
          </Surface>

          <Surface className="p-5">
            <p className="mb-3 text-[13px] font-medium uppercase text-[#6E6E73]">
              Style
            </p>
            <div className="mb-6 flex items-center gap-3.5">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${selectedStyle.gradient[0]}, ${selectedStyle.gradient[1]})`,
                }}
              >
                <Icon className="h-[22px] w-[22px] text-[#1D1D1F]/60" />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-[#1D1D1F]">
                  {selectedStyle.name}
                </p>
                <p className="text-[14px] text-[#6E6E73]">
                  {selectedStyle.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={beginGeneration}
              className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
            >
              Generate redesign
            </button>
          </Surface>
        </div>
      </PageFrame>
    </div>
  );
}
