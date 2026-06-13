import type { ReactNode } from "react";

import { AppBackground } from "./AppBackground";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-transparent">
        <AppBackground />
        {children}
      </div>
    </div>
  );
}
