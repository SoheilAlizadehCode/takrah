// ─── ربات نوبت‌دهی کلینیک سلامت — آینه‌ی دموی پلن ۲ ───
// منبع دمو: takrah.top/demos/plan2.html (همان پزشکان، همان ساعات، همان لحن)
// توکن‌ها فقط از متغیرهای محیطی خوانده می‌شوند (هیچ توکنی در سورس ذخیره نیست).
// تنظیمات لازم در Vercel:
//   CLINIC_BOT_TOKEN        → توکن ربات از BotFather
//   CLINIC_WEBHOOK_SECRET   → کلید مخفی وبهوک (اختیاری، پیش‌فرض دارد)
//   CLINIC_ADMIN_CHAT_ID    → چت‌آی‌دی ادمین (نوبت‌ها برایش پیام می‌رود — با /id قابل گرفتن است)
//   UPSTASH_REDIS_REST_URL  → اختیاری؛ برای ذخیره‌ی ماندگار نوبت‌ها + یادآوری خودکار
//   UPSTASH_REDIS_REST_TOKEN

export const CLINIC = {
  name: "کلینیک سلامت",
  address: "رشت، گلسار، بلوار نماز، مجتمع پزشکان سلامت، طبقه دوم",
  phone: "013-3222-4400",
  whatsapp: "09111112233",
  whatsappUrl: "https://wa.me/989111112233",
  hours: "شنبه تا پنجشنبه\n🕘 صبح ۹ تا ۱۳ — عصر ۱۶ تا ۲۰\n🔴 جمعه‌ها تعطیل",
};

export interface Doctor {
  id: string;
  name: string;
  spec: string;
  days: string;
}

// دمو: خط ۴۳۰ فایل plan2.html — عیناً همان پزشکان
export const DOCTORS: Doctor[] = [
  { id: "d1", name: "دکتر آرمان رادمهر", spec: "دندانپزشکی", days: "شنبه تا سه‌شنبه" },
  { id: "d2", name: "دکتر نگار صمدی", spec: "پوست و مو", days: "یکشنبه و سه‌شنبه" },
  { id: "d3", name: "دکتر سپهر نصیری", spec: "قلب و عروق", days: "شنبه تا پنجشنبه" },
  { id: "d4", name: "دکتر الهام کیانی", spec: "زنان و زایمان", days: "یکشنبه تا چهارشنبه" },
  { id: "d5", name: "دکتر فرزاد توانا", spec: "اطفال", days: "شنبه تا چهارشنبه" },
  { id: "d6", name: "دکتر مینا رستمی", spec: "مغز و اعصاب", days: "دوشنبه و پنجشنبه" },
];

// دمو: خط ۴۳۱ فایل plan2.html — عیناً همان بازه‌های ساعت
export const SLOTS = [
  "۰۹:۰۰", "۰۹:۳۰", "۱۰:۰۰", "۱۰:۳۰", "۱۱:۰۰", "۱۱:۳۰", "۱۲:۰۰", "۱۲:۳۰",
  "۱۶:۰۰", "۱۶:۳۰", "۱۷:۰۰", "۱۷:۳۰", "۱۸:۰۰", "۱۸:۳۰", "۱۹:۰۰", "۱۹:۳۰",
];

// ─── تنظیمات از محیط ───
export const CLINIC_TOKEN = process.env.CLINIC_BOT_TOKEN ?? "";
export const CLINIC_SECRET =
  process.env.CLINIC_WEBHOOK_SECRET ?? "clinic-demo-secret-25a77bf";
export const ADMIN_CHAT_ID = process.env.CLINIC_ADMIN_CHAT_ID ?? "";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://takrah.top";

// ─── API تلگرام ───
type Keyboard = {
  inline_keyboard: { text: string; url?: string; callback_data?: string }[][];
};

export async function tg(method: string, body: Record<string, unknown>): Promise<unknown> {
  if (!CLINIC_TOKEN) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${CLINIC_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json().catch(() => null);
  } catch {
    return null; // تلگرام خودش retry می‌کند — بعد از ارسال پاسخ هرگز throw نمی‌کنیم
  }
}

export async function reply(
  chatId: number | string,
  text: string,
  keyboard?: Keyboard,
): Promise<void> {
  await tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

// ─── تاریخ شمسی (Intl — بدون کتابخانه‌ی اضافه) ───
export interface ClinicDay {
  iso: string; // YYYY-MM-DD میلادی برای محاسبات
  label: string; // «شنبه ۲۷ مهر»
  weekday: string; // «شنبه»
}

function tehranDate(offsetDays: number): Date {
  return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
}

/** تاریخ امروز به وقت تهران (en-CA = YYYY-MM-DD) */
export function tehranIso(offsetDays = 0): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(
    tehranDate(offsetDays),
  );
}

/** شش روز کاری آینده (جمعه‌ها حذف) — برچسب شمسی */
export function workingDays(count = 6): ClinicDay[] {
  const days: ClinicDay[] = [];
  const weekdayFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "Asia/Tehran",
    weekday: "long",
  });
  const labelFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "Asia/Tehran",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  for (let i = 1; days.length < count && i < 30; i++) {
    const d = tehranDate(i);
    const weekday = weekdayFmt.format(d);
    if (weekday === "جمعه") continue; // جمعه‌ها تعطیل
    days.push({
      iso: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(d),
      label: labelFmt.format(d),
      weekday,
    });
  }
  return days;
}

