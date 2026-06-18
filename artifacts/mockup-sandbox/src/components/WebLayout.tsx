import type { ReactNode } from "react";

interface PageFrameProps {
  children: ReactNode;
  className?: string;
}

export function PageFrame({ children, className = "" }: PageFrameProps) {
  return (
    <main
      className={`mx-auto w-full max-w-7xl px-5 py-6 sm:px-7 lg:px-10 lg:py-8 ${className}`}
    >
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
    <section
      className={`rounded-[20px] border border-black/[0.06] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}
