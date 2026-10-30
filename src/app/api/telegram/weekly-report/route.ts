// ─── گزارش هفتگی تک‌راه از Google Analytics 4 ───
// Vercel Cron هر دوشنبه ۰۹:۰۰ تهران اجرا می‌کند → خلاصهٔ هفته به تلگرام صاحب سایت می‌رود.
// دسترسی دستی در مرورگر هم هست: /api/telegram/weekly-report?key=<REPORT_KEY>
//   اگر تلگرام تنظیم نباشد، همان گزارش به شکل صفحهٔ HTML نمایش داده می‌شود.
//
// تنظیمات Vercel:
//   GA_SERVICE_ACCOUNT_JSON → کلید JSON سرویس‌اکانت گوگل (خام یا base64) — مراحل در خود صفحهٔ گزارش آمده
//   GA_PROPERTY_ID          → شناسهٔ پراپرتی GA4 (پیش‌فرض همین سایت: 556099118)
//   TELEGRAM_ADMIN_CHAT_ID  → چت‌آی‌دی صاحب سایت (از @userinfobot بگیرد)
//   CRON_SECRET             → هدر فراخوانی خودکار Vercel (اختیاری)
//   REPORT_KEY              → کلید دسترسی دستی (پیش‌فرض: همان سکرت وبهوک)
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { botToken } from "@/lib/student-gate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_PROPERTY_ID = "556099118";
const DEFAULT_REPORT_KEY = "tk9f4e2c1a7b35d8e0f6a4c2b9d17e35";

const fa = (n: number | string): string => Number(n).toLocaleString("fa-IR");
const pct = (cur: number, prev: number): string => {
  if (prev === 0) return cur > 0 ? "↑ تازه" : "—";
  const d = Math.round(((cur - prev) / prev) * 100);
  return d >= 0 ? `▲ +${fa(d)}٪` : `▼ ${fa(d)}٪`;
};

const COUNTRY_FA: Record<string, string> = {
  Iran: "ایران",
  "United States": "آمریکا",
  China: "چین",
  Germany: "آلمان",
  Turkey: "ترکیه",
  Finland: "فنلاند",
  Canada: "کانادا",
  France: "فرانسه",
  Netherlands: "هلند",
  "United Kingdom": "انگلیس",
  Sweden: "سوئد",
  Japan: "ژاپن",
  Russia: "روسیه",
  India: "هند",
  Iraq: "عراق",
  UAE: "امارات",
};

/* ─── احراز هویت سرویس‌اکانت (JWT → access token) ─── */
type ServiceAccount = { client_email: string; private_key: string };

async function gaAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object): string => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = b64({ alg: "RS256", typ: "JWT" });
  const claim = b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  });
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${head}.${claim}`);
  const sig = signer.sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${claim}.${sig}`,
    }),
    signal: AbortSignal.timeout(12000),
  });
  const j = (await res.json().catch(() => null)) as { access_token?: string; error_description?: string } | null;
  if (!j?.access_token) throw new Error(`oauth: ${j?.error_description ?? res.status}`);
  return j.access_token;
}

async function runReport(propId: string, token: string, body: Record<string, unknown>): Promise<GAResponse> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const j = (await res.json().catch(() => null)) as GAResponse & { error?: { message?: string } } | null;
  if (!res.ok) throw new Error(`runReport ${res.status}: ${j?.error?.message ?? "unknown"}`);
  return j ?? {};
}

/* ─── انواع GA ─── */
interface GAResponse {
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
}
const cell = (r: NonNullable<GAResponse["rows"]>[number], i: number): number =>
  Number(r.metricValues?.[i]?.value ?? 0);

