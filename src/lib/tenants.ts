// ─── لایه‌ی مولتی‌تننت — هر کلینیک یک مستأجر با فضای اختصاصی خودش ───
// ساختار کلیدها در Upstash:
//   t:index                     → فهرست slug همه‌ی کلینیک‌ها
//   t:<slug>:config             → تنظیمات کامل کلینیک (JSON)
//   t:<slug>:bookings:<date>    → نوبت‌های آن روز (YYYY-MM-DD)
//   t:<slug>:intake:<id>        → پرسش‌نامه‌ی بیمار + خلاصه‌ی هوش مصنوعی
//   t:<slug>:aud:<id>           → وویس خلاصه‌ی بیمار (TTL ۷ روز)
//   t:<slug>:usage:<YYYY-MM>    → شمارنده‌ی مصرف «دستیار پزشک» در ماه
//   ref:<code>                  → آمار ثبت با کد بازاریاب
// بدون Upstash همه‌چیز روی حافظه‌ی سرور کار می‌کند (دمو) — همان رفتار kv.ts
import { kvGet, kvSet, safeParse } from "./kv";
import { ADMIN_CHAT_ID, CLINIC, DOCTORS, SLOTS } from "./clinic-bot";
import { createHash, randomBytes } from "crypto";
import { ttsSpeak } from "./voice";

export interface TDoctor {
  id: string;
  name: string;
  spec: string;
  days: string;
}

export type TenantPlan = "trial" | "basic" | "pro";
export type TenantStatus = "trial" | "active" | "expired" | "archived";

export interface Tenant {
  slug: string;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
  doctors: TDoctor[];
  slots: string[];
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: number;
  trialEnds: number; // timestamp — برای status==="trial"
  ownerChatId: string; // چت‌آی‌دی پزشک/منشی برای اطلاع‌رسانی خودکار
  refCode: string;
  type: "matb" | "clinic"; // مطب خصوصی (پیش‌فرض — بازار اصلی) یا کلینیک چندپزشکه
  paidUntil: number; // timestamp انقضای اشتراک پرداختی — ۰ = نامحدود (دمو)
}

export interface TenantBooking {
  id: string;
  date: string; // YYYY-MM-DD
  slot: string;
  doctorId: string;
  doctorName: string;
  name: string;
  phone: string;
  note: string;
  t: number;
}

export interface TenantIntake {
  id: string;
  slug: string;
  name: string;
  age: string;
  phone: string;
  complaint: string;
  history: string;
  meds: string;
  allergies: string;
  pain: number;
  extra: string;
  doctorId: string;
  summary: string;
  urgency: "low" | "mid" | "high";
  audioSig: string;
  t: number;
}

// ─── محدودیت مصرف «خلاصه‌ی دستیار پزشک» در هر ماه ───
export const PLAN_INTAKE_LIMIT: Record<TenantPlan, number> = {
  trial: 15,
  basic: 60,
  pro: 200,
};
export const TRIAL_DAYS = 14;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,31}$/;
const cfgKey = (slug: string) => `t:${slug}:config`;

export function slugValid(slug: string): boolean {
  return SLUG_RE.test(slug);
}

async function indexGet(): Promise<string[] | null> {
  const raw = await kvGet("t:index");
  return raw ? safeParse<string[]>(raw, []) : null;
}

async function indexAdd(slug: string): Promise<void> {
  const list = (await indexGet()) ?? [];
  if (!list.includes(slug)) list.push(slug);
  await kvSet("t:index", JSON.stringify(list));
}

// ─── بذر خودکار: کلینیک سلامت به‌عنوان نخستین مستأجر (یک‌بار برای همیشه) ───
export async function ensureSeed(): Promise<void> {
  const idx = await indexGet();
  if (idx !== null) return; // قبلاً مقداردهی شده
  await kvSet("t:index", JSON.stringify(["salamat"]));
  await kvSet(
    cfgKey("salamat"),
    JSON.stringify({
      slug: "salamat",
      name: CLINIC.name,
      tagline: "منشی هوشمند + وب‌سایت نوبت‌دهی آنلاین",
      address: CLINIC.address,
      phone: CLINIC.phone,
      whatsapp: CLINIC.whatsapp,
      hours: CLINIC.hours,
      doctors: DOCTORS,
      slots: SLOTS,
      plan: "pro",
      status: "active",
      createdAt: Date.now(),
      trialEnds: 0,
      ownerChatId: ADMIN_CHAT_ID,
      refCode: "",
      type: "clinic",
      paidUntil: 0,
    } satisfies Tenant),
  );
}

export async function slugFree(slug: string): Promise<boolean> {
  if (!slugValid(slug)) return false;
  const idx = (await indexGet()) ?? [];
  return !idx.includes(slug);
}

