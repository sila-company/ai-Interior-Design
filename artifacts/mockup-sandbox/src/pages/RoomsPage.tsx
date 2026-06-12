import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link, Redirect } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { useAuth } from "@/context/AuthContext";
import { useAppFlow } from "@/context/AppFlowContext";
import { listRooms } from "@/lib/api";

export function RoomsPage() {
  const { user, logout } = useAuth();
  const { beginWithRoom } = useAppFlow();

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: listRooms,
    enabled: Boolean(user),
  });

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/75 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-[#86868B]">Welcome back</p>
            <h1 className="text-[22px] font-semibold text-[#1D1D1F]">
              {user.name}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full bg-black/[0.04] px-4 py-2 text-[14px]"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex-1 px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">
              Your rooms
            </h2>
            <p className="text-[17px] text-[#6E6E73]">
              Each room keeps its photo and redesign history.
            </p>
          </div>
        </div>

        <Link
          href="/rooms/new"
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add a room
        </Link>

        {roomsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[20px] bg-white/80"
              />
            ))}
          </div>
        ) : roomsQuery.data?.length ? (
          <div className="space-y-3">
            {roomsQuery.data.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => beginWithRoom(room)}
                className="flex w-full items-center gap-4 rounded-[20px] border border-black/[0.06] bg-white p-4 text-left shadow-[0_6px_12px_rgba(0,0,0,0.05)]"
              >
                <img
                  src={room.originalImageUrl}
                  alt={room.name}
                  className="h-16 w-16 rounded-[14px] object-cover"
                />
                <div className="flex-1">
                  <p className="text-[17px] font-semibold text-[#1D1D1F]">
                    {room.name}
                  </p>
                  <p className="text-[14px] text-[#6E6E73]">
                    {room.redesignCount} redesign
                    {room.redesignCount === 1 ? "" : "s"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-black/10 bg-white/70 p-8 text-center">
            <p className="text-[17px] font-medium text-[#1D1D1F]">
              No rooms yet
            </p>
            <p className="mt-2 text-[15px] text-[#6E6E73]">
              Add your first room to start redesigning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
