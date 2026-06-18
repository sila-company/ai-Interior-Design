import type { ReactNode } from "react";

import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated = "June 18, 2026",
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title={title} backTo="/" />
      <PageFrame className="py-6 sm:py-10">
        <Surface className="mx-auto max-w-3xl p-6 sm:p-10">
          <p className="mb-2 text-[13px] font-medium uppercase text-[#86868B]">
            Atelier
          </p>
          <h1 className="mb-2 text-[32px] font-semibold text-[#1D1D1F] sm:text-[40px]">
            {title}
          </h1>
          <p className="mb-8 text-[15px] text-[#6E6E73]">
            Last updated {lastUpdated}
          </p>
          <div className="legal-content space-y-6 text-[17px] leading-7 text-[#1D1D1F] [&_a]:text-[#0071E3] [&_a]:underline [&_h2]:mt-8 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-[19px] [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-[#424245] [&_ul]:space-y-2">
            {children}
          </div>
        </Surface>
      </PageFrame>
    </div>
  );
}
