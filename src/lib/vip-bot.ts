// ─── ربات VIP کلینیک سلامت — آینه‌ی دموی پلن ۳ ───
// منبع دمو: takrah.top/demos/plan3.html (همان تخصص‌ها، همان پزشکان، همان لحن)
// یک ربات = دستیار کامل: نوبت‌دهی با انتخاب تخصص + منشی هوشمند «آوا» + مشاوره/سرنخ‌گیری
// توکن‌ها فقط از متغیرهای محیطی خوانده می‌شوند (هیچ توکنی در سورس ذخیره نیست).
// تنظیمات لازم در Vercel:
//   VIP_BOT_TOKEN        → توکن ربات VIP از BotFather
//   VIP_WEBHOOK_SECRET   → کلید مخفی وبهوک (اختیاری، پیش‌فرض دارد)
//   VIP_ADMIN_CHAT_ID    → چت‌آی‌دی ادمین (اگر خالی باشد از CLINIC_ADMIN_CHAT_ID استفاده می‌شود)
import { CLINIC, SLOTS } from "./clinic-bot";
import { kvGet, kvSet, safeParse } from "./kv";

export { CLINIC, SLOTS };

// ─── تنظیمات از محیط ───
export const VIP_TOKEN = process.env.VIP_BOT_TOKEN ?? "";
export const VIP_SECRET =
  process.env.VIP_WEBHOOK_SECRET ?? "vip-demo-secret-25a77bf";
export const VIP_ADMIN_CHAT_ID =
  process.env.VIP_ADMIN_CHAT_ID ?? process.env.CLINIC_ADMIN_CHAT_ID ?? "";
export const DIRECTOR_CHAT_ID = process.env.DIRECTOR_CHAT_ID ?? "";

// ─── API تلگرام (مستقل با توکن VIP) ───
type Keyboard = {
  inline_keyboard: { text: string; url?: string; callback_data?: string }[][];
};

export async function tgVip(
  method: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  if (!VIP_TOKEN) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${VIP_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json().catch(() => null);
  } catch {
    return null; // تلگرام خودش retry می‌کند — هرگز throw نمی‌کنیم
  }
}

