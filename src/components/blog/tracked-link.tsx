"use client";

import type { ReactNode } from "react";
import { gaEvent } from "@/lib/ga";

/**
 * لینک با ثبت رویداد در GA4 — نسخهٔ کلاینتِ <a> تا در کامپوننت‌های
 * سرور-ساید (فوتر، مقاله، پکیج‌ها) هم بتوان رویداد کلیک ثبت کرد.
 *
 * useExternal=false برای لینک‌های tel:/mailto: که نباید تب جدید باز کنند.
 */
export function TrackedLink({
  href,
  event,
  params,
  className,
  children,
  ariaLabel,
  useExternal = true,
}: {
  href: string;
  event: string;
  params?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  useExternal?: boolean;
}) {
  return (
    <a
      href={href}
      {...(useExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      aria-label={ariaLabel}
      onClick={() => gaEvent(event, params)}
    >
      {children}
    </a>
  );
}
