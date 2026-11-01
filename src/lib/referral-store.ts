// ─── استور سبک رفرال ربات تک‌راه ───
// بدون دیتابیس/مایگریشن: یک JSON روی دیسک (data/referrals.json) با نوشتن اتمیک.
// فلو: کاربر با /start r<inviterId> می‌آید → رکورد ثبت می‌شود → به محض اینکه
// عضو کانال شد (هر مسیر عضویت) رکورد joined می‌شود → دعوت‌کننده به ۳ نفر که برسد
// پاداش (چک‌لیست ۳۰ روزه) می‌گیرد. فقط شناسه‌های تلگرام و زمان ذخیره می‌شود.
import fs from "node:fs";
import path from "node:path";

export const REFERRAL_TARGET = 3;

const FILE = path.join(process.cwd(), "data", "referrals.json");

type Referral = { inviter: number; invited: number; joined: boolean; at: string };
type Store = { rewarded: number[]; referrals: Referral[] };

function load(): Store {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<Store>;
    return { rewarded: raw.rewarded ?? [], referrals: raw.referrals ?? [] };
  } catch {
    return { rewarded: [], referrals: [] };
  }
}

function save(s: Store): void {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(s), "utf8");
  fs.renameSync(tmp, FILE); // اتمیک — حتی اگر وسط نوشتن بخوابد، فایل قبلی سالم است
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
