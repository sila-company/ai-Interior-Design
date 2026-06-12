import { useEffect, useState } from "react";
import { Link, Redirect } from "wouter";

import { useAuth } from "@/context/AuthContext";

export function LandingPage() {
  const { user, isLoading } = useAuth();
  const [appeared, setAppeared] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppeared(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isLoading && user) {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-10">
        <header
          className={[
            "flex items-center justify-between pb-8 pt-2 transition-all duration-700",
            appeared ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
          ].join(" ")}
        >
          <span className="text-[17px] font-semibold tracking-[-0.3px]">
            Atelier
          </span>
          <Link
            href="/login"
            className="rounded-full bg-black/[0.04] px-4 py-2 text-[14px] text-[#1D1D1F]"
          >
            Sign in
          </Link>
        </header>

        <section
          className={[
            "transition-all duration-700",
            appeared ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
          ].join(" ")}
        >
          <p className="mb-5 text-center text-[13px] font-medium tracking-[0.28em] text-[#86868B] uppercase">
            AI Interior Design
          </p>

          <h1 className="mb-4 text-center text-[44px] leading-[1.05] font-semibold tracking-[-0.04em] text-[#1D1D1F]">
            Your space,
            <br />
            reimagined.
          </h1>

          <p className="mb-8 px-2 text-center text-[19px] leading-7 text-[#6E6E73]">
            Save every room, try new styles, and keep your redesign history in
            one place.
          </p>

          <div className="space-y-3">
            <Link
              href="/register"
              className="block w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-center text-[15px] font-medium text-white"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="block w-full rounded-full bg-[#0071E3]/[0.06] px-4 py-3.5 text-center text-[15px] font-medium text-[#0071E3]"
            >
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
