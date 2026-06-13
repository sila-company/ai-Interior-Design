import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Redirect, useRoute } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { StyleCard } from "@/components/StyleCard";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import { listDesignStyles } from "@/lib/api";
import type { DesignStyle } from "@/lib/styles";

export function StyleSelectionPage() {
  const [, params] = useRoute("/rooms/:roomId/style");
  const { room, selectStyle } = useAppFlow();
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);

  const stylesQuery = useQuery({
    queryKey: ["styles"],
    queryFn: listDesignStyles,
  });

  useEffect(() => {
    setSelectedStyle(null);
  }, [params?.roomId]);

  if (!room || room.id !== params?.roomId) {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Style" backTo={`/rooms/${room.id}`} />

      <PageFrame className="flex-1 pb-28 lg:pb-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-6">
              <h2 className="mb-2 text-[30px] font-semibold text-[#1D1D1F]">
                Choose your style
              </h2>
              <p className="text-[17px] text-[#6E6E73]">
                Pick the mood you want for your redesign.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stylesQuery.data?.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  isSelected={selectedStyle?.id === style.id}
                  onSelect={() => setSelectedStyle(style)}
                />
              ))}
            </div>
          </section>

          <aside className="hidden lg:block">
            <Surface className="sticky top-24 p-4">
              <div className="mb-4 flex items-center gap-3.5">
                <img
                  src={room.originalImageUrl}
                  alt={room.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div>
                  <p className="text-[15px] font-semibold text-[#1D1D1F]">
                    {room.name}
                  </p>
                  <p
                    className={
                      selectedStyle
                        ? "text-[14px] text-[#0071E3]"
                        : "text-[14px] text-[#86868B]"
                    }
                  >
                    {selectedStyle?.name ?? "Select a style"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={!selectedStyle}
                onClick={() => selectedStyle && selectStyle(selectedStyle)}
                className={[
                  "w-full rounded-full px-4 py-3.5 text-[15px] font-medium transition-colors",
                  selectedStyle
                    ? "bg-[#0071E3] text-white"
                    : "cursor-not-allowed bg-black/[0.06] text-[#86868B]",
                ].join(" ")}
              >
                Continue
              </button>
            </Surface>
          </aside>
        </div>
      </PageFrame>

      <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          disabled={!selectedStyle}
          onClick={() => selectedStyle && selectStyle(selectedStyle)}
          className={[
            "w-full rounded-full px-4 py-3.5 text-[15px] font-medium transition-colors",
            selectedStyle
              ? "bg-[#0071E3] text-white"
              : "cursor-not-allowed bg-black/[0.06] text-[#86868B]",
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
