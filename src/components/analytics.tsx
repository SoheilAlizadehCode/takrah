"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ثبت بازدید صفحات در Google Analytics 4
 *
 * ناوبری بین صفحات این سایت با next/link و بدون رفرش صفحه انجام می‌شود،
 * بنابراین باید هر تغییر مسیر را دستی به gtag اعلام کنیم تا آمار
 * «بازدید صفحه» در GA4 دقیق ثبت شود (صفحه اول هنگام load ثبت می‌شود).
 *
 * این کامپوننت فقط وقتی رندر می‌شود که NEXT_PUBLIC_GA_ID تنظیم شده باشد.
 */
export function GAPageView({ gaId }: { gaId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaId || typeof window === "undefined") return;
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
    };
    // اگر اسکریپت GA هنوز لود نشده باشد، gtag تعریف نشده و event نادیده گرفته می‌شود؛
    // چون gtag خودش dataLayer را می‌سازد، صفحات بعدی درست ثبت می‌شوند.
    w.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, gaId]);

  return null;
}