export async function replyVip(
  chatId: number | string,
  text: string,
  keyboard?: Keyboard,
): Promise<void> {
  await tgVip("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

// ─── تخصص‌ها — عین دموی plan3.html (خط specGrid) ───
export interface Spec {
  emoji: string;
  name: string;
}

export const SPECS: Spec[] = [
  { emoji: "🦷", name: "دندانپزشکی" },
  { emoji: "✨", name: "پوست و مو" },
  { emoji: "❤️", name: "قلب و عروق" },
  { emoji: "🌸", name: "زنان و زایمان" },
  { emoji: "👶", name: "اطفال" },
  { emoji: "🧠", name: "مغز و اعصاب" },
];

export interface VipDoctor {
  id: string;
  name: string;
  spec: string; // نام تخصص
  specIdx: number; // ایندکس در SPECS
  days: string;
}

// دمو: خط docList فایل plan3.html — عیناً همان پزشکان با نگاشت تخصص ۱:۱
export const VIP_DOCTORS: VipDoctor[] = [
  { id: "d1", name: "دکتر آرمان رادمهر", spec: "دندانپزشکی", specIdx: 0, days: "شنبه تا سه‌شنبه" },
  { id: "d2", name: "دکتر نگار صمدی", spec: "پوست و مو", specIdx: 1, days: "یکشنبه و سه‌شنبه" },
  { id: "d3", name: "دکتر سپهر نصیری", spec: "قلب و عروق", specIdx: 2, days: "شنبه تا پنجشنبه" },
  { id: "d4", name: "دکتر الهام کیانی", spec: "زنان و زایمان", specIdx: 3, days: "یکشنبه تا چهارشنبه" },
  { id: "d5", name: "دکتر فرزاد توانا", spec: "اطفال", specIdx: 4, days: "شنبه تا چهارشنبه" },
  { id: "d6", name: "دکتر مینا رستمی", spec: "مغز و اعصاب", specIdx: 5, days: "دوشنبه و پنجشنبه" },
];

// ─── تاریخ شمسی (همان موتور پلن ۲ — بازاستفاده) ───
import {
  isPhone,
  normalizePhone,
  tehranIso,
  workingDays,
  type ClinicDay,
} from "./clinic-bot";

export { isPhone, normalizePhone, tehranIso, workingDays };
export type { ClinicDay };

/** اسلات اشغال قطعی — با دانه‌ی vip تا با پلن ۲ فرق کند */
export function vipSlotTaken(dayIso: string, slotIndex: number): boolean {
  let h = 0;
  const s = "vip:" + dayIso + ":" + slotIndex;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 4 === 0;
}

// ─── ذخیره‌سازی: لایه‌ی مشترک kv.ts (Upstash Redis یا حافظه) — با پیشوند vip: ───
const storeSet = kvSet;
const storeGet = kvGet;

async function addToIndex(key: string, id: string): Promise<void> {
  const raw = await storeGet(key);
  const list: string[] = raw ? JSON.parse(raw) : [];
  if (!list.includes(id)) list.push(id);
  await storeSet(key, JSON.stringify(list));
}

// ─── نوبت‌های VIP ───
export interface VipBooking {
  id: string;
  chatId: number;
  userName: string;
  phone: string;
  note?: string; // توضیحات بیمار — فیلد انحصاری plan3
  specIdx: number;
  doctorIdx: number;
  dayIso: string;
  dayLabel: string;
  time: string;
  createdAt: number;
  reminded24?: boolean;
}

const IDX_ALL = "vip:bookings:all";
const idxKey = (chatId: number) => `vip:bookings:user:${chatId}`;

export async function saveVipBooking(b: VipBooking): Promise<void> {
  await storeSet(`vip:booking:${b.id}`, JSON.stringify(b));
  await addToIndex(IDX_ALL, b.id);
  await addToIndex(idxKey(b.chatId), b.id);
}

export async function getVipBooking(id: string): Promise<VipBooking | null> {
  const raw = await storeGet(`vip:booking:${id}`);
  return raw ? (JSON.parse(raw) as VipBooking) : null;
}

export async function updateVipBooking(b: VipBooking): Promise<void> {
  await storeSet(`vip:booking:${b.id}`, JSON.stringify(b));
}

export async function allVipBookings(): Promise<VipBooking[]> {
  const raw = await storeGet(IDX_ALL);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const out: VipBooking[] = [];
  for (const id of ids) {
    const raw2 = await storeGet(`vip:booking:${id}`);
    if (raw2) out.push(JSON.parse(raw2) as VipBooking);
  }
  return out;
}

export async function userVipBookings(chatId: number): Promise<VipBooking[]> {
  const raw = await storeGet(idxKey(chatId));
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const out: VipBooking[] = [];
  for (const id of ids) {
    const raw2 = await storeGet(`vip:booking:${id}`);
    if (raw2) out.push(JSON.parse(raw2) as VipBooking);
  }
  return out.reverse();
}

// ─── سرنخ‌های مشاوره (قابلیت انحصاری VIP — سرنخ‌گیری مثل ربات اینستاگرام دمو) ───
export interface VipLead {
  id: string;
  chatId: number;
  userName: string;
  phone: string;
  topic: string;
  createdAt: number;
}

const IDX_LEADS = "vip:leads:all";

export async function saveVipLead(l: VipLead): Promise<void> {
  await storeSet(`vip:lead:${l.id}`, JSON.stringify(l));
  await addToIndex(IDX_LEADS, l.id);
}

export async function allVipLeads(): Promise<VipLead[]> {
  const raw = await storeGet(IDX_LEADS);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const out: VipLead[] = [];
  for (const id of ids) {
    const raw2 = await storeGet(`vip:lead:${id}`);
    if (raw2) out.push(JSON.parse(raw2) as VipLead);
  }
  return out;
}

// ─── وضعیت گفتگو ───
export interface PendingVip {
  mode: "booking" | "ava" | "lead";
  step: "name" | "phone" | "note" | "topic";
  specIdx?: number;
  doctorIdx?: number;
  dayIso?: string;
  dayLabel?: string;
  time?: string;
  name?: string;
  phone?: string;
  note?: string;
  bookingId?: string;
  leadId?: string;
}

const pending = new Map<number, PendingVip>();
export const pendingVipState = {
  get: (chatId: number) => pending.get(chatId),
  set: (chatId: number, s: PendingVip) => pending.set(chatId, s),
  del: (chatId: number) => pending.delete(chatId),
};

// ─── منوها و متن‌ها (لحن عیناً از دموی plan3) ───
export function vipWelcomeText(memberName?: string): string {
  const hi = memberName ? `سلام ${memberName} عزیز! 🌸` : "سلام! 🌸";
  return (
    `${hi}\nمن <b>دستیار هوشمند ${CLINIC.name}</b> هستم — منشی دیجیتال کلینیک، ۲۴ ساعته و ۷ روز هفته آنلاین. 🤖\n\n` +
    `می‌توانید همین‌جا نوبت بگیرید، سوال‌تان را مستقیم بپرسید یا مشاوره رایگان رزرو کنید.\n\n` +
    `از منوی زیر انتخاب کنید یا سوال‌تان را همان‌طور که هست بنویسید 👇`
  );
}

export function vipMainKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      [
        { text: "🗓 رزرو نوبت", callback_data: "book" },
        { text: "🤖 سوال از آوا", callback_data: "ava" },
      ],
      [
        { text: "📞 مشاوره رایگان", callback_data: "consult" },
        { text: "🔎 نوبت‌های من", callback_data: "my" },
      ],
      [
        { text: "👨‍⚕️ پزشکان", callback_data: "docs" },
        { text: "📍 آدرس و ساعات", callback_data: "info" },
      ],
    ],
  };
}

