import { Link, Redirect } from "wouter";

import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";

export function LandingPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <PageFrame className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between">
          <span className="text-[17px] font-semibold">Atelier</span>
          <Link
            href="/login"
            className="rounded-full bg-black/[0.04] px-4 py-2 text-[14px] text-[#1D1D1F]"
          >
            Sign in
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-5 text-[13px] font-medium uppercase text-[#86868B]">
              AI Interior Design
            </p>

            <h1 className="mb-5 text-[44px] leading-[1.05] font-semibold text-[#1D1D1F] sm:text-[64px]">
              Your space, reimagined.
            </h1>

            <p className="mb-8 max-w-xl text-[19px] leading-8 text-[#6E6E73]">
              Save every room, try new styles, and keep your redesign history in
              one place.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-[#0071E3] px-5 py-3.5 text-center text-[15px] font-medium text-white"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-[#0071E3]/[0.06] px-5 py-3.5 text-center text-[15px] font-medium text-[#0071E3]"
              >
                Sign in
              </Link>
            </div>
          </div>

          <Surface className="p-5">
            <div className="mb-4 overflow-hidden rounded-lg">
              <div className="aspect-[16/10] bg-[linear-gradient(135deg,#D9E8FF,#E8DED5_55%,#BFC7BE)]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-[#F5F5F7] p-3">
                <p className="text-[12px] text-[#6E6E73]">Rooms</p>
                <p className="mt-1 text-[24px] font-semibold">12</p>
              </div>
              <div className="rounded-lg bg-[#F5F5F7] p-3">
                <p className="text-[12px] text-[#6E6E73]">Styles</p>
                <p className="mt-1 text-[24px] font-semibold">8</p>
              </div>
              <div className="rounded-lg bg-[#F5F5F7] p-3">
                <p className="text-[12px] text-[#6E6E73]">Saved</p>
                <p className="mt-1 text-[24px] font-semibold">34</p>
              </div>
            </div>
          </Surface>
        </section>
      </PageFrame>
    </div>
  );
}
