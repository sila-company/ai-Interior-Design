import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAppFlow } from "@/context/AppFlowContext";

export function LandingPage() {
  const { beginWithRoom, roomImageUrl } = useAppFlow();
  const [appeared, setAppeared] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(roomImageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppeared(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== roomImageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, roomImageUrl]);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);
    try {
      if (previewUrl && previewUrl !== roomImageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-10">
        <header
          className={[
            "flex items-center justify-between pb-8 pt-2 transition-all duration-700",
            appeared ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
          ].join(" ")}
        >
          <span className="text-[17px] font-semibold tracking-[-0.3px]">
            Atelier
          </span>
          <button
            type="button"
            className="rounded-full bg-black/[0.04] px-4 py-2 text-[14px] text-[#1D1D1F]"
          >
            Sign in
          </button>
        </header>

        <section
          className={[
            "transition-all duration-700",
            appeared ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
          ].join(" ")}
          style={{ transitionDelay: "80ms" }}
        >
          <p className="mb-5 text-center text-[13px] font-medium tracking-[0.28em] text-[#86868B] uppercase">
            AI Interior Design
          </p>

          <h1 className="mb-4 text-center text-[44px] leading-[1.05] font-semibold tracking-[-0.04em] text-[#1D1D1F]">
            Your space,
            <br />
            reimagined.
          </h1>

          <p className="mb-8 px-2 text-center text-[19px] leading-7 text-[#6E6E73]">
            Upload a photo of any room and explore calm, thoughtful redesigns in
            seconds.
          </p>

          <div className="mb-12 space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
            >
              {previewUrl ? "Change photo" : "Upload a room photo"}
            </button>

            {previewUrl && selectedFile ? (
              <button
                type="button"
                onClick={() => beginWithRoom(selectedFile, previewUrl)}
                className="w-full rounded-full bg-[#0071E3]/[0.06] px-4 py-3.5 text-[15px] font-medium text-[#0071E3]"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full rounded-full bg-[#0071E3]/[0.06] px-4 py-3.5 text-[15px] text-[#0071E3]"
              >
                Take photo
              </button>
            )}
          </div>
        </section>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={[
            "block w-full overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-700",
            appeared ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
          ].join(" ")}
          style={{ transitionDelay: "240ms" }}
        >
          <div className="aspect-[16/10] w-full overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected room"
                className="h-full w-full object-cover"
              />
            ) : isLoading ? (
              <div className="flex h-full items-center justify-center bg-[#F5F5F7]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#86868B] border-t-transparent" />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F5F5F7] to-[#ECECF0]">
                <ImageIcon className="h-7 w-7 text-[#86868B]" strokeWidth={1.5} />
                <span className="text-[15px] text-[#86868B]">
                  Tap to add your room photo
                </span>
              </div>
            )}
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
    </div>
  );
}
