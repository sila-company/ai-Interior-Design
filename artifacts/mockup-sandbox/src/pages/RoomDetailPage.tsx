import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Redirect, useRoute } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import { getRoom, listDesignStyles } from "@/lib/api";

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
            <img
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
                  <button
                    key={redesign.id}
                    type="button"
                    onClick={() => viewSavedRedesign(room, redesign)}
                    className="overflow-hidden rounded-lg border border-black/[0.06] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img
                      src={redesign.resultImageUrl}
                      alt={styleNames.get(redesign.styleId) ?? "Redesign"}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="text-[14px] font-semibold text-[#1D1D1F]">
                        {styleNames.get(redesign.styleId) ?? redesign.styleId}
                      </p>
                      <p className="mt-1 text-[12px] text-[#86868B]">
                        {new Date(redesign.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </button>
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
