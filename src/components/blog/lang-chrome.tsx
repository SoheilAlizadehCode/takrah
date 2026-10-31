"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteChrome } from "./site-chrome";
import { Footer } from "./footer";
import { EnHeader } from "./en-header";
import { EnFooter } from "./en-footer";

/** آیا مسیر فعلی نسخهٔ انگلیسی است؟ */
export function useIsEnglish(): boolean {
  const pathname = usePathname() ?? "";
  return pathname === "/en" || pathname.startsWith("/en/");
}

/**
 * هدر زبان‌آگاه — مسیرهای /en هدر انگلیسی و بقیه هدر فارسی می‌بینند.
 * جایگزین مستقیم SiteChrome در layout ریشه.
 */
export function LangChrome() {
  const isEn = useIsEnglish();
  return isEn ? <EnHeader /> : <SiteChrome />;
}

/** فوتر زبان‌آگاه — به‌جای Footer مستقیم در layout ریشه */
export function LangFooter() {
  const isEn = useIsEnglish();
  return isEn ? <EnFooter /> : <Footer />;
}

/**
 * تنظیم lang/dir خود صفحهٔ html برای نسخهٔ انگلیسی.
 * چون <html> در layout ریشه با dir="rtl" رندر می‌شود، در مسیرهای /en
 * این کامپوننت آن را به ltr برمی‌گرداند و هنگام خروج برمی‌گرداند به fa/rtl.
 */
export function HtmlLangSetter() {
  const isEn = useIsEnglish();
  useEffect(() => {
    const html = document.documentElement;
    html.lang = isEn ? "en" : "fa";
    html.dir = isEn ? "ltr" : "rtl";
  }, [isEn]);
  return null;
}