/** اسلات اشغال‌شدهی قطعی (مثل دمو — hash روز+ساعت، حدود یک‌چهارم پر) */
export function slotTaken(dayIso: string, slotIndex: number): boolean {
  let h = 0;
  const s = dayIso + ":" + slotIndex;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 4 === 0;
}

/** تبدیل ارقام فارسی/عربی به لاتین */
export function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
}

/** اعتبارسنجی موبایل ایران */
export function isPhone(s: string): boolean {
  return /^09\d{9}$/.test(toLatinDigits(s).replace(/[\s-]/g, ""));
}

export function normalizePhone(s: string): string {
  return toLatinDigits(s).replace(/[\s-]/g, "");
}

// ─── ذخیره‌سازی: حافظه (پیش‌فرض) یا Upstash Redis REST (اختیاری) ───
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
export const storageMode = REDIS_URL && REDIS_TOKEN ? "redis" : "memory";

const mem = new Map<string, string>();

async function storeSet(key: string, value: string): Promise<void> {
  if (storageMode === "redis") {
    try {
      await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { authorization: `Bearer ${REDIS_TOKEN}`, "content-type": "text/plain" },
        body: value,
      });
      return;
    } catch {
      /* fallback به حافظه */
    }
  }
  mem.set(key, value);
}

async function storeGet(key: string): Promise<string | null> {
  if (storageMode === "redis") {
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

// ─── نوبت‌ها ───
export interface Booking {
  id: string;
  chatId: number;
  userName: string;
  phone: string;
  doctorIdx: number;
  dayIso: string;
  dayLabel: string;
  time: string; // «۱۰:۳۰»
  createdAt: number;
  reminded24?: boolean;
}

const IDX_ALL = "clinic:bookings:all"; // فهرست شناسه‌ها
const idxKey = (chatId: number) => `clinic:bookings:user:${chatId}`;

async function addToIndex(key: string, id: string): Promise<void> {
  const raw = await storeGet(key);
  const list: string[] = raw ? JSON.parse(raw) : [];
  if (!list.includes(id)) list.push(id);
  await storeSet(key, JSON.stringify(list));
}

export async function saveBooking(b: Booking): Promise<void> {
  await storeSet(`clinic:booking:${b.id}`, JSON.stringify(b));
  await addToIndex(IDX_ALL, b.id);
  await addToIndex(idxKey(b.chatId), b.id);
}

export async function getBooking(id: string): Promise<Booking | null> {
  const raw = await storeGet(`clinic:booking:${id}`);
  return raw ? (JSON.parse(raw) as Booking) : null;
}

export async function updateBooking(b: Booking): Promise<void> {
  await storeSet(`clinic:booking:${b.id}`, JSON.stringify(b));
}

export async function allBookings(): Promise<Booking[]> {
  const raw = await storeGet(IDX_ALL);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const out: Booking[] = [];
  for (const id of ids) {
    const b = await getBooking(id);
    if (b) out.push(b);
  }
  return out;
}

export async function userBookings(chatId: number): Promise<Booking[]> {
  const raw = await storeGet(idxKey(chatId));
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const out: Booking[] = [];
  for (const id of ids) {
    const b = await getBooking(id);
    if (b) out.push(b);
  }
  return out.reverse(); // جدیدترین اول
}

// ─── وضعیت گفتگو (مرحله نام/تلفن) — حافظه‌ی نمونه‌ی درون‌فرآیندی ───
export interface PendingBooking {
  step: "name" | "phone";
  doctorIdx: number;
  dayIso: string;
  dayLabel: string;
  time: string;
  name?: string;
  phone?: string;
  bookingId: string;
}
const pending = new Map<number, PendingBooking>();
export const pendingState = {
  get: (chatId: number) => pending.get(chatId),
  set: (chatId: number, s: PendingBooking) => pending.set(chatId, s),
  del: (chatId: number) => pending.delete(chatId),
};

// ─── متن‌ها و کیبوردها (لحن عیناً از دمو) ───
export function welcomeText(memberName?: string): string {
  const hi = memberName ? `سلام ${memberName} عزیز! 🌸` : "سلام! 🌸";
  return (
    `${hi}\nمن <b>ربات نوبت‌دهی ${CLINIC.name}</b> هستم.\n\n` +
    `با من می‌توانید در چند ثانیه نوبت بگیرید، نوبت‌هایتان را ببینید و یادآوری رایگان دریافت کنید.\n\n` +
    `برای شروع، دکمه‌ی «🗓 رزرو نوبت» را بزنید 👇`
  );
}

export function mainKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "🗓 رزرو نوبت", callback_data: "book" }],
      [
        { text: "👨‍⚕️ پزشکان", callback_data: "docs" },
        { text: "📍 آدرس و ساعات", callback_data: "info" },
      ],
      [
        { text: "☎️ تماس با ما", url: CLINIC.whatsappUrl },
        { text: "🔎 نوبت‌های من", callback_data: "my" },
      ],
    ],
  };
}