export function specsKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      ...SPECS.map((s, i) => [{ text: `${s.emoji} ${s.name}`, callback_data: `spec:${i}` }]),
      [{ text: "↩️ بازگشت به منوی اصلی", callback_data: "home" }],
    ],
  };
}

/** پزشکان تخصص انتخابی — مثل دمو، پزشک همان تخصص اول می‌آید */
export function doctorsKeyboardForSpec(specIdx: number): Keyboard {
  const matched = VIP_DOCTORS.filter((d) => d.specIdx === specIdx);
  const others = VIP_DOCTORS.filter((d) => d.specIdx !== specIdx);
  const rowOf = (d: VipDoctor, star: boolean) => [
    { text: `${star ? "⭐ " : ""}${d.name} — ${d.spec}`, callback_data: `d:${VIP_DOCTORS.indexOf(d)}` },
  ];
  return {
    inline_keyboard: [
      [{ text: `${SPECS[specIdx].emoji} ${SPECS[specIdx].name}`, callback_data: "noop" }],
      ...matched.map((d) => rowOf(d, true)),
      ...others.map((d) => rowOf(d, false)),
      [{ text: "↩️ تغییر تخصص", callback_data: "book" }],
      [{ text: "🏠 منو", callback_data: "home" }],
    ],
  };
}

export function allDoctorsKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      ...VIP_DOCTORS.map((d) => [
        { text: `${d.name} — ${d.spec}`, callback_data: `d:${VIP_DOCTORS.indexOf(d)}` },
      ]),
      [{ text: "↩️ بازگشت به منوی اصلی", callback_data: "home" }],
    ],
  };
}

export function daysKeyboardVip(doctorIdx: number): Keyboard {
  const days = workingDays();
  const rows = days.map((day, i) => [
    { text: day.label, callback_data: `w:${doctorIdx}:${i}` },
  ]);
  rows.push([{ text: "↩️ تغییر پزشک", callback_data: "book" }]);
  return { inline_keyboard: rows };
}

export function slotsKeyboardVip(doctorIdx: number, dayIdx: number): Keyboard {
  const day = workingDays()[dayIdx];
  const rows: Keyboard["inline_keyboard"] = [];
  for (let r = 0; r < 4; r++) {
    rows.push(
      SLOTS.slice(r * 4, r * 4 + 4).map((t, c) => {
        const i = r * 4 + c;
        const taken = day ? vipSlotTaken(day.iso, i) : false;
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

export function confirmVipKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "✅ تأیید نوبت", callback_data: "vb:confirm" }],
      [{ text: "❌ انصراف و شروع مجدد", callback_data: "vb:cancel" }],
    ],
  };
}

export function skipNoteKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "⏭ توضیحات لازم نیست، ادامه", callback_data: "skipnote" }],
      [{ text: "❌ انصراف", callback_data: "home" }],
    ],
  };
}

export function vipSummaryCard(p: PendingVip): string {
  const d = VIP_DOCTORS[p.doctorIdx ?? 0];
  const s = SPECS[p.specIdx ?? d.specIdx];
  return (
    `🔎 <b>خلاصه‌ی نوبت شما:</b>\n\n` +
    `${s.emoji} تخصص: <b>${s.name}</b>\n` +
    `🩺 پزشک: <b>${d.name}</b>\n` +
    `🗓 روز: <b>${p.dayLabel}</b>\n` +
    `🕐 ساعت: <b>${p.time}</b>\n` +
    `👤 نام: <b>${p.name}</b>\n` +
    `📱 تلفن: <b>${p.phone}</b>\n` +
    (p.note ? `📝 توضیحات: ${p.note}\n` : "") +
    `\nدرست است؟`
  );
}

export function vipBookingConfirmedText(b: VipBooking): string {
  const d = VIP_DOCTORS[b.doctorIdx];
  const s = SPECS[b.specIdx];
  return (
    `✅ <b>نوبت شما ثبت شد!</b>\n\n` +
    `${s.emoji} ${s.name}\n` +
    `🩺 ${d.name}\n` +
    `🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>\n` +
    (b.note ? `📝 توضیحات شما ثبت شد — پزشک مطلع می‌شود.\n` : "") +
    `🧾 کد پیگیری: <code>#${b.id}</code>\n\n` +
    `📍 ${CLINIC.address}\n` +
    `⏰ لطفاً ۱۵ دقیقه قبل حاضر باشید.\n\n` +
    `💎 <b>مزیت VIP:</b> یادآوری تلگرامی ۲۴ ساعت قبل + پیگیری پذیرش`
  );
}

export function vipAdminNotification(b: VipBooking): string {
  const d = VIP_DOCTORS[b.doctorIdx];
  const s = SPECS[b.specIdx];
  return (
    `🆕 <b>نوبت جدید (ربات VIP)</b>\n\n` +
    `👤 ${b.userName} — <code>${b.phone}</code>\n` +
    `${s.emoji} ${s.name}\n` +
    `🩺 ${d.name}\n` +
    `🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>\n` +
    (b.note ? `📝 ${b.note}\n` : "") +
    `🧾 کد: <code>#${b.id}</code>`
  );
}

