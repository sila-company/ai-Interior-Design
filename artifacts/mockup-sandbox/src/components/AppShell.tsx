import type { ReactNode } from "react";

import { AppBackground } from "./AppBackground";

interface AppShellProps {
  children: ReactNode;
  showDesktopFrame?: boolean;
}

export function AppShell({ children, showDesktopFrame = true }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#ECECF0] text-[#1D1D1F]">
      <div
        className={
          showDesktopFrame
            ? "mx-auto flex min-h-dvh w-full max-w-[430px] flex-col shadow-[0_0_0_1px_rgba(0,0,0,0.04)] md:my-0 md:min-h-dvh md:shadow-[0_20px_80px_rgba(0,0,0,0.12)]"
            : "flex min-h-dvh w-full flex-col"
        }
      >
        <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-transparent">
          <AppBackground />
          {children}
        </div>
      </div>
    </div>
  );
}
