// ─── لایه‌ی پرداخت و اشتراک — زرین‌پال v4 ───
// دکتر پلن و دوره را انتخاب می‌کند (۱/۶/۱۲ ماهه) → پرداخت آنلاین → فعال‌سازی خودکار.
// هیچ پیگیری دستی، هیچ سرور اضافه، هیچ سورس‌کدی تحویل مشتری نمی‌شود.
// تنظیم Vercel (فقط یک متغیر):
//   ZARINPAL_MERCHANT_ID → UUID مرچنت از پنل zarinpal.com
//   ZARINPAL_SANDBOX=1   → برای تست با مرچنت صفر (پرداخت آزمایشی، بدون پول واقعی)
import { kvGet, kvSet, kvAppendCapped, safeParse } from "./kv";
import { SITE_URL } from "./clinic-bot";
import { updateTenant, type Tenant, type TenantPlan } from "./tenants";

export const ZARINPAL_MERCHANT = (process.env.ZARINPAL_MERCHANT_ID ?? "").trim();
const SANDBOX = process.env.ZARINPAL_SANDBOX === "1";
export const PAYMENTS_LIVE = Boolean(ZARINPAL_MERCHANT) || SANDBOX;

// ─── قیمت‌ها به تومان — خرید ۶ ماهه = یک ماه رایگان، سالانه = دو ماه رایگان ───
export type PayMonths = 1 | 6 | 12;
export const PRICES: Record<"basic" | "pro", Record<PayMonths, number>> = {
  // تومان
  basic: { 1: 990_000, 6: 4_950_000, 12: 9_900_000 },
  pro: { 1: 1_990_000, 6: 9_950_000, 12: 19_900_000 },
};
export const PLAN_LABEL: Record<"basic" | "pro", string> = {
  basic: "نوبت‌دهی آنلاین",
  pro: "دستیار دکتر",
};
export const MONTHS_LABEL: Record<PayMonths, string> = {
  1: "یک‌ماهه",
  6: "شش‌ماهه (یک ماه رایگان)",
  12: "سالانه (دو ماه رایگان)",
};

const RIAL = 10; // زرین‌پال v4 مبلغ را به ریال می‌خواهد

export interface PayRecord {
  authority: string;
  refId: string;
  slug: string;
  amount: number; // تومان
  plan: TenantPlan;
  months: PayMonths;
  t: number;
}

const pendingKey = (authority: string) => `pay:pending:${authority.toLowerCase()}`;

export function merchantId(): string {
  if (SANDBOX) return "00000000-0000-0000-0000-000000000000";
  return ZARINPAL_MERCHANT;
}

// ─── گام ۱: درخواست پرداخت از زرین‌پال ───
export async function zarinpalRequest(
  amountToman: number,
  description: string,
): Promise<{ ok: true; authority: string; url: string } | { ok: false; err: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId(),
        amount: amountToman * RIAL,
        description: description.slice(0, 200),
        callback_url: `${SITE_URL}/api/billing/callback`,
        metadata: { site: "takrah.top" },
      }),
      signal: ctrl.signal,
    });
    const j = (await res.json().catch(() => null)) as {
      data?: { authority?: string; code?: number };
      errors?: { message?: string; code?: number } | { message?: string; code?: number }[];
    } | null;
    const authority = j?.data?.authority;
    if (j?.data?.code === 100 && authority) {
      return { ok: true, authority, url: `https://www.zarinpal.com/pg/StartPay/${authority}` };
    }
    const errArr = Array.isArray(j?.errors) ? j?.errors : j?.errors ? [j.errors] : [];
    const msg = errArr[0]?.message ?? `کد ${j?.data?.code ?? "نامشخص"}`;
    await kvSet("dbg:zarinpal", JSON.stringify({ t: Date.now(), stage: "request", body: JSON.stringify(j).slice(0, 400) }));
    return { ok: false, err: msg };
  } catch (e) {
    await kvSet("dbg:zarinpal", JSON.stringify({ t: Date.now(), stage: "request", body: e instanceof Error ? e.message : "error" }));
    return { ok: false, err: "خطای ارتباط با درگاه" };
  } finally {
    clearTimeout(timer);
  }
}

// ─── گام ۲: تأیید پرداخت بعد از برگشت از درگاه ───
export async function zarinpalVerify(
  amountToman: number,
  authority: string,
): Promise<{ ok: true; refId: string } | { ok: false; err: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId(),
        amount: amountToman * RIAL,
        authority,
      }),
      signal: ctrl.signal,
    });
    const j = (await res.json().catch(() => null)) as {
      data?: { code?: number; ref_id?: number };
      errors?: { message?: string } | { message?: string }[];
    } | null;
    const code = j?.data?.code;
    if ((code === 100 || code === 101) && j?.data?.ref_id) {
      return { ok: true, refId: String(j.data.ref_id) };
    }
    const errArr = Array.isArray(j?.errors) ? j?.errors : j?.errors ? [j.errors] : [];
    await kvSet("dbg:zarinpal", JSON.stringify({ t: Date.now(), stage: "verify", body: JSON.stringify(j).slice(0, 400) }));
    return { ok: false, err: errArr[0]?.message ?? `کد ${code ?? "نامشخص"}` };
  } catch (e) {
    await kvSet("dbg:zarinpal", JSON.stringify({ t: Date.now(), stage: "verify", body: e instanceof Error ? e.message : "error" }));
    return { ok: false, err: "خطای ارتباط با درگاه" };
  } finally {
    clearTimeout(timer);
  }
}

// ─── پرداخت در انتظار تأیید (۴۸ ساعت) ───
export async function savePendingPay(authority: string, rec: Omit<PayRecord, "refId" | "t">): Promise<void> {
  await kvSet(pendingKey(authority), JSON.stringify({ ...rec, t: Date.now() }), 48 * 3600);
}

export async function getPendingPay(authority: string): Promise<PayRecord | null> {
  const raw = await kvGet(pendingKey(authority));
  if (!raw) return null;
  const rec = safeParse<PayRecord>(raw, null as unknown as PayRecord);
  return rec?.authority ? rec : null;
}

// ─── فعال‌سازی اشتراک — تاریخ انقضا از امروز (یا انقضای قبلی، هرکدام دیرتر) + N ماه ───
export function addMonths(ts: number, months: number): number {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

export async function activateSubscription(
  slug: string,
  plan: TenantPlan,
  months: PayMonths,
  record: PayRecord,
): Promise<{ tenant: Tenant; paidUntil: number } | null> {
  const cur = await updateTenant(slug, {}); // فقط برای خواندن با انقضای خودکار
  if (!cur) return null;
  const base = cur.paidUntil && cur.paidUntil > Date.now() ? cur.paidUntil : Date.now();
  const paidUntil = addMonths(base, months);
  const next = await updateTenant(slug, {
    plan: plan === "trial" ? cur.plan : plan,
    status: "active",
    trialEnds: cur.trialEnds,
    paidUntil,
  });
  if (!next) return null;
  await kvAppendCapped(`t:${slug}:pays`, record, 20);
  return { tenant: next, paidUntil };
}

export function faDate(ts: number): string {
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(ts));
}