export function vipDoctorsListText(): string {
  return (
    `👨‍⚕️ <b>پزشکان ${CLINIC.name}:</b>\n\n` +
    VIP_DOCTORS.map((d, i) => `${i + 1}. <b>${d.name}</b> — ${d.spec}\n   🗓 ${d.days}`).join("\n") +
    `\n\nبرای رزرو، دکمه‌ی «🗓 رزرو نوبت» را بزنید.`
  );
}

export function vipInfoText(): string {
  return (
    `📍 <b>${CLINIC.name}</b>\n${CLINIC.address}\n\n` +
    `☎️ تلفن پذیرش: <code>${CLINIC.phone}</code>\n` +
    `💬 واتساپ: <code>${CLINIC.whatsapp}</code>\n\n` +
    `🕐 <b>ساعات کاری:</b>\n${CLINIC.hours}`
  );
}

// ─── منشی هوشمند «آوا» — موتور پاسخ‌دهی هوشمند با حافظه و سوال دنباله‌دار ───
export function avaIntroText(): string {
  return (
    `🤖 <b>آوا — دستیار هوشمند کلینیک</b>\n\n` +
    `من منشی دیجیتال کلینیک هستم و حافظه دارم — یعنی هرچی پرسیدید جواب می‌دهم:\n` +
    `• «قیمت ترمیم دندون چنده؟» بعدش فقط بگویید «و ساعتش؟» ⏰\n` +
    `• «درد دندان دارم» → دکتر مناسب را معرفی می‌کنم 🩺\n` +
    `• «بیمه درمان تکمیلی قبول می‌کنید؟»\n` +
    `• «پارکینگ دارید؟» «آزمایشگاه دارید؟» «ناشتا بیام؟»\n\n` +
    `🎤 حتی می‌توانید وویس بفرستید! هر لحظه در خدمتم — ۲۴ ساعته. 🌸`
  );
}

export interface AvaReply {
  text: string;
  keyboard?: Keyboard;
  meta?: { specIdx?: number; doctorIdx?: number; topic?: string };
}

// ─── حافظه‌ی گفتگوی آوا — هر چت آخرین موضوع/تخصص/پزشک را یادش می‌ماند ───
export interface AvaMem {
  lastSpecIdx?: number;
  lastDoctorIdx?: number;
  lastTopic?: string;
}

const memKey = (chatId: number) => `vip:avamem:${chatId}`;

export async function getAvaMem(chatId: number): Promise<AvaMem> {
  const raw = await storeGet(memKey(chatId));
  return raw ? safeParse<AvaMem>(raw, {}) : {};
}

async function setAvaMem(chatId: number, mem: AvaMem): Promise<void> {
  await storeSet(memKey(chatId), JSON.stringify(mem));
}

/** پاسخ هوشمند آوا با حافظه — ورودی و خروجی هر دو از پیشوند vip: می‌گذرد */
export async function avaAnswerSmart(chatId: number, question: string): Promise<AvaReply> {
  const mem = await getAvaMem(chatId);
  const reply = avaAnswer(question, mem);
  if (reply.meta) {
    if (reply.meta.specIdx !== undefined) mem.lastSpecIdx = reply.meta.specIdx;
    if (reply.meta.doctorIdx !== undefined) mem.lastDoctorIdx = reply.meta.doctorIdx;
    if (reply.meta.topic) mem.lastTopic = reply.meta.topic;
    await setAvaMem(chatId, mem);
  }
  return reply;
}

// ─── نرمال‌سازی فارسی: ی/ک عربی، نیم‌فاصله، فاصله‌ی اضافه ───
export function normalizeFa(s: string): string {
  return s
    .replace(/[\u064A]/g, "\u06CC") // ي → ی
    .replace(/[\u0643]/g, "\u06A9") // ك → ک
    .replace(/[\u0629]/g, "\u0647") // ة → ه
    .replace(/[\u0623\u0625]/g, "\u0627") // أ إ → ا
    .replace(/[\u200C\u200F\u200E]/g, "") // نیم‌فاصله و کاراکترهای جهت
    .replace(/\s+/g, " ")
    .trim()
  ;
}

// نقشه‌ی کلیدواژه‌ی تخصص‌ها — هم برای قیمت هم برای معرفی پزشک بر اساس علامت
const SPEC_HINTS: { idx: number; words: RegExp }[] = [
  { idx: 0, words: /(دندان|دندون|لمینت|ایمپلنت|ارتودنسی|جرم|ریشه|روکش|پر کردن|کامپوزیت|عصب کشی)/ },
  { idx: 1, words: /(پوست|جوش|اکنه|آکنه|لیزر|ریزش|کراتینه|بوتاکس|فیلر|جوشگاه|زگیل|خال)|(^|[^\p{L}])مو([^\p{L}]|$)|(^|[^\p{L}])لک([^\p{L}]|$)/u },
  { idx: 2, words: /(قلب|سینه|تپش|فشار خون|چربی خون|نفس نفس|ریتم)/ },
  { idx: 3, words: /(زنان|باردار|بارداری|یائسگی|پریود|سونوگرافی زنان|ویزیت زنان)/ },
  { idx: 4, words: /(کودک|بچه|اطفال|شیرخوار|واکسن|نوزاد)/ },
  { idx: 5, words: /(اعصاب|سردرد|میگرن|سرگیجه|بی خوابی|لرزش|فراموشی|مغز|تشنج)/ },
];

