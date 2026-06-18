import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Redirect, useRoute } from "wouter";

import { AuthImage } from "@/components/AuthImage";
import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import { deleteRedesign, getRoom, listDesignStyles, type Redesign } from "@/lib/api";

function RedesignCard({
  redesign,
  styleName,
  roomId,
  onView,
}: {
  redesign: Redesign;
  styleName: string;
  roomId: string;
  onView: () => void;
}) {
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteRedesign(redesign.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      void queryClient.invalidateQueries({ queryKey: ["redesigns"] });
    },
  });

  return (
    <div className="group relative overflow-hidden rounded-lg border border-black/[0.06] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button type="button" onClick={onView} className="w-full text-left">
        <AuthImage
          src={redesign.resultImageUrl}
          alt={styleName}
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="p-3">
          <p className="text-[14px] font-semibold text-[#1D1D1F]">
            {styleName}
          </p>
          <p className="mt-1 text-[12px] text-[#86868B]">
            {new Date(redesign.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </button>

      {confirmingDelete ? (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-white/95 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-[12px] text-[#1D1D1F]">Delete this redesign?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[12px] font-medium text-[#1D1D1F]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="rounded-full bg-red-500 px-2.5 py-1 text-[12px] font-medium text-white disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmingDelete(true);
          }}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
          aria-label="Delete redesign"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function RoomDetailPage() {
  const [, params] = useRoute("/rooms/:roomId");
  const roomId = params?.roomId;
  const { beginNewRedesign, viewSavedRedesign } = useAppFlow();

  const roomQuery = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId!),
    enabled: Boolean(roomId),
  });

  const stylesQuery = useQuery({
    queryKey: ["styles"],
    queryFn: listDesignStyles,
  });

  if (!roomId) {
    return <Redirect to="/rooms" />;
  }

  const room = roomQuery.data?.room;
  const redesigns = roomQuery.data?.redesigns ?? [];
  const styleNames = new Map(
    (stylesQuery.data ?? []).map((style) => [style.id, style.name]),
  );

  if (roomQuery.isLoading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <MobileNavBar title="Room" backTo="/rooms" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!room) {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#F5F5F7]">
      <MobileNavBar title={room.name} backTo="/rooms" />

      <PageFrame className="flex-1">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Surface className="overflow-hidden">
            <AuthImage
              src={room.originalImageUrl}
              alt={room.name}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-5">
              <h2 className="text-[28px] font-semibold text-[#1D1D1F]">
                {room.name}
              </h2>
              <p className="mt-1 text-[15px] text-[#6E6E73]">
                {redesigns.length} saved redesign
                {redesigns.length === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                onClick={() => beginNewRedesign(room)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white sm:w-auto sm:px-5"
              >
                <Plus className="h-4 w-4" />
                Create new redesign
              </button>
            </div>
          </Surface>

          <section>
            <h3 className="mb-4 text-[22px] font-semibold text-[#1D1D1F]">
              Saved designs
            </h3>

            {redesigns.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {redesigns.map((redesign) => (
                  <RedesignCard
                    key={redesign.id}
                    redesign={redesign}
                    styleName={styleNames.get(redesign.styleId) ?? redesign.styleId}
                    roomId={room.id}
                    onView={() => viewSavedRedesign(room, redesign)}
                  />
                ))}
              </div>
            ) : (
              <Surface className="p-8 text-center">
                <p className="text-[16px] font-medium text-[#1D1D1F]">
                  No redesigns yet
                </p>
                <p className="mt-2 text-[14px] text-[#6E6E73]">
                  Create your first redesign and it will appear here
                  automatically.
                </p>
              </Surface>
            )}
          </section>
        </div>
      </PageFrame>
    </div>
  );
}