/* ─── ساخت گزارش ─── */
async function buildWeeklyReport(): Promise<string> {
  const saRaw = process.env.GA_SERVICE_ACCOUNT_JSON ?? "";
  const propId = process.env.GA_PROPERTY_ID || DEFAULT_PROPERTY_ID;
  let sa: ServiceAccount;
  try {
    const decoded = saRaw.includes("{")
      ? saRaw
      : Buffer.from(saRaw, "base64").toString("utf8");
    const parsed = JSON.parse(decoded.trim()) as ServiceAccount & { private_key?: string };
    sa = {
      client_email: parsed.client_email,
      private_key: (parsed.private_key ?? "").replace(/\\n/g, "\n"),
    };
    if (!sa.client_email || !sa.private_key) throw new Error("فیلدهای client_email/private_key خالی است");
  } catch (e) {
    throw new Error(`کلید سرویس‌اکانت نامعتبر است: ${(e as Error).message}`);
  }

  const token = await gaAccessToken(sa);
  const THIS_WEEK = { startDate: "7daysAgo", endDate: "yesterday" };
  const LAST_WEEK = { startDate: "14daysAgo", endDate: "8daysAgo" };

  // جمع کل دو هفته — با بعدِ dateRange دو سطر برمی‌گردد (این هفته / هفتهٔ قبل)
  const totals = await runReport(propId, token, {
    dateRanges: [THIS_WEEK, LAST_WEEK],
    dimensions: [{ name: "dateRange" }],
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "sessions" },
      { name: "eventCount" },
    ],
  });
  const cur = totals.rows?.find((r) => r.dimensionValues?.[0]?.value === "date_range_0");
  const prev = totals.rows?.find((r) => r.dimensionValues?.[0]?.value === "date_range_1");
  if (!cur) throw new Error("GA هیچ داده‌ای برای هفتهٔ گذشته برنگرداند");
  const [users, views, sessions, events] = [0, 1, 2, 3].map((i) => cell(cur, i));
  const [pUsers, pViews, pSessions, pEvents] = prev
    ? [0, 1, 2, 3].map((i) => cell(prev, i))
    : [0, 0, 0, 0];

  // رویدادهای کلیدی — جدا تا خطای نام متریک بقیهٔ گزارش را نبرد
  let keyEvents = -1;
  try {
    const ke = await runReport(propId, token, {
      dateRanges: [THIS_WEEK],
      metrics: [{ name: "keyEvents" }],
    });
    keyEvents = ke.rows?.[0] ? cell(ke.rows[0], 0) : 0;
  } catch {
    /* متریک در این نسخهٔ API نیست — مهم نیست */
  }

  // پربازدیدترین صفحات
  const pages = await runReport(propId, token, {
    dateRanges: [THIS_WEEK],
    dimensions: [{ name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 5,
  });

  // کشورها
  const countries = await runReport(propId, token, {
    dateRanges: [THIS_WEEK],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 6,
  });

  const lines: string[] = [
    "📊 گزارش هفتگی تک‌راه",
    "─────────────────────",
    `👥 کاربر فعال: ${fa(users)} (${pct(users, pUsers)})`,
    `📄 بازدید صفحه: ${fa(views)} (${pct(views, pViews)})`,
    `🔎 نشست: ${fa(sessions)} (${pct(sessions, pSessions)})`,
    `⚡ رویدادها: ${fa(events)} (${pct(events, pEvents)})`,
  ];
  if (keyEvents >= 0) lines.push(`⭐ رویداد کلیدی: ${fa(keyEvents)}`);
  if (pages.rows?.length) {
    lines.push("", "🏆 پربازدیدترین صفحات:");
    pages.rows.forEach((r, i) => {
      const t = r.dimensionValues?.[0]?.value ?? "—";
      lines.push(`${fa(i + 1)}. ${t.slice(0, 50)} — ${fa(r.metricValues?.[0]?.value ?? 0)} بازدید`);
    });
  }
  if (countries.rows?.length) {
    lines.push("", "🌍 کاربران بر اساس کشور:");
    countries.rows.forEach((r) => {
      const name = r.dimensionValues?.[0]?.value ?? "—";
      lines.push(`• ${COUNTRY_FA[name] ?? name}: ${fa(r.metricValues?.[0]?.value ?? 0)}`);
    });
  }
  lines.push("", "تا هفتهٔ بعد 🚀");
  return lines.join("\n");
}

/* ─── ارسال تلگرام ─── */
async function sendTelegram(chatId: string, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(12000),
  });
  const j = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  if (!j?.ok) throw new Error(`telegram: ${j?.description ?? res.status}`);
}

