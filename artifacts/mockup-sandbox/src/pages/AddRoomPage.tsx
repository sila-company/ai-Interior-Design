import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Redirect, useLocation } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { useAuth } from "@/context/AuthContext";
import { useAppFlow } from "@/context/AppFlowContext";
import { createRoom } from "@/lib/api";

export function AddRoomPage() {
  const { user } = useAuth();
  const { beginWithRoom } = useAppFlow();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="New room" backTo="/rooms" />
      <div className="flex-1 px-6 py-6">
        <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">
          Name your room
        </h2>
        <p className="mb-6 text-[17px] text-[#6E6E73]">
          Give it a name you&apos;ll recognize, like &quot;Living room&quot; or
          &quot;Bedroom&quot;.
        </p>

        <label className="mb-4 block">
          <span className="mb-2 block text-[14px] text-[#6E6E73]">Room name</span>
          <input
            className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#0071E3]"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Living room"
          />
        </label>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mb-6 block w-full overflow-hidden rounded-[20px] border border-black/[0.06] bg-white"
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
                <ImageIcon className="h-7 w-7 text-[#86868B]" />
                <span className="text-[15px] text-[#86868B]">Add room photo</span>
              </div>
            )}
          </div>
        </button>

        {error ? <p className="mb-4 text-[14px] text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={!name.trim() || !file || isSubmitting}
          onClick={() => {
            if (!file) return;
            setIsSubmitting(true);
            setError(null);
            void createRoom(name.trim(), file)
              .then((room) => beginWithRoom(room))
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Could not save room.");
                setIsSubmitting(false);
              });
          }}
          className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white disabled:bg-black/[0.06] disabled:text-[#86868B]"
        >
          {isSubmitting ? "Saving room…" : "Save and continue"}
        </button>
      </div>

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
