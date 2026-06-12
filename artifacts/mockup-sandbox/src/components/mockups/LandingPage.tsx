import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

const appleEase = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: appleEase },
  };
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbfbfd] text-[#1d1d1f]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f5f5f7_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.04)_0%,transparent_72%)]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
        <motion.header
          {...fadeUp(0)}
          className="flex items-center justify-between py-6 sm:py-8"
        >
          <span className="text-[17px] font-semibold tracking-[-0.02em]">
            Atelier
          </span>
          <Button
            variant="ghost"
            className="h-9 rounded-full px-4 text-[14px] font-normal text-[#1d1d1f] hover:bg-black/[0.04]"
          >
            Sign in
          </Button>
        </motion.header>

        <main className="flex flex-1 flex-col items-center justify-center pb-20 pt-8 text-center sm:pb-28">
          <motion.p
            {...fadeUp(0.05)}
            className="mb-5 text-[13px] font-medium uppercase tracking-[0.18em] text-[#86868b]"
          >
            AI Interior Design
          </motion.p>

          <motion.h1
            {...fadeUp(0.12)}
            className="max-w-[12ch] text-[clamp(2.75rem,8vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.04em]"
          >
            Your space, reimagined.
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 max-w-xl text-[clamp(1.05rem,2.2vw,1.35rem)] leading-relaxed text-[#6e6e73]"
          >
            Upload a photo of any room and explore calm, thoughtful redesigns in
            seconds.
          </motion.p>

          <motion.div
            {...fadeUp(0.28)}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button className="h-11 rounded-full bg-[#0071e3] px-7 text-[15px] font-medium text-white shadow-none hover:bg-[#0077ed]">
              Upload a room photo
            </Button>
            <Button
              variant="ghost"
              className="h-11 rounded-full px-6 text-[15px] font-normal text-[#0071e3] hover:bg-[#0071e3]/[0.06]"
            >
              See examples
            </Button>
          </motion.div>

          <motion.div
            {...fadeUp(0.38)}
            className="mt-16 w-full max-w-3xl sm:mt-20"
          >
            <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_24px_80px_-32px_rgba(0,0,0,0.18)]">
              <div className="aspect-[16/10] bg-[linear-gradient(135deg,#f5f5f7_0%,#ececee_100%)]">
                <div className="flex h-full flex-col items-center justify-center gap-3 px-8">
                  <div className="h-14 w-14 rounded-2xl bg-white/80 shadow-sm" />
                  <p className="text-[15px] text-[#86868b]">
                    Your room preview will appear here
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function Preview() {
  return <LandingPage />;
}
