import type { ReactNode } from "react";

interface PageFrameProps {
  children: ReactNode;
  className?: string;
}

export function PageFrame({ children, className = "" }: PageFrameProps) {
  return (
    <main className={`mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </main>
  );
}

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

export function Surface({ children, className = "" }: SurfaceProps) {
  return (
    <section className={`rounded-lg border border-black/[0.06] bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}
