import { type CSSProperties, useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

import { getAuthToken } from "@/lib/auth-storage";

interface AuthImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

export function AuthImage({ src, alt, className, style }: AuthImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);

    if (src.startsWith("data:") || src.startsWith("blob:")) {
      setResolvedSrc(src);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await fetch(src, { credentials: "include", headers });
      if (!response.ok) {
        if (!cancelled) setLoadError(true);
        return;
      }

      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      if (!cancelled) {
        setResolvedSrc(objectUrl);
      }
    }

    setResolvedSrc(null);
    void load().catch(() => {
      if (!cancelled) setLoadError(true);
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loadError) {
    return (
      <div
        className={`${className ?? ""} flex items-center justify-center bg-[#F5F5F7]`}
        style={style}
        role="img"
        aria-label={`${alt} unavailable`}
      >
        <div className="flex max-w-[220px] flex-col items-center px-4 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05]">
            <ImageOff className="h-4 w-4 text-[#86868B]" />
          </div>
          <p className="text-[12px] font-medium leading-4 text-[#6E6E73]">
            Image unavailable locally
          </p>
        </div>
      </div>
    );
  }

  if (!resolvedSrc) {
    return (
      <div
        className={`${className ?? ""} animate-pulse bg-black/[0.04]`}
        style={style}
        role="img"
        aria-label={alt}
      />
    );
  }

  return <img src={resolvedSrc} alt={alt} className={className} style={style} />;
}
