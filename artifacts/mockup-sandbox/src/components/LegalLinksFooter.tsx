import { Link } from "wouter";

export function LegalLinksFooter() {
  return (
    <div className="text-[12px] leading-5 text-[#6E6E73]">
      <p>
        By creating an account, you agree to our Terms of Use and Privacy
        Policy.
      </p>
      <div className="mt-2 flex gap-4 text-[13px] font-medium">
        <Link href="/terms" className="text-[#0071E3]">
          Terms of Use
        </Link>
        <Link href="/privacy" className="text-[#0071E3]">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
