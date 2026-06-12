import { Redirect } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { useAppFlow } from "@/context/AppFlowContext";

export function SummaryPage() {
  const { roomImageUrl, selectedStyle, beginGeneration } = useAppFlow();

  if (!roomImageUrl) {
    return <Redirect to="/" />;
  }

  if (!selectedStyle) {
    return <Redirect to="/style" />;
  }

  const Icon = selectedStyle.Icon;

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Summary" backTo="/style" />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">
          Ready to redesign
        </h2>
        <p className="mb-6 text-[17px] leading-7 text-[#6E6E73]">
          We&apos;ll send your room photo to OpenAI and generate a{" "}
          {selectedStyle.name.toLowerCase()} redesign.
        </p>

        <section className="mb-4 rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_6px_12px_rgba(0,0,0,0.05)]">
          <p className="mb-3 text-[13px] font-medium tracking-[0.12em] text-[#6E6E73] uppercase">
            Your room
          </p>
          <img
            src={roomImageUrl}
            alt="Your room"
            className="h-[180px] w-full rounded-2xl object-cover"
          />
        </section>

        <section className="mb-8 rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_6px_12px_rgba(0,0,0,0.05)]">
          <p className="mb-3 text-[13px] font-medium tracking-[0.12em] text-[#6E6E73] uppercase">
            Style
          </p>
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
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
        </section>

        <button
          type="button"
          onClick={beginGeneration}
          className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
        >
          Generate redesign
        </button>
      </div>
    </div>
  );
}