export function randomSlug(): string {
  return `c-${randomBytes(3).toString("hex")}`; // مثل c-7fa2b1
}

export interface CreateTenantInput {
  name: string;
  slug?: string;
  tagline?: string;
  address?: string;
  phone: string;
  whatsapp?: string;
  hours?: string;
  doctors: { name: string; spec?: string; days?: string }[];
  slots?: string[];
  plan?: TenantPlan;
  ownerChatId?: string;
  refCode?: string;
  type?: "matb" | "clinic";
}

export type CreateResult =
  | { ok: true; tenant: Tenant }
  | { ok: false; err: string };

export async function createTenant(input: CreateTenantInput): Promise<CreateResult> {
  const name = (input.name ?? "").trim();
  if (name.length < 3) return { ok: false, err: "نام مطب/کلینیک باید حداقل ۳ حرف باشد" };
  const phone = (input.phone ?? "").trim();
  if (!/^[\d+\-\s]{9,15}$/.test(phone)) return { ok: false, err: "شماره تلفن معتبر نیست" };

  let slug = (input.slug ?? "").trim().toLowerCase();
  if (!slug) slug = randomSlug();
  if (!slugValid(slug)) return { ok: false, err: "آدرس فقط حروف انگلیسی کوچک، عدد و خط تیره (۲ تا ۳۲ نویسه)" };
  if (!(await slugFree(slug))) return { ok: false, err: "این آدرس قبلاً گرفته شده — یکی دیگر انتخاب کنید" };

  const doctors: TDoctor[] = (input.doctors ?? [])
    .map((d, i) => ({
      id: `d${i + 1}`,
      name: (d.name ?? "").trim().slice(0, 60),
      spec: (d.spec ?? "").trim().slice(0, 40) || "عمومی",
      days: (d.days ?? "").trim().slice(0, 60) || "شنبه تا پنجشنبه",
    }))
    .filter((d) => d.name.length > 1)
    .slice(0, 12);
  if (!doctors.length) return { ok: false, err: "حداقل یک پزشک با نام وارد کنید" };

  const plan: TenantPlan = input.plan === "basic" || input.plan === "pro" ? input.plan : "trial";
  const now = Date.now();
  // پلن پرداختی هم با ۱۴ روز تریال شروع می‌شود؛ بعد از پرداخت زرین‌پال → active تا paidUntil
  const tenant: Tenant = {
    slug,
    name: name.slice(0, 80),
    tagline: (input.tagline ?? "").trim().slice(0, 90) || "نوبت‌دهی آنلاین و پاسخگویی هوشمند",
    address: (input.address ?? "").trim().slice(0, 160) || "—",
    phone,
    whatsapp: (input.whatsapp ?? "").trim().slice(0, 20),
    hours: (input.hours ?? "").trim().slice(0, 200) || "شنبه تا پنجشنبه\nصبح ۹ تا ۱۳ — عصر ۱۶ تا ۲۰",
    doctors,
    slots: (input.slots?.length ? input.slots : SLOTS).slice(0, 24),
    plan,
    status: "trial",
    createdAt: now,
    trialEnds: now + TRIAL_DAYS * 86400_000,
    ownerChatId: (input.ownerChatId ?? "").replace(/\D/g, "").slice(0, 15),
    refCode: (input.refCode ?? "").trim().toLowerCase().slice(0, 24),
    type: input.type === "clinic" ? "clinic" : "matb",
    paidUntil: 0,
  };
  await kvSet(cfgKey(slug), JSON.stringify(tenant));
  await indexAdd(slug);
  if (tenant.refCode) await hitRef(tenant.refCode, slug);
  return { ok: true, tenant };
}

/** خواندن مطب/کلینیک + انقضای خودکار تریال و اشتراک پرداختی */
export async function getTenant(slug: string): Promise<Tenant | null> {
  await ensureSeed();
  const raw = await kvGet(cfgKey(slug));
  if (!raw) return null;
  const t = safeParse<Tenant>(raw, null as unknown as Tenant);
  if (!t?.slug) return null;
  if (t.type === undefined) t.type = "clinic"; // سازگاری با مستأجرهای قدیمی
  if (t.paidUntil === undefined) t.paidUntil = 0;
  const now = Date.now();
  if (t.status === "trial" && t.trialEnds && now > t.trialEnds) {
    t.status = "expired";
    await kvSet(cfgKey(slug), JSON.stringify(t));
  } else if (t.status === "active" && t.paidUntil && now > t.paidUntil) {
    t.status = "expired";
    await kvSet(cfgKey(slug), JSON.stringify(t));
  }
  return t;
}

