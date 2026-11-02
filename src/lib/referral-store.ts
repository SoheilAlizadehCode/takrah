// ─── استور سبک رفرال ربات تک‌راه ───
// بدون دیتابیس/مایگریشن: یک JSON روی دیسک (data/referrals.json) با نوشتن اتمیک.
// فلو: کاربر با /start r<inviterId> می‌آید → رکورد ثبت می‌شود → به محض اینکه
// عضو کانال شد (هر مسیر عضویت) رکورد joined می‌شود → دعوت‌کننده به ۳ نفر که برسد
// پاداش (چک‌لیست ۳۰ روزه) می‌گیرد. فقط شناسه‌های تلگرام و زمان ذخیره می‌شود.
import fs from "node:fs";
import path from "node:path";

export const REFERRAL_TARGET = 3;

const FILE = path.join(process.cwd(), "data", "referrals.json");

/** اگر فایل‌سیستم فقط‌خواندنی بود (ورسل)، داده در همین حافظهٔ ماژول می‌ماند */
let memStore: Store | null = null;

type Referral = { inviter: number; invited: number; joined: boolean; at: string };
type Store = { rewarded: number[]; referrals: Referral[]; names?: Record<string, string> };

function load(): Store {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<Store>;
    return { rewarded: raw.rewarded ?? [], referrals: raw.referrals ?? [], names: raw.names ?? {} };
  } catch {
    return memStore ?? { rewarded: [], referrals: [], names: {} };
  }
}

function save(s: Store): void {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(s), "utf8");
    fs.renameSync(tmp, FILE); // اتمیک — حتی اگر وسط نوشتن بخوابد، فایل قبلی سالم است
  } catch {
    memStore = s; // ورسل/فایل‌سیستم فقط‌خواندنی — تا سرد شدن اینستنس داده‌ها زنده می‌ماند
  }
}

export function recordReferral(
  inviter: number,
  invited: number,
): { ok: boolean; reason?: "self" | "duplicate" } {
  if (!Number.isFinite(inviter) || !Number.isFinite(invited)) return { ok: false, reason: "self" };
  if (inviter === invited) return { ok: false, reason: "self" };
  const s = load();
  if (s.referrals.some((r) => r.invited === invited)) return { ok: false, reason: "duplicate" };
  s.referrals.push({ inviter, invited, joined: false, at: new Date().toISOString() });
  save(s);
  return { ok: true };
}

/** اگر کاربر الان عضو کانال است و رکورد joined نداشت، عضویتش را ثبت کن.
 *  خروجی: شناسهٔ دعوت‌کننده اگر وضعیت تازه عوض شد، وگرنه null. */
export function markJoined(invitedId: number, isMemberNow: boolean | null): number | null {
  if (isMemberNow !== true) return null;
  const s = load();
  const rec = s.referrals.find((r) => r.invited === invitedId && !r.joined);
  if (!rec) return null;
  rec.joined = true;
  save(s);
  return rec.inviter;
}

export function joinedCount(inviter: number): number {
  return load().referrals.filter((r) => r.inviter === inviter && r.joined).length;
}

export function isRewarded(inviter: number): boolean {
  return load().rewarded.includes(inviter);
}

export function markRewarded(inviter: number): void {
  const s = load();
  if (!s.rewarded.includes(inviter)) {
    s.rewarded.push(inviter);
    save(s);
  }
}

/* ─── مسابقهٔ دعوت ماهانه ─────────────────────────────────
 * امتیاز = هر دعوت موفق (شروع ربات با لینک + عضویت در کانال)
 * در همان ماه. داده‌ها همان رکوردهای رفرال هستند — دوبار‌شماری نداریم.
 */

/** کلید ماه به وقت تهران (مثلا 2026-11) */
export function referralMonthKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
  }).format(d);
}

/** نگه‌داشتن اسم نمایشی کاربر برای جدول امتیاز (فقط نام کوچک تلگرام) */
export function rememberUser(id: number, name?: string): void {
  if (!Number.isFinite(id) || !name) return;
  const s = load();
  const key = String(id);
  if (s.names?.[key] === name) return;
  s.names = { ...(s.names ?? {}), [key]: name.slice(0, 40) };
  save(s);
}

function displayName(s: Store, id: number): string {
  return s.names?.[String(id)] ?? `کاربر ${String(id).slice(-4)}`;
}

/** امتیاز این ماهِ یک دعوت‌کننده */
export function monthlyJoinedCount(inviter: number, mk: string = referralMonthKey()): number {
  return load().referrals.filter(
    (r) => r.inviter === inviter && r.joined && referralMonthKey(new Date(r.at)) === mk,
  ).length;
}

export type LeaderRow = { inviter: number; name: string; count: number };

/** جدول امتیاز ماه — فقط دعوت‌های موفق همان ماه */
export function monthlyLeaderboard(limit = 10, mk: string = referralMonthKey()): LeaderRow[] {
  const s = load();
  const counts = new Map<number, number>();
  for (const r of s.referrals) {
    if (!r.joined) continue;
    if (referralMonthKey(new Date(r.at)) !== mk) continue;
    counts.set(r.inviter, (counts.get(r.inviter) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([inviter, count]) => ({ inviter, name: displayName(s, inviter), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** رتبهٔ یک کاربر در ماه (۱ = صدر)؛ اگر امتیاز نداشت null */
export function monthlyRank(inviter: number, mk: string = referralMonthKey()): number | null {
  const board = monthlyLeaderboard(1_000, mk);
  const idx = board.findIndex((row) => row.inviter === inviter);
  return idx >= 0 ? idx + 1 : null;
}
