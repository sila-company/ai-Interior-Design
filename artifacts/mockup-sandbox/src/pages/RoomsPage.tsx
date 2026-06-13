import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import { Link, Redirect } from "wouter";

import { AuthImage } from "@/components/AuthImage";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";
import { useAppFlow } from "@/context/AppFlowContext";
import { listDesignStyles, listRedesigns, listRooms } from "@/lib/api";

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RoomsPage() {
  const { user, logout } = useAuth();
  const { openRoom, viewSavedRedesign } = useAppFlow();

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: listRooms,
    enabled: Boolean(user),
  });

  const redesignsQuery = useQuery({
    queryKey: ["redesigns"],
    queryFn: listRedesigns,
    enabled: Boolean(user),
  });

  const stylesQuery = useQuery({
    queryKey: ["styles"],
    queryFn: listDesignStyles,
    enabled: Boolean(user),
  });

  if (!user) {
    return <Redirect to="/login" />;
  }

  const rooms = roomsQuery.data ?? [];
  const redesigns = redesignsQuery.data ?? [];
  const styleNames = new Map(
    (stylesQuery.data ?? []).map((style) => [style.id, style.name]),
  );
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
  const totalRedesigns = redesigns.length;
  const recentRedesigns = redesigns.slice(0, 6);

  return (
    <div className="min-h-dvh bg-[#F5F5F7]">
      <PageFrame>
        <header className="mb-6 flex flex-col gap-5 rounded-lg border border-black/[0.06] bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] font-medium uppercase text-[#86868B]">
              Atelier
            </p>
            <h1 className="mt-1 text-[34px] font-semibold text-[#1D1D1F]">
              Hi, {user.name.split(" ")[0]}
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/rooms/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-5 py-3 text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(0,113,227,0.18)]"
            >
              <Plus className="h-4 w-4" />
              Add a room
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full bg-black/[0.04] px-5 py-3 text-[15px] text-[#1D1D1F]"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Surface className="p-4">
            <p className="text-[13px] text-[#6E6E73]">Rooms</p>
            <p className="mt-1 text-[30px] font-semibold leading-none">
              {roomsQuery.isLoading ? "Loading" : rooms.length}
            </p>
          </Surface>
          <Surface className="p-4">
            <p className="text-[13px] text-[#6E6E73]">Saved redesigns</p>
            <p className="mt-1 text-[30px] font-semibold leading-none">
              {redesignsQuery.isLoading ? "Loading" : totalRedesigns}
            </p>
          </Surface>
          <Surface className="p-4 sm:col-span-2">
            <p className="text-[13px] text-[#6E6E73]">Current workspace</p>
            <p className="mt-1 text-[18px] font-semibold text-[#1D1D1F]">
              Save rooms, generate redesigns, and return to any result later.
            </p>
          </Surface>
        </div>

        {recentRedesigns.length > 0 ? (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0071E3]" />
              <h2 className="text-[22px] font-semibold text-[#1D1D1F]">
                Recent redesigns
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {recentRedesigns.map((redesign) => {
                const room = rooms.find((item) => item.id === redesign.roomId);
                if (!room) return null;

                return (
                  <button
                    key={redesign.id}
                    type="button"
                    onClick={() => viewSavedRedesign(room, redesign)}
                    className="overflow-hidden rounded-lg border border-black/[0.06] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <AuthImage
                      src={redesign.resultImageUrl}
                      alt={styleNames.get(redesign.styleId) ?? "Redesign"}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="truncate text-[14px] font-semibold text-[#1D1D1F]">
                        {roomNames.get(redesign.roomId) ?? "Room"}
                      </p>
                      <p className="truncate text-[12px] text-[#6E6E73]">
                        {styleNames.get(redesign.styleId) ?? redesign.styleId}
                      </p>
                      <p className="mt-1 text-[11px] text-[#86868B]">
                        {formatRelativeDate(redesign.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[22px] font-semibold text-[#1D1D1F]">
                Your rooms
              </h2>
              <p className="mt-1 text-[15px] text-[#6E6E73]">
                Open a room to see every saved redesign.
              </p>
            </div>
          </div>

          {roomsQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-lg bg-white/80"
                />
              ))}
            </div>
          ) : rooms.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => openRoom(room)}
                  className="overflow-hidden rounded-lg border border-black/[0.06] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <AuthImage
                    src={room.originalImageUrl}
                    alt={room.name}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="truncate text-[18px] font-semibold text-[#1D1D1F]">
                      {room.name}
                    </p>
                    <p className="mt-1 text-[14px] text-[#6E6E73]">
                      {room.redesignCount} saved redesign
                      {room.redesignCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Surface className="p-8 text-center">
              <p className="text-[17px] font-medium text-[#1D1D1F]">
                No rooms yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-[15px] text-[#6E6E73]">
                Add your first room, then every AI redesign will be saved here
                automatically.
              </p>
            </Surface>
          )}
        </section>
      </PageFrame>
    </div>
  );
}