export async function updateTenant(slug: string, patch: Partial<Tenant>): Promise<Tenant | null> {
  const t = await getTenant(slug);
  if (!t) return null;
  const next = { ...t, ...patch, slug, createdAt: t.createdAt };
  await kvSet(cfgKey(slug), JSON.stringify(next));
  return next;
}

// ─── نوبت‌ها ───
const dayKey = (slug: string, date: string) => `t:${slug}:bookings:${date}`;

export async function getBookings(slug: string, date: string): Promise<TenantBooking[]> {
  const raw = await kvGet(dayKey(slug, date));
  return raw ? safeParse<TenantBooking[]>(raw, []) : [];
}

export async function addBooking(
  slug: string,
  b: Omit<TenantBooking, "id" | "t">,
): Promise<{ ok: true; booking: TenantBooking } | { ok: false; err: string }> {
  const list = await getBookings(slug, b.date);
  if (list.length >= 24) return { ok: false, err: "ظرفیت این روز پر است" };
  if (list.some((x) => x.slot === b.slot)) return { ok: false, err: "این ساعت همین حالا گرفته شد — ساعت دیگری انتخاب کنید" };
  const booking: TenantBooking = { ...b, id: randomBytes(4).toString("hex"), t: Date.now() };
  list.push(booking);
  await kvSet(dayKey(slug, b.date), JSON.stringify(list.slice(-200)));
  return { ok: true, booking };
}

// ─── پرسش‌نامه و وویس دستیار پزشک ───
const AUDIO_SECRET = process.env.INTAKE_AUDIO_SECRET ?? "takrah-intake-audio-91f4";
const intakeKey = (slug: string, id: string) => `t:${slug}:intake:${id}`;

export function intakeAudioSig(slug: string, id: string): string {
  return createHash("sha256").update(`${slug}:${id}:${AUDIO_SECRET}`).digest("hex").slice(0, 20);
}

export async function putIntakeAudio(slug: string, id: string, buf: Buffer): Promise<string> {
  const sig = intakeAudioSig(slug, id);
  await kvSet(`t:${slug}:aud:${id}`, buf.toString("base64"), 7 * 86400); // TTL ۷ روز
  return sig;
}

/** لینک امن وویس — فقط با امضای درست */
export function intakeAudioUrl(slug: string, id: string, sig: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://takrah.top").replace(/\/$/, "");
  return `${base}/api/tenants/audio?s=${slug}&id=${id}&k=${sig}`;
}

export async function verifyIntakeAudio(slug: string, id: string, k: string): Promise<Buffer | null> {
  if (!slugValid(slug) || !/^[a-z0-9]{1,40}$/i.test(id) || !/^[a-f0-9]{10,32}$/i.test(k)) return null;
  if (intakeAudioSig(slug, id) !== k) return null;
  const b64 = await kvGet(`t:${slug}:aud:${id}`);
  if (!b64) return null;
  return Buffer.from(b64, "base64");
}

export function newIntakeId(): string {
  return `i${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;
}

export async function putIntake(
  slug: string,
  id: string,
  rec: Omit<TenantIntake, "id" | "t" | "slug">,
): Promise<TenantIntake> {
  const full: TenantIntake = { ...rec, id, slug, t: Date.now() };
  await kvSet(intakeKey(slug, id), JSON.stringify(full), 30 * 86400); // TTL ۳۰ روز
  return full;
}

export async function saveIntake(
  slug: string,
  rec: Omit<TenantIntake, "id" | "t" | "slug">,
): Promise<TenantIntake> {
  return putIntake(slug, newIntakeId(), rec);
}

// ─── مصرف ماهانه‌ی دستیار پزشک ───
export async function getUsage(slug: string): Promise<number> {
  const ym = new Date().toISOString().slice(0, 7);
  const raw = await kvGet(`t:${slug}:usage:${ym}`);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export async function bumpUsage(slug: string): Promise<number> {
  const ym = new Date().toISOString().slice(0, 7);
  const key = `t:${slug}:usage:${ym}`;
  const n = (await getUsage(slug)) + 1;
  await kvSet(key, String(n));
  return n;
}

// ─── کد بازاریاب ───
export async function hitRef(code: string, slug: string): Promise<void> {
  const key = `ref:${code}`;
  const raw = await kvGet(key);
  const rec = raw ? safeParse<{ n: number; tenants: string[] }>(raw, { n: 0, tenants: [] }) : { n: 0, tenants: [] };
  rec.n += 1;
  if (!rec.tenants.includes(slug)) rec.tenants.push(slug);
  await kvSet(key, JSON.stringify({ n: rec.n, tenants: rec.tenants.slice(-50) }));
}

// ─── وویس خلاصه‌ی بیمار — صدای دلارا (رایگان) ───
export async function intakeVoice(summary: string): Promise<Buffer | null> {
  const r = await ttsSpeak(summary);
  return r ? r.buf : null;
}
