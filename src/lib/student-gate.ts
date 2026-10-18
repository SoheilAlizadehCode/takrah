// ─── گیت دانلود بخش دانش‌آموزی تک‌راه ───
// مسیر دانش‌آموز: ورود با گوگل ← تأیید عضویت کانال با کد ربات ← تبلیغ کوتاه ← دانلود.
// طراحی کاملاً stateless (بدون دیتابیس): سشن داخل کوکی امضاشده با HMAC ذخیره می‌شود و
// کد تأیید هم خودتأیید است (امضای HMAC روی nonce + شناسه تلگرام کاربر).
// توضیح فلو: سایت دکمه‌ای به t.me/TakrahTop_bot?start=dlv_<nonce> می‌دهد؛ ربات بعد از
// چک عضویت، کد «nonce.tgId.امضا» را می‌فرستد؛ سایت با بررسی امضا + چک مجدد عضویت،
// کوکی تأییدشده می‌سازد. هیچ حالت مشترکی بین ربات و سایت لازم نیست.

import crypto from "crypto";

export const STUDENT_COOKIE = "tk_student";
export const GATE_CHANNEL = "@takrahTop";
export const GATE_CHANNEL_URL = "https://t.me/takrahTop";
export const GATE_BOT_USERNAME = "TakrahTop_bot";
export const GATE_SITE_URL = "https://takrah.top";
export const GATE_DOWNLOAD_URL = `${GATE_SITE_URL}/student/download`;
/** مدت تبلیغ قبل از باز شدن لینک دانلود (ثانیه) */
export const GATE_AD_SECONDS = 15;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** توکن بات — مثل route.ts برای سازگاری مقدار پیش‌فرض دارد؛ متغیر محیطی اولویت دارد. */
function botToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN ?? "8681245270:AAHuamrLbL8Fhk-sJCleAejlWpo6F0jpNzc";
}

/** کلید امضای گیت — از توکن بات مشتق می‌شود (هرگز سمت کلاینت نیست). */
function gateSecret(): Buffer {
  return crypto.createHash("sha256").update(`${botToken()}:student-gate-v1`).digest();
}

export interface StudentSession {
  /** ورود با گوگل */
  email?: string;
  name?: string;
  picture?: string;
  /** ورود موقت مهمان (فقط وقتی Google OAuth هنوز تنظیم نشده) */
  guest?: boolean;
  /** تلگرام */
  tgId?: number;
  tgName?: string;
  /** عضویت کانال تأیید شده است */
  verified?: boolean;
  /** زمان تأیید عضویت (ms) — برای enforce سمت سرور انتظار تبلیغ */
  verifiedAt?: number;
  ts: number;
}

function hmacHex(data: string): string {
  return crypto.createHmac("sha256", gateSecret()).update(data).digest("hex");
}

/* ─── کوکی سشن امضاشده ─────────────────────────────────────────── */

export function signSession(s: StudentSession): string {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  const mac = crypto.createHmac("sha256", gateSecret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function parseSession(value: string | undefined | null): StudentSession | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  const expected = crypto
    .createHmac("sha256", gateSecret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as StudentSession;
    if (!s.ts || Date.now() - s.ts > SESSION_TTL_MS) return null;
    return s;
  } catch {
    return null;
  }
}

/* ─── کد تأیید تلگرام: "<nonce>.<tgId>.<امضا>" ─────────────────── */

export function makeVerifyCode(nonce: string, tgId: number): string {
  const sig = hmacHex(`${nonce}.${tgId}`).slice(0, 16);
  return `${nonce}.${tgId}.${sig}`;
}

/** کد را با nonce صفحه بررسی می‌کند؛ درست بودن tgId برمی‌گردد وگرنه null. */
export function parseVerifyCode(code: string, nonce: string): number | null {
  const parts = (code ?? "").trim().split(".");
  if (parts.length !== 3) return null;
  const [n, idRaw, sig] = parts;
  if (n !== nonce) return null;
  const tgId = Number(idRaw);
  if (!Number.isInteger(tgId) || tgId < 1 || tgId > 1e12) return null;
  const expected = hmacHex(`${n}.${tgId}`).slice(0, 16);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return tgId;
}

/* ─── عضویت کانال ──────────────────────────────────────────────── */

export type MembershipResult = "member" | "not_member" | "unknown";

export async function channelMembership(tgId: number): Promise<MembershipResult> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken()}/getChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: GATE_CHANNEL, user_id: tgId }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json().catch(() => null)) as {
      ok?: boolean;
      result?: { status?: string; is_member?: boolean };
    } | null;
    if (!json?.ok || !json.result?.status) return "unknown";
    const st = json.result.status;
    if (st === "creator" || st === "administrator" || st === "member") return "member";
    if (st === "restricted") return json.result.is_member === false ? "not_member" : "member";
    return "not_member"; // left | kicked
  } catch {
    return "unknown";
  }
}

/* ─── گزینه‌های کوکی ───────────────────────────────────────────── */

export function cookieOptions(secure: boolean) {
  return {
    httpOnly: true as const,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}
