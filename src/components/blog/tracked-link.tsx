"use client";

import type { ReactNode } from "react";
import { gaEvent } from "@/lib/ga";

/**
 * لینک با ثبت رویداد در GA4 — نسخهٔ کلاینتِ <a> تا در کامپوننت‌های
 * سرور-ساید (فوتر، مقاله، پکیج‌ها) هم بتوان رویداد کلیک ثبت کرد.
 *
 * useExternal=false برای لینک‌های tel:/mailto: که نباید تب جدید باز کنند.
 *
 * rel: برای لینک‌های تجاری/افیلیت «sponsored nofollow» پاس می‌شود
 * (الزام گوگل برای لینک‌های همکاری در فروش). پیش‌فرض: noopener noreferrer.
 */
export function TrackedLink({
  href,
  event,
  params,
  className,
  children,
  ariaLabel,
  useExternal = true,
  rel,
}: {
  href: string;
  event: string;
  params?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  useExternal?: boolean;
  rel?: string;
}) {
  const relAttr = useExternal ? (rel ?? "noopener noreferrer") : rel;
  return (
    <a
      href={href}
      {...(useExternal ? { target: "_blank" } : {})}
      {...(relAttr ? { rel: relAttr } : {})}
      className={className}
      aria-label={ariaLabel}
      onClick={() => gaEvent(event, params)}
    >
      {children}
    </a>
  );
}
