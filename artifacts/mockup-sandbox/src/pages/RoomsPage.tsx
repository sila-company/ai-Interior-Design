import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import { Link, Redirect } from "wouter";

import { useAuth } from "@/context/AuthContext";
import { useAppFlow } from "@/context/AppFlowContext";
import { listRedesigns, listRooms, listDesignStyles } from "@/lib/api";

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
    <div className="flex min-h-dvh flex-col bg-[#F5F5F7]">
      <header className="border-b border-black/5 bg-white/80 px-6 pb-6 pt-4 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium tracking-[0.08em] text-[#86868B] uppercase">
              Atelier
            </p>
            <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.04em] text-[#1D1D1F]">
              Hi, {user.name.split(" ")[0]}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full bg-black/[0.04] px-4 py-2 text-[14px] text-[#1D1D1F]"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-[#0071E3] p-4 text-white">
            <p className="text-[13px] text-white/80">Rooms</p>
            <p className="mt-1 text-[28px] font-semibold leading-none">
              {roomsQuery.isLoading ? "—" : rooms.length}
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
            <p className="text-[13px] text-[#86868B]">Saved redesigns</p>
            <p className="mt-1 text-[28px] font-semibold leading-none text-[#1D1D1F]">
              {redesignsQuery.isLoading ? "—" : totalRedesigns}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 py-6">
        <Link
          href="/rooms/new"
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(0,113,227,0.28)]"
        >
          <Plus className="h-4 w-4" />
          Add a room
        </Link>

        {recentRedesigns.length > 0 ? (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0071E3]" />
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
                Recent redesigns
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentRedesigns.map((redesign) => {
                const room = rooms.find((item) => item.id === redesign.roomId);
                if (!room) return null;

                return (
                  <button
                    key={redesign.id}
                    type="button"
                    onClick={() => viewSavedRedesign(room, redesign)}
                    className="w-[148px] shrink-0 overflow-hidden rounded-[18px] border border-black/[0.06] bg-white text-left shadow-[0_6px_16px_rgba(0,0,0,0.06)]"
                  >
                    <img
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
          <div className="mb-4">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
              Your rooms
            </h2>
            <p className="mt-1 text-[15px] text-[#6E6E73]">
              Open a room to see every saved redesign.
            </p>
          </div>

          {roomsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-[20px] bg-white/80"
                />
              ))}
            </div>
          ) : rooms.length ? (
            <div className="space-y-3">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => openRoom(room)}
                  className="flex w-full items-center gap-4 rounded-[20px] border border-black/[0.06] bg-white p-4 text-left shadow-[0_6px_12px_rgba(0,0,0,0.05)]"
                >
                  <img
                    src={room.originalImageUrl}
                    alt={room.name}
                    className="h-20 w-20 rounded-[16px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
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
            <div className="rounded-[20px] border border-dashed border-black/10 bg-white/80 p-8 text-center">
              <p className="text-[17px] font-medium text-[#1D1D1F]">
                No rooms yet
              </p>
              <p className="mt-2 text-[15px] text-[#6E6E73]">
                Add your first room, then every AI redesign will be saved here
                automatically.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
