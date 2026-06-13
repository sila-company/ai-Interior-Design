import { CheckCircle2 } from "lucide-react";

import type { DesignStyle } from "@/lib/styles";

interface StyleCardProps {
  style: DesignStyle;
  isSelected: boolean;
  onSelect: () => void;
}

export function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  const Icon = style.Icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-lg bg-white p-3 text-left transition-all duration-200",
        isSelected
          ? "scale-[1.01] border-2 border-[#0071E3] shadow-[0_6px_16px_rgba(0,0,0,0.10)]"
          : "border border-black/[0.06] shadow-sm hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className="relative mb-3">
        <div
          className="flex h-[96px] items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`,
          }}
        >
          <Icon className="h-7 w-7 text-[#1D1D1F]/55" strokeWidth={1.5} />
        </div>
        {isSelected ? (
          <CheckCircle2 className="absolute top-2 right-2 h-[22px] w-[22px] fill-[#0071E3] text-white" />
        ) : null}
      </div>

      <div className="space-y-1">
        <p className="text-[16px] font-semibold text-[#1D1D1F]">{style.name}</p>
        <p className="line-clamp-2 text-[13px] leading-5 text-[#6E6E73]">
          {style.description}
        </p>
      </div>
    </button>
  );
}
