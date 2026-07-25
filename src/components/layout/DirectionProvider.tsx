"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function DirectionProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const language = searchParams.get("lang");
    const isRtl = language === "fa" || language === "ar";
    const dir = isRtl ? "rtl" : "ltr";
    const lang = isRtl ? "fa" : "en";

    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-language", lang);
    document.body.setAttribute("data-language", lang);
  }, [pathname, searchParams]);

  return null;
}
