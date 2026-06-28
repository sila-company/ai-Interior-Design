import { Camera, Globe, Palette, Sparkles } from "lucide-react";
import { Link, Redirect } from "wouter";

import appStoreBadgeUrl from "@/assets/app-store-badge.svg";
import googlePlayBadgeUrl from "@/assets/google-play-badge.svg";
import { useAuth } from "@/context/AuthContext";

function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="#"
      aria-label="Download on the App Store"
      className={`inline-flex h-10 cursor-pointer items-center rounded-[7px] transition-opacity duration-200 hover:opacity-80 ${className}`}
    >
      <img
        src={appStoreBadgeUrl}
        alt=""
        className="h-10 w-auto"
        aria-hidden="true"
      />
    </a>
  );
}

function PlayStoreBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="#"
      aria-label="Get it on Google Play"
      className={`inline-flex h-10 cursor-pointer items-center rounded-[7px] transition-opacity duration-200 hover:opacity-80 ${className}`}
    >
      <img
        src={googlePlayBadgeUrl}
        alt=""
        className="h-10 w-auto"
        aria-hidden="true"
      />
    </a>
  );
}

function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      {/* Floating labels */}
      <div className="absolute -left-4 top-14 z-10 rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
        <p className="text-[11px] font-semibold text-[#86868B]">Before</p>
      </div>
      <div className="absolute -right-4 top-14 z-10 rounded-xl bg-[#0071E3] px-3 py-2 shadow-[0_8px_24px_rgba(0,113,227,0.30)]">
        <p className="text-[11px] font-semibold text-white">After</p>
      </div>

      {/* Device frame */}
      <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.13)]">
        {/* App header */}
        <div className="flex items-center justify-between border-b border-black/[0.05] px-5 py-4">
          <span className="text-[17px] font-semibold text-[#1D1D1F]">
            My Rooms
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0071E3]">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-white"
              aria-hidden="true"
            >
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
        </div>

        {/* Room cards */}
        <div className="space-y-3 p-4">
          {/* Card 1 — Living Room */}
          <div className="overflow-hidden rounded-2xl border border-black/[0.05]">
            <div className="grid grid-cols-2">
              <div
                className="aspect-[4/3] w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=300&q=75)",
                  backgroundColor: "#C4B29A",
                }}
                role="img"
                aria-label="Living room before redesign"
              />
              <div
                className="aspect-[4/3] w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=300&q=75)",
                  backgroundColor: "#D4DEF0",
                }}
                role="img"
                aria-label="Living room after Scandinavian redesign"
              />
            </div>
            <div className="flex items-center justify-between bg-[#F5F5F7] px-3 py-2.5">
              <div>
                <p className="text-[13px] font-semibold text-[#1D1D1F]">
                  Living Room
                </p>
                <p className="text-[11px] text-[#86868B]">
                  Scandinavian · 4 designs
                </p>
              </div>
              <span className="rounded-full bg-[#0071E3]/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#0071E3]">
                New
              </span>
            </div>
          </div>

          {/* Card 2 — Bedroom */}
          <div className="overflow-hidden rounded-2xl border border-black/[0.05]">
            <div className="grid grid-cols-2">
              <div
                className="aspect-[4/3] w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=75)",
                  backgroundColor: "#C8B8A8",
                }}
                role="img"
                aria-label="Bedroom before redesign"
              />
              <div
                className="aspect-[4/3] w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=75)",
                  backgroundColor: "#E8EEF8",
                }}
                role="img"
                aria-label="Bedroom after minimalist redesign"
              />
            </div>
            <div className="flex items-center justify-between bg-[#F5F5F7] px-3 py-2.5">
              <div>
                <p className="text-[13px] font-semibold text-[#1D1D1F]">
                  Bedroom
                </p>
                <p className="text-[11px] text-[#86868B]">
                  Minimalist · 2 designs
                </p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-medium text-[#6E6E73]">
                View
              </span>
            </div>
          </div>
        </div>

        {/* Bottom tab bar */}
        <div className="flex items-center justify-around border-t border-black/[0.06] bg-white px-6 py-3">
          <div className="flex flex-col items-center gap-1">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-[#0071E3]"
              aria-hidden="true"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-[9px] font-semibold text-[#0071E3]">
              Rooms
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-35">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current"
              aria-hidden="true"
            >
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7-7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3z" />
            </svg>
            <span className="text-[9px] font-semibold">Explore</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-35">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current"
              aria-hidden="true"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-[9px] font-semibold">Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const TRANSFORMATIONS = [
  {
    name: "Living Room",
    style: "Scandinavian",
    before: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=900&q=80",
    beforeColor: "#C4B29A",
    afterColor: "#D4DEF0",
  },
  {
    name: "Bedroom",
    style: "Minimalist",
    before: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=900&q=80",
    beforeColor: "#C8B8A8",
    afterColor: "#E8EEF8",
  },
];

function TransformationShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-7 lg:px-10">
      <div className="mb-12 text-center">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#86868B]">
          Real results
        </p>
        <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#1D1D1F] sm:text-[38px]">
          See AI in action
        </h2>
      </div>

      <div className="space-y-5">
        {TRANSFORMATIONS.map((room) => (
          <div
            key={room.name}
            className="overflow-hidden rounded-[24px] border border-black/[0.05] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          >
            <div className="grid grid-cols-2">
              {/* Before */}
              <div className="relative">
                <div
                  className="aspect-[4/3] w-full bg-cover bg-center sm:aspect-[16/10]"
                  style={{
                    backgroundImage: `url(${room.before})`,
                    backgroundColor: room.beforeColor,
                  }}
                  role="img"
                  aria-label={`${room.name} before redesign`}
                />
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-[12px] font-semibold text-white">
                    Before
                  </span>
                </div>
              </div>

              {/* After */}
              <div className="relative">
                <div
                  className="aspect-[4/3] w-full bg-cover bg-center sm:aspect-[16/10]"
                  style={{
                    backgroundImage: `url(${room.after})`,
                    backgroundColor: room.afterColor,
                  }}
                  role="img"
                  aria-label={`${room.name} after ${room.style} redesign`}
                />
                <div className="absolute bottom-3 right-3 rounded-lg bg-[#0071E3] px-3 py-1.5">
                  <span className="text-[12px] font-semibold text-white">
                    After · {room.style}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-[15px] font-semibold text-[#1D1D1F]">
                  {room.name}
                </p>
                <p className="text-[13px] text-[#6E6E73]">
                  Redesigned in {room.style} style
                </p>
              </div>
              <Link
                href="/register"
                className="cursor-pointer rounded-full bg-[#0071E3]/[0.07] px-4 py-2 text-[13px] font-medium text-[#0071E3] transition-colors duration-150 hover:bg-[#0071E3]/[0.12]"
              >
                Try yours
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="min-h-dvh overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-7 lg:px-10">
          <span className="text-[17px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
            Atelier
          </span>
          <div className="flex items-center gap-2">
            <div className="hidden origin-right scale-90 items-center gap-2 lg:flex">
              <AppStoreBadge />
              <PlayStoreBadge />
            </div>
            <Link
              href="/login"
              className="cursor-pointer rounded-full bg-black/[0.04] px-4 py-2 text-[14px] font-medium text-[#1D1D1F] transition-colors duration-150 hover:bg-black/[0.07]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="cursor-pointer rounded-full bg-[#0071E3] px-4 py-2 text-[14px] font-medium text-white transition-opacity duration-150 hover:opacity-85"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-7 sm:py-20 lg:px-10 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Copy */}
          <div>
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#0071E3]/[0.08] px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#0071E3]" />
              <span className="text-[12px] font-semibold text-[#0071E3]">
                AI Interior Design
              </span>
            </div>

            <h1 className="mb-5 text-[48px] font-semibold leading-[1.04] tracking-[-0.025em] text-[#1D1D1F] sm:text-[60px] lg:text-[68px]">
              Your space,
              <br />
              reimagined.
            </h1>

            <p className="mb-9 max-w-[480px] text-[18px] leading-[1.72] text-[#6E6E73]">
              Photograph any room, choose a design style, and see your space
              transformed — in seconds.
            </p>

            {/* Primary web CTAs */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="cursor-pointer rounded-full bg-[#0071E3] px-6 py-3.5 text-center text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(0,113,227,0.28)] transition-opacity duration-200 hover:opacity-85"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="cursor-pointer rounded-full bg-[#0071E3]/[0.07] px-6 py-3.5 text-center text-[15px] font-medium text-[#0071E3] transition-colors duration-150 hover:bg-[#0071E3]/[0.12]"
              >
                Sign in
              </Link>
            </div>

            {/* Divider */}
            <div className="mb-6 flex max-w-xs items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.08]" />
              <span className="text-[12px] text-[#86868B]">
                Also available on
              </span>
              <div className="h-px flex-1 bg-black/[0.08]" />
            </div>

            {/* Download badges */}
            <div className="mb-8 flex flex-wrap gap-3">
              <AppStoreBadge />
              <PlayStoreBadge />
            </div>

            <p className="text-[12px] leading-5 text-[#6E6E73]">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-[#0071E3] hover:underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#0071E3] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* App preview — desktop */}
          <div className="hidden lg:block">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* App preview — mobile */}
      <div className="px-5 pb-14 lg:hidden">
        <AppPreview />
      </div>

      {/* ── Stats strip ── */}
      <section className="border-y border-black/[0.06] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-7 lg:px-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] sm:text-[34px]">
                10k+
              </p>
              <p className="mt-1 text-[12px] text-[#86868B] sm:text-[13px]">
                Rooms redesigned
              </p>
            </div>
            <div>
              <p className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] sm:text-[34px]">
                50+
              </p>
              <p className="mt-1 text-[12px] text-[#86868B] sm:text-[13px]">
                Design styles
              </p>
            </div>
            <div>
              <p className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] sm:text-[34px]">
                4.8★
              </p>
              <p className="mt-1 text-[12px] text-[#86868B] sm:text-[13px]">
                App Store rating
              </p>
            </div>
          </div>
        </div>
      </section>

      <TransformationShowcase />

      {/* ── How it works ── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-7 lg:px-10">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#86868B]">
            How it works
          </p>
          <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#1D1D1F] sm:text-[38px]">
            Three steps to your dream room
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-[24px] border border-black/[0.04] bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/[0.08]">
              <Camera className="h-6 w-6 text-[#0071E3]" aria-hidden="true" />
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#86868B]">
              Step 1
            </p>
            <h3 className="mb-2 text-[18px] font-semibold text-[#1D1D1F]">
              Photograph your room
            </h3>
            <p className="text-[15px] leading-relaxed text-[#6E6E73]">
              Take a photo of any room with your phone or upload one from your
              gallery.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-[24px] border border-black/[0.04] bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/[0.08]">
              <Palette className="h-6 w-6 text-[#0071E3]" aria-hidden="true" />
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#86868B]">
              Step 2
            </p>
            <h3 className="mb-2 text-[18px] font-semibold text-[#1D1D1F]">
              Choose a style
            </h3>
            <p className="text-[15px] leading-relaxed text-[#6E6E73]">
              Browse 50+ design styles — from Scandinavian to Art Deco — and
              pick your favorite.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-[24px] border border-black/[0.04] bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/[0.08]">
              <Sparkles
                className="h-6 w-6 text-[#0071E3]"
                aria-hidden="true"
              />
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#86868B]">
              Step 3
            </p>
            <h3 className="mb-2 text-[18px] font-semibold text-[#1D1D1F]">
              See it transformed
            </h3>
            <p className="text-[15px] leading-relaxed text-[#6E6E73]">
              Our AI reimagines your space in seconds. Compare, save, and share
              your favorite results.
            </p>
          </div>
        </div>
      </section>

      {/* ── Platform section — dark ── */}
      <section className="bg-[#1D1D1F]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-7 lg:px-10">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-[30px] font-semibold tracking-[-0.02em] text-white sm:text-[38px]">
              Use Atelier anywhere
            </h2>
            <p className="mx-auto max-w-md text-[17px] leading-relaxed text-white/55">
              Available on web, iOS, and Android. Your rooms and designs sync
              across all your devices.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-10 w-[128px] cursor-pointer items-center gap-2 rounded-[7px] border border-white/[0.18] bg-white/[0.08] px-3 text-white transition-colors duration-150 hover:bg-white/[0.13]"
            >
              <Globe
                className="h-5 w-5 shrink-0 text-white"
                aria-hidden="true"
              />
              <div className="text-left leading-none">
                <div className="text-[8px] font-medium leading-none opacity-70">
                  Use in your
                </div>
                <div className="mt-0.5 text-[16px] font-medium leading-[0.95]">
                  Browser
                </div>
              </div>
            </Link>

            <AppStoreBadge className="border border-white/[0.10]" />
            <PlayStoreBadge className="border border-white/[0.10]" />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-7 lg:px-10">
        <h2 className="mb-4 text-[30px] font-semibold tracking-[-0.02em] text-[#1D1D1F] sm:text-[40px]">
          Start designing today.
        </h2>
        <p className="mb-8 text-[17px] leading-relaxed text-[#6E6E73]">
          Create a free account and transform your first room in minutes.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="cursor-pointer rounded-full bg-[#0071E3] px-8 py-4 text-[16px] font-medium text-white shadow-[0_12px_32px_rgba(0,113,227,0.30)] transition-opacity duration-200 hover:opacity-85"
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="cursor-pointer rounded-full bg-black/[0.04] px-8 py-4 text-[16px] font-medium text-[#1D1D1F] transition-colors duration-150 hover:bg-black/[0.07]"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-7 lg:px-10">
          <span className="text-[15px] font-semibold text-[#1D1D1F]">
            Atelier
          </span>
          <div className="flex items-center gap-6 text-[13px]">
            <Link
              href="/terms"
              className="cursor-pointer text-[#6E6E73] transition-colors duration-150 hover:text-[#1D1D1F]"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="cursor-pointer text-[#6E6E73] transition-colors duration-150 hover:text-[#1D1D1F]"
            >
              Privacy
            </Link>
            <Link
              href="/support"
              className="cursor-pointer text-[#6E6E73] transition-colors duration-150 hover:text-[#1D1D1F]"
            >
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