function detectSpecIdx(q: string): number | undefined {
  for (const h of SPEC_HINTS) if (h.words.test(q)) return h.idx;
  return undefined;
}

/** موتور پاسخ آوا — هوشمند، با حافظه و سوال دنباله‌دار (بدون وابستگی خارجی؛ ۱۰۰٪ آفلاین و قطعی) */
export function avaAnswer(question: string, mem: AvaMem = {}): AvaReply {
  const q = normalizeFa(question.toLowerCase());

  const bookKb: Keyboard = {
    inline_keyboard: [
      [{ text: "🗓 رزرو نوبت همین حالا", callback_data: "book" }],
      [{ text: "🏠 منوی اصلی", callback_data: "home" }],
    ],
  };
  const consultKb = (extra?: string): Keyboard => ({
    inline_keyboard: [
      [{ text: "📞 ثبت مشاوره رایگان", callback_data: "consult" }],
      ...(extra ? [[{ text: extra, callback_data: "home" }]] : [[{ text: "🏠 منوی اصلی", callback_data: "home" }]]),
    ],
  });

  // ─── فوریت/اورژانس — اولویت بالا ───
  if (/(فوری|اورژانس|خیلی شدید|تحمل نمی|خون میاد|بدتر شد|تورم شدید)/.test(q)) {
    return {
      text:
        `⏰ موضوع فوری است — همین حالا با پذیرش تماس بگیرید: ☎️ <code>${CLINIC.phone}</code>\n\n` +
        `همزمان سریع‌ترین نوبت را هم برایتان رزرو می‌کنم که مطمئن شویم بررسی می‌شوید 👇`,
      keyboard: bookKb,
      meta: { topic: "فوری" },
    };
  }

  // ─── سلام و احوالپرسی ───
  if (/^(سلام|درود|هی|های|سلام علیکم|صبح بخیر|عصر بخیر|شب بخیر)/.test(q) || /^(سلام|درود)[! ،.]*$/.test(q)) {
    return {
      text:
        `سلام! 🌸 خوش آمدید.\nمن <b>آوا</b> هستم، منشی هوشمند ${CLINIC.name} — ۲۴ ساعته در خدمتم.\n\n` +
        `سوال‌تان را بپرسید یا از منو انتخاب کنید 👇`,
      keyboard: vipMainKeyboard(),
      meta: { topic: "سلام" },
    };
  }

  // ─── تشکر ───
  if (/(ممنون|مرسی|سپاس|دستت درد|متشکر|لطف کردی)/.test(q)) {
    return {
      text: `خواهش می‌کنم! 🌸 کاری دارید من هستم — ۲۴ ساعته آنلاین. حمایه‌ی سلامتی‌تان همیشه آرزوی ماست 💚`,
      keyboard: vipMainKeyboard(),
      meta: { topic: "تشکر" },
    };
  }

  // ─── خداحافظی ───
  if (/(خداحافظ|بدرود|فعلا|بای بای|خدافظ)/.test(q)) {
    return {
      text: `به امید دیدار! 🌸 هر ساعت از شبانه‌روز که سوالی داشتید، همین‌جا هستم.`,
      keyboard: vipMainKeyboard(),
      meta: { topic: "خداحافظی" },
    };
  }

  // ─── آوا کیست / رباطی؟ ───
  if (/(تو کی هستی|رباتی|ربات هستی|انسانی|آدم هستی|چی بلدی|چه کارهایی)/.test(q)) {
    return {
      text:
        `من <b>آوا</b> هستم، منشی دیجیتال ${CLINIC.name} 🤖\n` +
        `نوبت‌دهی، معرفی پزشک، قیمت‌ها، آدرس و یادآوری — همه با من.\n` +
        `هر ساعتی بپرسید جواب می‌دهم، و سوال‌های تخصصی را هم به کارشناس پذیرش می‌رسانم. 🌸`,
      keyboard: vipMainKeyboard(),
      meta: { topic: "معرفی آوا" },
    };
  }

  // ─── درخواست منشی واقعی / اپراتور ───
  if (/(اپراتور|منشی واقعی|انسان صحبت|با آدم|مسئول|مدیر کلینیک)/.test(q)) {
    return {
      text:
        `حتماً 🙏 شماره‌تان را ثبت کنید تا <b>کارشناس پذیرش</b> در اولین فرصت (ساعات کاری ۹ تا ۲۰) خودش تماس بگیرد.\n\n` +
        `یا مستقیم با پذیرش صحبت کنید: ☎️ <code>${CLINIC.phone}</code>`,
      keyboard: consultKb(),
      meta: { topic: "درخواست اپراتور" },
    };
  }

  // ─── سوال دنباله‌دار با حافظه: قیمت «همون» ───
  const asksPrice = /(قیمت|هزینه|تعرفه|چنده|چقدر|نرخ|تومن چند|خرج)/.test(q);
  const refPrev = /(همون|همین|اون|قبلی|بالا|اش |ش چقدر|ش چنده|دوم)|^(قیمتش|هزینش|تعرفه‌ش)$/.test(q);
  if (asksPrice) {
    const specIdx = detectSpecIdx(q) ?? mem.lastSpecIdx;
    if (specIdx !== undefined) {
      const s = SPECS[specIdx];
      return {
        text:
          `💰 <b>تعرفه‌ی ${s.name}:</b>\n` +
          (specIdx === 0
            ? `• ترمیم و درمان دندان: از <b>۸۰۰ هزار تومان</b> 🦷\n• جرم‌گیری، عصب‌کشی و لمینت بسته به وضعیت دندان\n`
            : `• ویزیت و خدمات این بخش بسته به نوع درمان متفاوت است\n`) +
          `\nقیمت دقیق را پزشک بعد از معاینه اعلام می‌کند — هیچ هزینه پنهانی نداریم. 🤝\n` +
          `اگر بخواهید، <b>مشاوره رایگان</b> ثبت کنید تا پذیرش دقیق بگوید.`,
        keyboard: consultKb("🗓 رزرو نوبت"),
        meta: { specIdx, topic: `قیمت ${s.name}` },
      };
    }
    if (refPrev && mem.lastTopic) {
      return {
        text:
          `درباره‌ی «${mem.lastTopic}» 💡\n` +
          `قیمت دقیق را پزشک بعد از معاینه اعلام می‌کند. برای برآورد اولیه، <b>مشاوره رایگان</b> عالی است — پذیرش تلفنی همه‌چیز را می‌گوید. 📞`,
        keyboard: consultKb("🗓 رزرو نوبت"),
        meta: { topic: `قیمت — دنباله ${mem.lastTopic}` },
      };
    }
    return {
      text:
        `💰 <b>تعرفه‌ها:</b>\n\n` +
        `• ویزیت تخصصی: بسته به تخصص و نوع خدمت\n` +
        `• خدمات تصویربرداری و آزمایشگاه: طبقه‌بندی خاص\n` +
        `• ترمیم و درمان دندان: از <b>۸۰۰ هزار تومان</b> 🦷\n\n` +
        `تعرفه دقیق به تشخیص پزشک بستگی دارد. اگر شماره‌تان را ثبت کنید، پذیرش برای <b>مشاوره رایگان</b> تماس می‌گیرد و همه‌چیز را دقیق می‌گوید. 📞`,
      keyboard: consultKb(),
      meta: { topic: "قیمت عمومی" },
    };
  }

  // ─── سوال دنباله‌دار با حافظه: روز/ساعت «همون دکتر» ───
  if (/(چه روز|کدوم روز|روزهاش|ساعتش|ساعاتش|کی هست|چه ساعتی)/.test(q)) {
    const dIdx = mem.lastDoctorIdx;
    if (dIdx !== undefined && VIP_DOCTORS[dIdx]) {
      const d = VIP_DOCTORS[dIdx];
      return {
        text:
          `🗓 <b>${d.name}</b> (${d.spec})\nروزهای مطب: <b>${d.days}</b>\n\n` +
          `همین حالا نوبت بگیرید — کمتر از یک دقیقه طول می‌کشد. 👇`,
        keyboard: bookKb,
        meta: { doctorIdx: dIdx, specIdx: d.specIdx, topic: `ساعات ${d.name}` },
      };
    }
    return {
      text:
        `🕐 <b>ساعات کاری:</b>\n${CLINIC.hours}\n\n` +
        `روزهای مطب هر پزشک کمی فرق دارد — بگویید کدام تخصص را می‌خواهید تا دقیق بگویم، یا نوبت بگیرید 👇`,
      keyboard: bookKb,
      meta: { topic: "ساعات کاری" },
    };
  }

  // ─── آدرس ───
  if (/(ادرس|کجا هست|مکان|لوکیشن|مسیر|موقعیت|چطور برم)/.test(q)) {
    return {
      text:
        `📍 <b>${CLINIC.name}</b>\n${CLINIC.address}\n\n` +
        `☎️ پذیرش: <code>${CLINIC.phone}</code>\nپارکینگ و دسترسی آسان دارد. 🚗`,
      keyboard: bookKb,
      meta: { topic: "آدرس" },
    };
  }

  // ─── پارکینگ / دسترسی ───
  if (/(پارکینگ|ماشین جا|دسترسی|اتوبوس|تاکسی)/.test(q)) {
    return {
      text:
        `🚗 بله — <b>پارکینگ</b> برای مراجعین ${CLINIC.name} مهیاست و دسترسی از بلوار نماز راحت است.\n\n` +
        `${CLINIC.address}\n\nنوبت بگیرید تا بدون معطلی تشریف بیاورید 👇`,
      keyboard: bookKb,
      meta: { topic: "پارکینگ" },
    };
  }

  // ─── ساعات کاری ───
  if (/(ساعت کاری|ساعات کاری|باز هستید|بازید|تعطیل|چندشنبه|شیفت|صبح تا)/.test(q)) {
    return {
      text:
        `🕐 <b>ساعات کاری:</b>\n${CLINIC.hours}\n\n` +
        `ولی من که ۲۴ ساعته اینجا هستم — هر ساعتی بپرسید جواب می‌گیرید! 🤖`,
      keyboard: bookKb,
      meta: { topic: "ساعات کاری" },
    };
  }

  // ─── بیمه ───
  if (/(بیمه|تکمیلی|درمانگاه|قرارداد|دفترچه|تامین اجتماعی)/.test(q)) {
    return {
      text:
        `🛡 <b>بیمه:</b>\nکلینیک با اکثر بیمه‌های پایه و بیمه‌های تکمیلی قرارداد دارد.\n\n` +
        `برای اطلاع از اینکه بیمه‌ی شما پوشش می‌دهد یا نه، شماره‌تان را ثبت کنید تا پذیرش دقیق راهنمایی کند. 📞`,
      keyboard: consultKb("🗓 رزرو نوبت"),
      meta: { topic: "بیمه" },
    };
  }

  // ─── لغو / جابجایی نوبت ───
  if (/(لغو|کنسل|جابجا|جابه جا|عوض کنم|تغییر وقت|نمی توانم بیایم)/.test(q)) {
    return {
      text:
        `💬 مشکلی نیست! برای جابجایی یا لغو نوبت:\n` +
        `1️⃣ از پیام یادآوری تلگرامی دکمه‌ی «می‌خواهم جابجا کنم» را بزنید\n` +
        `2️⃣ یا با پذیرش تماس بگیرید: ☎️ <code>${CLINIC.phone}</code>\n\n` +
        `نوبت جدید هم همین‌جا می‌توانید بگیرید 👇`,
      keyboard: bookKb,
      meta: { topic: "لغو/جابجایی" },
    };
  }

  // ─── آزمایشگاه / تصویربرداری / سونوگرافی ───
  if (/(ازمایش|آزمایش|خون دادن|رادیولوژی|تصویربرداری|سونو|سی تی|ام آر ای|ام آرآی)/.test(q)) {
    return {
      text:
        `🔬 <b>آزمایشگاه و تصویربرداری</b> در ${CLINIC.name} فعال است — نمونه‌گیری خون و سونوگرافی با نوبت قبلی انجام می‌شود.\n\n` +
        `بگویید برای چه بررسی‌ای می‌خواهید، یا نوبت بگیرید تا پزشک دستور لازم را صادر کند 👇`,
      keyboard: bookKb,
      meta: { topic: "آزمایش/تصویربرداری" },
    };
  }

  // ─── آمادگی قبل از مراجعه ───
  if (/(ناشتا|قبل از مراجعه|چی بخورم|آماده باشم|بخورم نیارم|قرص بخورم)/.test(q)) {
    return {
      text:
        `📋 <b>قبل از مراجعه:</b>\n` +
        `• برای آزمایش خون و چربی خون: ۱۲ ساعت ناشتا\n` +
        `• سونوگرافی شکم: ۶ ساعت ناشتا\n` +
        `• ویزیت عادی: آمادگی خاصی لازم نیست\n` +
        `• مدارک: کارت ملی + دفترچه/کارت بیمه بیاورید 🗂\n\n` +
        `سوال خاصی برای تخصص خودتان دارید؟ بپرسید یا نوبت بگیرید 👇`,
      keyboard: bookKb,
      meta: { topic: "آمادگی مراجعه" },
    };
  }

  // ─── فاکتور / گواهی ───
  if (/(فاکتور|رسید|گواهی|نامه پزشکی|مرخصی)/.test(q)) {
    return {
      text:
        `🧾 بله — پس از ویزیت، <b>فاکتور رسمی</b> صادر می‌شود و اگر پزشک تشخیص دهد، <b>گواهی پزشکی</b> هم صادر می‌گردد.\n\n` +
        `سوال دیگرتان را بپرسید یا نوبت بگیرید 👇`,
      keyboard: bookKb,
      meta: { topic: "فاکتور/گواهی" },
    };
  }

  // ─── لیست خدمات / تخصص‌ها ───
  if (/(خدمات|امکانات|چه کار|چیکار|لیست|بخش|تخصص)/.test(q)) {
    return {
      text:
        `🏥 <b>تخصص‌های ${CLINIC.name}:</b>\n\n` +
        SPECS.map((s) => `${s.emoji} ${s.name}`).join("\n") +
        `\n\nکدام تخصص را می‌خواهید؟ یا مستقیم نوبت بگیرید 👇`,
      keyboard: bookKb,
      meta: { topic: "لیست خدمات" },
    };
  }

  // ─── چند دکتر / لیست پزشکان / دکتر خاص ───
  const namedDoctor = VIP_DOCTORS.find((d) => q.includes(normalizeFa(d.name.split(" ").slice(-1)[0].toLowerCase())));
  if (namedDoctor || /(چند تا دکتر|چند دکتر|لیست پزشک|پزشکان|دکترها)/.test(q)) {
    if (namedDoctor) {
      const i = VIP_DOCTORS.indexOf(namedDoctor);
      return {
        text:
          `🩺 <b>${namedDoctor.name}</b> — ${namedDoctor.spec}\n🗓 روزهای مطب: ${namedDoctor.days}\n\n` +
          `نوبتِ ${namedDoctor.name.split(" ").slice(-1)[0]} را همین حالا رزرو کنید 👇`,
        keyboard: bookKb,
        meta: { doctorIdx: i, specIdx: namedDoctor.specIdx, topic: namedDoctor.name },
      };
    }
    return {
      text: `${vipDoctorsListText()}\n\nیا بگویید چه مشکلی دارید تا پزشک مناسب را معرفی کنم 🙏`,
      keyboard: bookKb,
      meta: { topic: "لیست پزشکان" },
    };
  }

  // ─── نوبت / رزرو ───
  if (/(نوبت|رزرو|وقت|ویزیت بشم|بیمار بشم|مراجعه)/.test(q)) {
    return {
      text: `عالی! ✨ بیایید همین حالا نوبت بگیریم — تخصص مورد نظر را انتخاب کنید:`,
      keyboard: bookKb,
      meta: { topic: "رزرو" },
    };
  }

  // ─── معرفی پزشک بر اساس علامت / تخصص مذکور ───
  const symIdx = detectSpecIdx(q);
  if (symIdx !== undefined) {
    const d = VIP_DOCTORS.find((x) => x.specIdx === symIdx) ?? VIP_DOCTORS[symIdx];
    const s = SPECS[symIdx];
    const sympathies = [
      "متأسفم که اذیت می‌شوید 🙏",
      "زودتر بررسی‌اش کنیم بهتر است ✨",
      "نگران نباشید، قابل حل است 🌸",
    ][symIdx % 3];
    return {
      text:
        `${sympathies}\n\nپیشنهاد من: <b>${d.name}</b> (${s.emoji} ${s.name}) 🩺\n🗓 روزهای مطب: ${d.days}\n\n` +
        `همین حالا نوبت بگیرید تا یادآوری رایگان تلگرامی هم بگیرید. 👇`,
      keyboard: bookKb,
      meta: { doctorIdx: VIP_DOCTORS.indexOf(d), specIdx: symIdx, topic: `علامت ${s.name}` },
    };
  }

  // ─── fallback صادقانه — هدایت به مشاوره (سرنخ‌گیری مثل دموی اینستاگرام) ───
  return {
    text:
      `سوال خوبی است 🙏 برای پاسخ دقیق و تخصصی، کارشناس پذیرش باید جزئیات را ببیند.\n\n` +
      `دو راه سریع دارید:\n1️⃣ شماره‌تان را ثبت کنید تا <b>مشاوره رایگان</b> بگیرید\n2️⃣ مستقیم نوبت بگیرید و حضوری بپرسید\n\nکدام را ترجیح می‌دهید؟`,
    keyboard: {
      inline_keyboard: [
        [{ text: "📞 مشاوره رایگان", callback_data: "consult" }],
        [{ text: "🗓 رزرو نوبت", callback_data: "book" }],
        [{ text: "🏠 منوی اصلی", callback_data: "home" }],
      ],
    },
    meta: { topic: "سایر" },
  };
}

