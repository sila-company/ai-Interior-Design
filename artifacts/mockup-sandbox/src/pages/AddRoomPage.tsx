import { Camera, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Redirect } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import { useAuth } from "@/context/AuthContext";
import { createRoom } from "@/lib/api";

export function AddRoomPage() {
  const { user, isLoading } = useAuth();
  const { beginNewRedesign } = useAppFlow();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [includesDimensions, setIncludesDimensions] = useState(false);
  const [dimensionUnit, setDimensionUnit] = useState<"meters" | "feet">(
    "meters",
  );
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [includesBudget, setIncludesBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="New room" backTo="/rooms" />
      <PageFrame className="flex-1">
        <div className="mb-6 lg:hidden">
          <h2 className="text-[30px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
            Set up your room
          </h2>
          <p className="mt-2 text-[17px] leading-7 text-[#6E6E73]">
            Add a photo, describe the vibe, and include optional size or budget
            details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <Surface className="p-5 sm:p-6 lg:sticky lg:top-8">
            <div className="hidden lg:block">
              <h2 className="text-[32px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                Set up your room
              </h2>
              <p className="mt-2 text-[17px] leading-7 text-[#6E6E73]">
                Add a photo, describe the vibe, and include optional size or
                budget details.
              </p>
            </div>

            <div className="space-y-5 lg:mt-7">
              <label className="block">
                <span className="mb-2 block text-[15px] font-semibold text-[#1D1D1F]">
                  Room name
                </span>
                <input
                  className="w-full rounded-[16px] border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Living room"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[15px] font-semibold text-[#1D1D1F]">
                  What should this room feel like?
                </span>
                <textarea
                  className="min-h-28 w-full resize-y rounded-[16px] border border-black/[0.08] bg-white px-4 py-3 text-[16px] leading-6 outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Calm reading nook with warm wood and soft lighting"
                />
              </label>

              <div className="rounded-[18px] bg-[#F5F5F7] p-4">
                <ToggleRow
                  label="Add room dimensions"
                  checked={includesDimensions}
                  onChange={setIncludesDimensions}
                />
                {includesDimensions ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 rounded-full bg-black/[0.04] p-1">
                      {(["meters", "feet"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setDimensionUnit(unit)}
                          className={[
                            "rounded-full px-3 py-2 text-[14px] font-medium capitalize transition",
                            dimensionUnit === unit
                              ? "bg-white text-[#1D1D1F] shadow-sm"
                              : "text-[#6E6E73]",
                          ].join(" ")}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <DimensionField
                        label="Length"
                        value={length}
                        onChange={setLength}
                      />
                      <DimensionField
                        label="Width"
                        value={width}
                        onChange={setWidth}
                      />
                      <DimensionField
                        label="Height"
                        value={height}
                        onChange={setHeight}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[18px] bg-[#F5F5F7] p-4">
                <ToggleRow
                  label="Set a furnishing budget"
                  checked={includesBudget}
                  onChange={setIncludesBudget}
                />
                {includesBudget ? (
                  <label className="mt-4 block">
                    <span className="mb-2 block text-[13px] text-[#6E6E73]">
                      Budget in USD
                    </span>
                    <input
                      inputMode="numeric"
                      className="w-full rounded-[14px] border border-black/[0.06] bg-white px-4 py-3 text-[16px] outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
                      value={budgetAmount}
                      onChange={(event) => setBudgetAmount(event.target.value)}
                      placeholder="5000"
                    />
                  </label>
                ) : null}
              </div>

              {error ? (
                <p className="rounded-[14px] bg-red-50 px-3 py-2 text-[14px] text-red-700">
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
                  void createRoom(
                    {
                      name: name.trim(),
                      description: description.trim(),
                      length: includesDimensions ? length.trim() : "",
                      width: includesDimensions ? width.trim() : "",
                      height: includesDimensions ? height.trim() : "",
                      dimensionUnit: includesDimensions
                        ? dimensionUnit
                        : undefined,
                      budgetAmount: includesBudget ? budgetAmount.trim() : "",
                      budgetCurrency: "USD",
                    },
                    file,
                  )
                    .then((room) => beginNewRedesign(room))
                    .catch((err: unknown) => {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Could not save room.",
                      );
                      setIsSubmitting(false);
                    });
                }}
                className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(0,113,227,0.18)] transition disabled:bg-black/[0.06] disabled:text-[#86868B] disabled:shadow-none"
              >
                {isSubmitting ? "Saving room..." : "Save and continue"}
              </button>
            </div>
          </Surface>

          <div>
            <p className="mb-3 hidden text-[15px] font-semibold text-[#1D1D1F] lg:block">
              Room photo
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="block w-full overflow-hidden rounded-[20px] border border-black/[0.06] bg-white text-left shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(0,0,0,0.08)]"
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                      <ImageIcon className="h-6 w-6 text-[#86868B]" />
                    </div>
                    <span className="text-[16px] font-medium text-[#86868B]">
                      Add room photo
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[15px] font-semibold text-[#1D1D1F]">
                    {file ? file.name : "Choose photo"}
                  </p>
                  <p className="mt-1 text-[13px] text-[#6E6E73]">
                    Upload a clear, well-lit room image.
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-[#1D1D1F]">
                  <Camera className="h-[18px] w-[18px]" />
                </div>
              </div>
            </button>
          </div>
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

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-[15px] font-semibold text-[#1D1D1F]">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#0071E3]"
      />
    </label>
  );
}

function DimensionField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-[#6E6E73]">{label}</span>
      <input
        inputMode="decimal"
        className="w-full rounded-[12px] border border-black/[0.06] bg-white px-3 py-2.5 text-[15px] outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
      />
    </label>
  );
}
