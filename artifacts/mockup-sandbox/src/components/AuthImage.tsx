import { type CSSProperties, useEffect, useState } from "react";

import { getAuthToken } from "@/lib/auth-storage";

interface AuthImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

export function AuthImage({ src, alt, className, style }: AuthImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
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
      if (!response.ok) return;

      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      if (!cancelled) {
        setResolvedSrc(objectUrl);
      }
    }

    setResolvedSrc(null);
    void load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!resolvedSrc) {
    return <div className={className} style={style} role="img" aria-label={alt} />;
  }

  return <img src={resolvedSrc} alt={alt} className={className} style={style} />;
}
