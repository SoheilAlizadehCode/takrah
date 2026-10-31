"use client";

/**
 * کمکی‌های گوگل آنالیتیکس ۴ — رویدادهای سفارشی + فیلتر ترافیک داخلی
 *
 * رویدادهای مهم سایت (که بعداً در GA به‌عنوان Key Event علامت می‌خورند):
 *   telegram_click        — کلیک روی لینک کانال/ربات تلگرام (فوتر و مقاله‌ها)
 *   signup_google_success — ورود موفق با گوگل در گیت دانلود
 *     (قبلاً google_signup_success بود که پیشوند رزروشدهٔ GA4 است و رد می‌شد)
 *   gate_telegram_start   — انتخاب مسیر تلگرام در گیت
 *   gate_verify_success   — تأیید موفق کد عضویت
 *   gate_unlock_success   — باز شدن فایل‌های دانلود
 *   package_demo_click    — کلیک روی دموی زندهٔ پکیج
 *   package_contact_click — کلیک روی تماس (واتساپ/تلفن) پکیج
 *
 * فیلتر ترافیک داخلی: یک بار آدرس سایت را با ?tk_internal=1 باز کن؛
 * فلگ در localStorage ذخیره می‌شود و از آن به بعد هیچ رویدادی از آن
 * مرورگر به GA ارسال نمی‌شود (بازدیدهای خودِ صاحب سایت شمرده نمی‌شود).
 */

export const TK_INTERNAL_KEY = "tk_internal";
export const TK_INTERNAL_PARAM = "tk_internal";

export function isInternalTraffic(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(TK_INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

/** اگر آدرس فعلی پارامتر مخفی را داشته باشد، فلگ دائمی را ثبت و پارامتر را از نوار آدرس پاک می‌کند. */
export function captureInternalFlag(): void {
  if (typeof window === "undefined") return;
  try {
    const u = new URL(window.location.href);
    if (u.searchParams.has(TK_INTERNAL_PARAM)) {
      window.localStorage.setItem(TK_INTERNAL_KEY, "1");
      u.searchParams.delete(TK_INTERNAL_PARAM);
      window.history.replaceState(null, "", u.toString());
    }
  } catch {
    /* مرورگرهای خیلی قدیمی — بی‌خیال */
  }
}

type GtagFn = (...args: unknown[]) => void;

function gtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { gtag?: GtagFn }).gtag;
}

/** ارسال رویداد سفارشی به GA4 — اگر ترافیک داخلی باشد یا GA لود نشده باشد هیچ کاری نمی‌کند. */
export function gaEvent(name: string, params?: Record<string, unknown>): void {
  if (isInternalTraffic()) return;
  const g = gtag();
  if (!g) return;
  g("event", name, params ?? {});
}
