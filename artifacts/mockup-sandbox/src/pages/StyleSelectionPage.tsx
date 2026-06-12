import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Redirect, useRoute } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { StyleCard } from "@/components/StyleCard";
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
      <MobileNavBar title="Style" backTo="/rooms" />

      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
        <div className="mb-6 flex items-center gap-3.5 rounded-[18px] border border-black/[0.06] bg-white p-3.5">
          <img
            src={room.originalImageUrl}
            alt={room.name}
            className="h-16 w-16 rounded-[14px] object-cover"
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
              {selectedStyle?.name ?? "Select a style below"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">
            Choose your style
          </h2>
          <p className="text-[17px] text-[#6E6E73]">
            Pick the mood you want for your redesign.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {stylesQuery.data?.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              isSelected={selectedStyle?.id === style.id}
              onSelect={() => setSelectedStyle(style)}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-black/10 bg-white/80 px-6 py-3 backdrop-blur-xl">
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
