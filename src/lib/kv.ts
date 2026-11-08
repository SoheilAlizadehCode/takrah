// ─── لایه‌ی ذخیره‌سازی مشترک — حافظه (پیش‌فرض) یا Upstash Redis REST ───
// همه‌ی داده‌های هر دو ربات + آنالیتیکس + گزارش از همین لایه می‌گذرد.
// برای کارکرد ماندگار روی Vercel (گزارش مدیر، یادآوری، حافظه‌ی آوا)
// تنظیم UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN الزامی است.

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

const mem = new Map<string, string>();

export function storageMode(): "redis" | "memory" {
  return REDIS_URL && REDIS_TOKEN ? "redis" : "memory";
}

export async function kvSet(key: string, value: string, ttlSec?: number): Promise<void> {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}${ttlSec ? `?EX=${ttlSec}` : ""}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${REDIS_TOKEN}`,
          "content-type": "text/plain",
        },
        body: value,
      });
      return;
    } catch {
      /* fallback به حافظه */
    }
  }
  mem.set(key, value);
}

export async function kvGet(key: string): Promise<string | null> {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
        headers: { authorization: `Bearer ${REDIS_TOKEN}` },
      });
      const j = (await res.json().catch(() => null)) as { result?: string | null } | null;
      if (j?.result) return j.result;
    } catch {
      /* fallback */
    }
  }
  return mem.get(key) ?? null;
}

export async function kvDel(key: string): Promise<void> {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      await fetch(`${REDIS_URL}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { authorization: `Bearer ${REDIS_TOKEN}` },
      });
    } catch {
      /* ignore */
    }
  }
  mem.delete(key);
}

/** افزودن به لیست با سقف (برای آنالیتیکس/تاریخچه) — قدیمی‌ها حذف می‌شوند */
export async function kvAppendCapped(key: string, item: unknown, cap: number): Promise<void> {
  const raw = await kvGet(key);
  const list: unknown[] = raw ? safeParse(raw, []) : [];
  list.push(item);
  const trimmed = list.slice(-cap);
  await kvSet(key, JSON.stringify(trimmed));
}

export function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── آنالیتیکس رویدادها (برای گزارش مدیر) ───
export interface AnalyticsEvent {
  t: number; // timestamp
  type:
    | "ava_q" // سوال از آوا
    | "llm" // پاسخ با هوش مصنوعی
    | "booking" // نوبت ثبت‌شده
    | "lead" // سرنخ ثبت‌شده
    | "voice" // وویس دریافت‌شده
    | "reminder" // یادآوری ارسال‌شده
    | "call" // تماس صوتی
    | "report" // گزارش روزانه ارسال‌شده
    | "confirm" // تأیید نوبت توسط بیمار
    | "ig_msg" // دایرکت اینستاگرام پاسخ‌داده‌شده
    | "ig_voice" // ویس دریافتی از دایرکت اینستاگرام
    | "ig_comment"; // کامنت→دایرکت اینستاگرام
  meta?: string; // توضیح کوتاه (تا ۸۰ کاراکتر)
}

const ANALYTICS_KEY = "vip:analytics:events";
const ANALYTICS_CAP = 400;

export async function logEvent(type: AnalyticsEvent["type"], meta?: string): Promise<void> {
  const e: AnalyticsEvent = { t: Date.now(), type, meta: meta?.slice(0, 80) };
  await kvAppendCapped(ANALYTICS_KEY, e, ANALYTICS_CAP);
}

export async function getEvents(): Promise<AnalyticsEvent[]> {
  const raw = await kvGet(ANALYTICS_KEY);
  return raw ? safeParse<AnalyticsEvent[]>(raw, []) : [];
}