// ─── یادآوری VIP (کرون مشترک پلن ۲ + VIP) — متن ثابت و قابل اتکا ───
export function vipReminderText(b: VipBooking): string {
  const d = VIP_DOCTORS[b.doctorIdx];
  return (
    `⏰ <b>یادآوری نوبت</b>\n\n` +
    `نوبت شما: <b>${b.dayLabel} ساعت ${b.time}</b>\n` +
    `${d.name} (${d.spec})\n\n` +
    `📍 ${CLINIC.address}\n` +
    `لطفًا ۱۵ دقیقه قبل حاضر باشید.\n\n` +
    `آیا این نوبت را حفظ می‌کنید؟`
  );
}

/** متن ثابت تماس صوتی (کاوه‌نگار TTS) — بدون HTML، خوانا برای سیستم تلفنی */
export function reminderCallText(b: VipBooking): string {
  const d = VIP_DOCTORS[b.doctorIdx];
  return (
    `سلام، از کلینیک سلامت. یادآوری نوبت. ` +
    `${b.dayLabel}، ساعت ${b.time}، ${d.name}. ` +
    `لطفا پانزده دقیقه قبل حاضر باشید. تا شنیدن دوباره.`
  );
}

export function vipReminderKeyboard(b: VipBooking): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "✅ بله، حفظ می‌کنم", callback_data: `rem:${b.id}:ok` }],
      [{ text: "💬 می‌خواهم جابجا کنم", callback_data: `rem:${b.id}:chg` }],
    ],
  };
}