/* ─── صفحات HTML ─── */
function htmlPage(title: string, bodyHtml: string): NextResponse {
  const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/><title>${title}</title>
<style>
body{font-family:Vazirmatn,Tahoma,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px;line-height:1.9}
.card{max-width:720px;margin:24px auto;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px}
h1{font-size:1.3rem;margin:0 0 12px}h2{font-size:1.05rem;color:#6ee7b7;margin:20px 0 6px}
pre{background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px;overflow-x:auto;direction:ltr;text-align:left;font-size:.8rem}
ol{padding-right:20px}li{margin-bottom:6px}code{background:#0f172a;padding:2px 6px;border-radius:6px;direction:ltr;display:inline-block}
.ok{color:#6ee7b7}.warn{color:#fbbf24}
</style></head><body><div class="card">${bodyHtml}</div></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

const SETUP_HTML = `
<h1>📊 گزارش هفتگی تک‌راه — هنوز تنظیم نشده</h1>
<p>این مسیر آماده است ولی برای اینکه داده‌های واقعی گوگل آنالیتیکس را بخواند، باید <b>۳ متغیر</b> در Vercel ست شود:</p>
<h2>۱) شناسهٔ پراپرتی</h2>
<p><code>GA_PROPERTY_ID = 556099118</code> <span class="ok">(از آدرس داشبورد خودت استخراج شده — همین را بگذار)</span></p>
<h2>۲) کلید سرویس‌اکانت گوگل</h2>
<p><code>GA_SERVICE_ACCOUNT_JSON</code> — مراحل ۱۰ دقیقه‌ای:</p>
<ol>
<li>برو به <code>console.cloud.google.com</code> → یک پروژه بساز (مثلاً takrah-analytics)</li>
<li>منوی APIها → <b>Google Analytics Data API</b> را Enable کن</li>
<li>IAM → Service Accounts → <b>Create Service Account</b> (بدون نقش خاص)</li>
<li>ورود به سرویس‌اکانت → Keys → <b>Add key → JSON</b> → فایل دانلود می‌شود</li>
<li>در GA4: Admin → Property Access Management → <b>+</b> → همان ایمیل سرویس‌اکانت را با نقش <b>Viewer</b> اضافه کن</li>
<li>محتوای کامل فایل JSON را در متغیر <code>GA_SERVICE_ACCOUNT_JSON</code> بگذار و دوباره Deploy کن</li>
</ol>
<h2>۳) چت‌آی‌دی خودت برای تلگرام</h2>
<p>در تلگرام به <code>@userinfobot</code> پیام بده → عدد Id را کپی کن → در Vercel:</p>
<p><code>TELEGRAM_ADMIN_CHAT_ID = &lt;عدد تو&gt;</code></p>
<p class="warn">بعد از ست کردن هر سه، از دوشنبهٔ بعد ساعت ۹ صبح گزارش خودکار می‌آید؛ یا همین آدرس را باز کن و گزارش را همین‌جا ببین.</p>`;

const ERROR_HTML = (msg: string) => `
<h1>⚠️ خطا در خواندن GA</h1><p>گزارش هفتگی تنظیم شده ولی موقع خواندن داده خطا داد:</p>
<pre>${msg.replace(/</g, "&lt;").slice(0, 400)}</pre>
<p>بیشتر مواقع مشکل یکی از این‌هاست: Analytics Data API هنوز Enable نشده، یا ایمیل سرویس‌اکانت به‌عنوان Viewer در Property Access Management اضافه نشده.</p>`;

function reportHtml(r: string): string {
  const rows = r
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) =>
      l.startsWith("📊") || l.startsWith("🏆") || l.startsWith("🌍")
        ? `<h2>${l}</h2>`
        : `<div>${l.replace(/</g, "&lt;")}</div>`,
    )
    .join("\n");
  return `<h1>📊 گزارش هفتگی تک‌راه</h1>${rows}`;
}

/* ─── هندلر ─── */
async function handle(req: NextRequest, forceHtml: boolean): Promise<NextResponse> {
  // احراز هویت: هدر Vercel Cron یا کلید دستی
  const cronSecret = process.env.CRON_SECRET;
  const keyParam = req.nextUrl.searchParams.get("key") ?? "";
  const manualKey = process.env.REPORT_KEY || DEFAULT_REPORT_KEY;
  const authed =
    (cronSecret ? req.headers.get("authorization") === `Bearer ${cronSecret}` : false) ||
    keyParam === manualKey;
  if (!authed) {
    return NextResponse.json({ ok: false, error: "unauthorized — کلید را با ?key= بفرست" }, { status: 401 });
  }

  if (!process.env.GA_SERVICE_ACCOUNT_JSON) {
    if (forceHtml || !process.env.TELEGRAM_ADMIN_CHAT_ID) {
      return htmlPage("تنظیم گزارش هفتگی تک‌راه", SETUP_HTML);
    }
    return NextResponse.json({ ok: false, error: "GA_SERVICE_ACCOUNT_JSON تنظیم نشده" });
  }

  let report: string;
  try {
    report = await buildWeeklyReport();
  } catch (e) {
    const msg = (e as Error).message;
    if (forceHtml || !process.env.TELEGRAM_ADMIN_CHAT_ID) {
      return htmlPage("خطای گزارش هفتگی", ERROR_HTML(msg));
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }

  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chatId || forceHtml) {
    return htmlPage("گزارش هفتگی تک‌راه", reportHtml(report));
  }
  try {
    await sendTelegram(chatId, report);
    return NextResponse.json({ ok: true, sentTo: chatId, report });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, report }, { status: 502 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handle(req, req.nextUrl.searchParams.has("html"));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handle(req, req.nextUrl.searchParams.has("html"));
}
