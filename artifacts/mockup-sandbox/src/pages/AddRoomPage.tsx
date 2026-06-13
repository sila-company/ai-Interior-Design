import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Redirect } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";
import { useAppFlow } from "@/context/AppFlowContext";
import { createRoom } from "@/lib/api";

export function AddRoomPage() {
  const { user } = useAuth();
  const { beginNewRedesign } = useAppFlow();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="New room" backTo="/rooms" />
      <PageFrame className="flex-1">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Surface className="p-6">
            <h2 className="mb-2 text-[30px] font-semibold text-[#1D1D1F]">
              Name your room
            </h2>
            <p className="mb-6 text-[17px] text-[#6E6E73]">
              Give it a name you will recognize, like "Living room" or
              "Bedroom".
            </p>

            <label className="mb-4 block">
              <span className="mb-2 block text-[14px] text-[#6E6E73]">
                Room name
              </span>
              <input
                className="w-full rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#0071E3]"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Living room"
              />
            </label>

            {error ? (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[14px] text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!name.trim() || !file || isSubmitting}
              onClick={() => {
                if (!file) return;
                setIsSubmitting(true);
                setError(null);
                void createRoom(name.trim(), file)
                  .then((room) => beginNewRedesign(room))
                  .catch((err: unknown) => {
                    setError(
                      err instanceof Error ? err.message : "Could not save room.",
                    );
                    setIsSubmitting(false);
                  });
              }}
              className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white disabled:bg-black/[0.06] disabled:text-[#86868B]"
            >
              {isSubmitting ? "Saving room..." : "Save and continue"}
            </button>
          </Surface>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="block overflow-hidden rounded-lg border border-black/[0.06] bg-white text-left shadow-sm"
          >
            <div className="aspect-[16/10] w-full">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Room preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#F5F5F7]">
                  <ImageIcon className="h-8 w-8 text-[#86868B]" />
                  <span className="text-[16px] text-[#86868B]">
                    Add room photo
                  </span>
                </div>
              )}
            </div>
          </button>
        </div>
      </PageFrame>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null;
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setFile(nextFile);
          setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
          event.target.value = "";
        }}
      />
    </div>
  );
}