export function doctorsKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      ...DOCTORS.map((d) => [
        { text: `${d.name} — ${d.spec}`, callback_data: `d:${DOCTORS.indexOf(d)}` },
      ]),
      [{ text: "↩️ بازگشت به منوی اصلی", callback_data: "home" }],
    ],
  };
}

export function daysKeyboard(doctorIdx: number): Keyboard {
  const days = workingDays();
  const rows = days.map((day, i) => [
    { text: day.label, callback_data: `w:${doctorIdx}:${i}` },
  ]);
  rows.push([{ text: "↩️ تغییر پزشک", callback_data: "book" }]);
  return { inline_keyboard: rows };
}

export function slotsKeyboard(doctorIdx: number, dayIdx: number): Keyboard {
  const day = workingDays()[dayIdx];
  const rows: Keyboard["inline_keyboard"] = [];
  for (let r = 0; r < 4; r++) {
    rows.push(
      SLOTS.slice(r * 4, r * 4 + 4).map((t, c) => {
        const i = r * 4 + c;
        const taken = day ? slotTaken(day.iso, i) : false;
        return {
          text: taken ? `${t} ✖` : t,
          callback_data: taken ? "taken" : `s:${doctorIdx}:${dayIdx}:${i}`,
        };
      }),
    );
  }
  rows.push([
    { text: "↩️ تغییر روز", callback_data: `d:${doctorIdx}` },
    { text: "🏠 منو", callback_data: "home" },
  ]);
  return { inline_keyboard: rows };
}

export function confirmKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "✅ تأیید نوبت", callback_data: "do:confirm" }],
      [{ text: "❌ انصراف و شروع مجدد", callback_data: "do:cancel" }],
    ],
  };
}

export function summaryCard(p: PendingBooking): string {
  const d = DOCTORS[p.doctorIdx];
  return (
    `🔎 <b>خلاصه‌ی نوبت شما:</b>\n\n` +
    `🩺 پزشک: <b>${d.name}</b> (${d.spec})\n` +
    `🗓 روز: <b>${p.dayLabel}</b>\n` +
    `🕐 ساعت: <b>${p.time}</b>\n` +
    `👤 نام: <b>${p.name}</b>\n` +
    `📱 تلفن: <b>${p.phone}</b>\n\n` +
    `درست است؟`
  );
}

export function bookingConfirmedText(b: Booking): string {
  const d = DOCTORS[b.doctorIdx];
  return (
    `✅ <b>نوبت شما ثبت شد!</b>\n\n` +
    `🩺 ${d.name} (${d.spec})\n` +
    `🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>\n` +
    `🧾 کد پیگیری: <code>#${b.id}</code>\n\n` +
    `📍 ${CLINIC.address}\n` +
    `⏰ لطفاً ۱۵ دقیقه قبل حاضر باشید.\n\n` +
    `🔔 ۲۴ ساعت قبل، همین‌جا به شما یادآوری می‌دهیم 🌸`
  );
}

export function adminNotification(b: Booking): string {
  const d = DOCTORS[b.doctorIdx];
  return (
    `🆕 <b>نوبت جدید ثبت شد</b>\n\n` +
    `👤 ${b.userName} — <code>${b.phone}</code>\n` +
    `🩺 ${d.name} (${d.spec})\n` +
    `🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>\n` +
    `🧾 کد: <code>#${b.id}</code>\n\n` +
    `💬 برای یادآوری/هماهنگی می‌توانید همین‌جا به بیمار پیام دهید.`
  );
}

export function doctorsListText(): string {
  return (
    `👨‍⚕️ <b>پزشکان ${CLINIC.name}:</b>\n\n` +
    DOCTORS.map((d, i) => `${i + 1}. <b>${d.name}</b> — ${d.spec}\n   🗓 ${d.days}`).join("\n") +
    `\n\nبرای رزرو، دکمه‌ی «🗓 رزرو نوبت» را بزنید.`
  );
}

export function infoText(): string {
  return (
    `📍 <b>${CLINIC.name}</b>\n${CLINIC.address}\n\n` +
    `☎️ تلفن پذیرش: <code>${CLINIC.phone}</code>\n` +
    `💬 واتساپ: <code>${CLINIC.whatsapp}</code>\n\n` +
    `🕐 <b>ساعات کاری:</b>\n${CLINIC.hours}`
  );
}

export function reminderText(b: Booking): string {
  const d = DOCTORS[b.doctorIdx];
  return (
    `⏰ <b>یادآوری نوبت</b>\n\n` +
    `نوبت شما: <b>${b.dayLabel} ساعت ${b.time}</b>\n` +
    `${d.name} (${d.spec})\n\n` +
    `آیا این نوبت را حفظ می‌کنید؟`
  );
}

export function reminderKeyboard(b: Booking): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "✅ بله، حفظ می‌کنم", callback_data: `rem:${b.id}:ok` }],
      [{ text: "💬 می‌خواهم جابجا کنم", callback_data: `rem:${b.id}:chg` }],
    ],
  };
}
