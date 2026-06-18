import type { ReactNode } from "react";
import { Home, LayoutGrid, LogOut, Plus, UserCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

import { AppBackground } from "./AppBackground";
import { useAuth } from "@/context/AuthContext";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const showDesktopChrome =
    Boolean(user) && !["/", "/login", "/register"].includes(location);
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="min-h-dvh bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-transparent">
        <AppBackground />
        {showDesktopChrome ? (
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-black/[0.06] bg-white/72 px-4 py-5 backdrop-blur-2xl lg:flex lg:flex-col">
            <div className="mb-8 px-2">
              <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868B] uppercase">
                Atelier
              </p>
              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                Hi, {firstName}
              </h1>
            </div>

            <nav className="space-y-1.5">
              <SidebarLink
                href="/rooms"
                icon={<Home className="h-[18px] w-[18px]" />}
                label="Home"
                active={location === "/rooms"}
              />
              <SidebarLink
                href="/rooms"
                icon={<LayoutGrid className="h-[18px] w-[18px]" />}
                label="Rooms"
                active={
                  location.startsWith("/rooms/") && location !== "/rooms/new"
                }
              />
              <SidebarLink
                href="/rooms/new"
                icon={<Plus className="h-[18px] w-[18px]" />}
                label="Add room"
                active={location === "/rooms/new"}
              />
            </nav>

            <div className="mt-auto rounded-[20px] border border-black/[0.06] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0071E3]/[0.08] text-[#0071E3]">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#1D1D1F]">
                    {user?.name}
                  </p>
                  <p className="truncate text-[12px] text-[#86868B]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black/[0.04] px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] transition hover:bg-black/[0.07]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        ) : null}

        <div className={showDesktopChrome ? "min-h-dvh lg:pl-[280px]" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-full px-4 py-3 text-[15px] font-medium transition",
        active
          ? "bg-[#0071E3] text-white shadow-[0_12px_28px_rgba(0,113,227,0.22)]"
          : "text-[#1D1D1F] hover:bg-black/[0.04]",
      ].join(" ")}
    >
      {icon}
      {label}
    </Link>
  );
}
