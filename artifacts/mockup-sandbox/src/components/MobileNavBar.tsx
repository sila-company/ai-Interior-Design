import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface MobileNavBarProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
}

export function MobileNavBar({
  title,
  showBack = true,
  backTo,
}: MobileNavBarProps) {
  const [, setLocation] = useLocation();

  if (!showBack) {
    return (
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <h1 className="mx-auto max-w-7xl text-center text-[17px] font-semibold">
          {title}
        </h1>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 px-2 py-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center">
        <button
          type="button"
          onClick={() => setLocation(backTo ?? "/")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#0071E3]"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <h1 className="flex-1 pr-10 text-center text-[17px] font-semibold">
          {title}
        </h1>
      </div>
    </header>
  );
}
