import { AuthImage } from "@/components/AuthImage";
import { ArrowLeftRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeAfterCompareProps {
  beforeSrc: string;
  afterSrc: string;
}

export function BeforeAfterCompare({
  beforeSrc,
  afterSrc,
}: BeforeAfterCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0.5);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => setContainerWidth(container.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const next = (clientX - rect.left) / rect.width;
    setPosition(Math.min(0.95, Math.max(0.05, next)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-lg border border-black/[0.06] shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updatePosition(event.clientX);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        updatePosition(event.clientX);
      }}
    >
      <AuthImage
        src={afterSrc}
        alt="After redesign"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${position * 100}%` }}
      >
        <AuthImage
          src={beforeSrc}
          alt="Before redesign"
          className="h-full max-w-none object-cover"
          style={{ width: containerWidth || "100%" }}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/95 shadow-[0_0_4px_rgba(0,0,0,0.2)]"
        style={{ left: `calc(${position * 100}% - 1px)` }}
      />

      <div
        className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
        style={{ left: `${position * 100}%` }}
      >
        <ArrowLeftRight className="h-3.5 w-3.5 text-[#1D1D1F]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3">
        <span className="rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-semibold tracking-wide text-white uppercase">
          Before
        </span>
        <span className="rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-semibold tracking-wide text-white uppercase">
          After
        </span>
      </div>
    </div>
  );
}
