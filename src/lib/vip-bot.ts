// ─── ربات VIP کلینیک سلامت — آینه‌ی دموی پلن ۳ ───
// منبع دمو: takrah.top/demos/plan3.html (همان تخصص‌ها، همان پزشکان، همان لحن)
// یک ربات = دستیار کامل: نوبت‌دهی با انتخاب تخصص + منشی هوشمند «آوا» + مشاوره/سرنخ‌گیری
// توکن‌ها فقط از متغیرهای محیطی خوانده می‌شوند (هیچ توکنی در سورس ذخیره نیست).
// تنظیمات لازم در Vercel:
//   VIP_BOT_TOKEN        → توکن ربات VIP از BotFather
//   VIP_WEBHOOK_SECRET   → کلید مخفی وبهوک (اختیاری، پیش‌فرض دارد)
//   VIP_ADMIN_CHAT_ID    → چت‌آی‌دی ادمین (اگر خالی باشد از CLINIC_ADMIN_CHAT_ID استفاده می‌شود)
import { CLINIC, SLOTS } from "./clinic-bot";

export { CLINIC, SLOTS };

// ─── تنظیمات از محیط ───
export const VIP_TOKEN = process.env.VIP_BOT_TOKEN ?? "";
export const VIP_SECRET =
  process.env.VIP_WEBHOOK_SECRET ?? "vip-demo-secret-25a77bf";
export const VIP_ADMIN_CHAT_ID =
  process.env.VIP_ADMIN_CHAT_ID ?? process.env.CLINIC_ADMIN_CHAT_ID ?? "";

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

// ─── ذخیره‌سازی: حافظه (پیش‌فرض) یا Upstash Redis REST — با پیشوند vip: ───
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const mem = new Map<string, string>();

async function storeSet(key: string, value: string): Promise<void> {
  if (REDIS_URL && REDIS_TOKEN) {
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

// ─── منشی هوشمند «آوا» — موتور پاسخ‌دهی هوشمند (عین شخصیت دموی #ai) ───
export function avaIntroText(): string {
  return (
    `🤖 <b>آوا — منشی هوشمند</b>\n\n` +
    `سوال‌تان را همان‌طور که هست بنویسید؛ مثلاً:\n` +
    `• «قیمت ویزیت دندانپزشکی چنده؟»\n` +
    `• «ساعت کاری جمعه باز هستید؟»\n` +
    `• «درد دندان دارم، کدام دکتر؟»\n\n` +
    `هر لحظه بپرسید — ۲۴ ساعته جواب می‌گیرید. 🌸`
  );
}

export interface AvaReply {
  text: string;
  keyboard?: Keyboard;
}

const BOOK_ROW: Keyboard = {
  inline_keyboard: [
    [{ text: "🗓 رزرو نوبت همین حالا", callback_data: "book" }],
    [{ text: "🏠 منوی اصلی", callback_data: "home" }],
  ],
};

function consultRow(extra?: string): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "📞 ثبت مشاوره رایگان", callback_data: "consult" }],
      ...(extra ? [[{ text: extra, callback_data: "home" }]] : [[{ text: "🏠 منوی اصلی", callback_data: "home" }]]),
    ],
  };
}

/** موتور پاسخ آوا — تشخیص موضوع با کلیدواژه (بدون وابستگی خارجی؛ ۱۰۰٪ آفلاین و قطعی) */
export function avaAnswer(question: string): AvaReply {
  const q = question.toLowerCase();

  // سلام و احوالپرسی
  if (/^(سلام|درود|هی|های|سلام علیکم)/.test(q) || /^(سلام|درود)[! ،.]*$/.test(q)) {
    return {
      text:
        `سلام! 🌸 خوش آمدید.\nمن <b>آوا</b> هستم، منشی هوشمند ${CLINIC.name} — ۲۴ ساعته در خدمتم.\n\n` +
        `سوال‌تان را بپرسید یا از منو انتخاب کنید 👇`,
      keyboard: vipMainKeyboard(),
    };
  }

  // تشکر
  if (/(ممنون|مرسی|سپاس|دستت درد|متشکر)/.test(q)) {
    return {
      text: `خواهش می‌کنم! 🌸 کاری دارید من هستم — ۲۴ ساعته آنلاین.`,
      keyboard: vipMainKeyboard(),
    };
  }

  // قیمت
  if (/(قیمت|هزینه|تعرفه|تاریف|چنده|چقدر|نرخ|خرج)/.test(q)) {
    return {
      text:
        `💰 <b>تعرفه‌ها:</b>\n\n` +
        `• ویزیت تخصصی: بسته به تخصص و نوع خدمت\n` +
        `• خدمات تصویربرداری و آزمایشگاه: طبقه‌بندی خاص\n` +
        `• ترمیم و درمان دندان: از <b>۸۰۰ هزار تومان</b> 🦷\n\n` +
        `تعرفه دقیق به تشخیص پزشک بستگی دارد. اگر شماره‌تان را ثبت کنید، پذیرش برای <b>مشاوره رایگان</b> تماس می‌گیرد و همه‌چیز را دقیق می‌گوید. 📞`,
      keyboard: consultRow(),
    };
  }

  // آدرس
  if (/(آدرس|ادرس|کجا|مکان|لوکیشن|مسیر|ساکن|موقعیت)/.test(q)) {
    return {
      text:
        `📍 <b>${CLINIC.name}</b>\n${CLINIC.address}\n\n` +
        `☎️ پذیرش: <code>${CLINIC.phone}</code>\nپارکینگ و دسترسی آسان دارد. 🚗`,
      keyboard: BOOK_ROW,
    };
  }

  // ساعات کاری
  if (/(ساعت|ساعتها|باز|تعطیل|بسته|چندشنبه|کاره|شیفت)/.test(q)) {
    return {
      text:
        `🕐 <b>ساعات کاری:</b>\n${CLINIC.hours}\n\n` +
        `ولی من که ۲۴ ساعته اینجا هستم — هر ساعتی بپرسید جواب می‌گیرید! 🤖`,
      keyboard: BOOK_ROW,
    };
  }

  // بیمه
  if (/(بیمه|بیمه‌ها|تکمیلی|درمانگاه|قرارداد|دفترچه)/.test(q)) {
    return {
      text:
        `🛡 <b>بیمه:</b>\nکلینیک با اکثر بیمه‌های پایه و بیمه‌های تکمیلی قرارداد دارد.\n\n` +
        `برای اطلاع از اینکه بیمه‌ی شما پوشش می‌دهد یا نه، شماره‌تان را ثبت کنید تا پذیرش دقیق راهنمایی کند. 📞`,
      keyboard: consultRow(),
    };
  }

  // خدمات کلی
  if (/(خدمات|امکانات|چه کار|چیکار|لیست خدمات|بخش)/.test(q)) {
    return {
      text:
        `🏥 <b>تخصص‌های ${CLINIC.name}:</b>\n\n` +
        SPECS.map((s) => `${s.emoji} ${s.name}`).join("\n") +
        `\n\nکدام تخصص را می‌خواهید؟ یا مستقیم نوبت بگیرید 👇`,
      keyboard: BOOK_ROW,
    };
  }

  // معرفی پزشک بر اساس مشکل — عین سناریوی دموی «آوا»
  const rec = (d: VipDoctor, symptom: string): AvaReply => ({
    text:
      `${symptom}\n\nپیشنهاد من: <b>${d.name}</b> (${d.spec}) 🩺\n🗓 روزهای مطب: ${d.days}\n\n` +
      `همین حالا نوبت بگیرید تا یادآوری رایگان تلگرامی هم بگیرید. 👇`,
    keyboard: BOOK_ROW,
  });
  if (/(دندان|دندون|لمینت|ایمپلنت|ترمیم|جرم‌گیری|جرم گیری|ریشه)/.test(q))
    return rec(VIP_DOCTORS[0], "متأسفم که درد دارید 🙏");
  if (/(پوست|مو|جوش|لک|آکنه|آبله|کیکاک|لیزر|ریزش مو)/.test(q))
    return rec(VIP_DOCTORS[1], "برای پوست و مو بهترین انتخاب این است ✨");
  if (/(قلب|سینه|تپش|فشار خون|نفس‌نفس|نفس نفس|چربی خون)/.test(q))
    return rec(VIP_DOCTORS[2], "برای قلب و عروق حتماً پیگیری کنید ❤️");
  if (/(زنان|باردار|بارداری|یائسگی|سونوگرافی زنان)/.test(q))
    return rec(VIP_DOCTORS[3], "این موضوع را متخصص زنان پیگیری می‌کند 🌸");
  if (/(کودک|بچه|اطفال|شیرخوار|واکسن کودک|تب کودک)/.test(q))
    return rec(VIP_DOCTORS[4], "برای کودک دلسوزانه پیگیری کنیم 👶");
  if (/(اعصاب|سردرد|میگرن|سرگیجه|بی‌خوابی|بی خوابی|تشدید|لرزش|فراموشی)/.test(q))
    return rec(VIP_DOCTORS[5], "برای مغز و اعصاب بهتر است بررسی شود 🧠");

  // نوبت / رزرو
  if (/(نوبت|رزرو|وقت|ویزیت بشم|بیمار بشم|مراجعه)/.test(q)) {
    return {
      text: `عالی! ✨ بیایید همین حالا نوبت بگیریم — تخصص مورد نظر را انتخاب کنید:`,
      keyboard: BOOK_ROW,
    };
  }

  // فوریت / درد شدید
  if (/(فوری|شدید|تحمل نمی|اورژانس|بدتر شد)/.test(q)) {
    return {
      text:
        `اگر درد شدید است، فوراً با پذیرش تماس بگیرید: ☎️ <code>${CLINIC.phone}</code>\n\n` +
        `همچنین می‌توانم سریع‌ترین نوبت را برایتان رزرو کنم 👇`,
      keyboard: BOOK_ROW,
    };
  }

  // fallback صادقانه — هدایت به مشاوره (مثل رفتار دموی اینستاگرام: گرفتن سرنخ)
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
  };
}

// ─── یادآوری VIP (کرون مشترک پلن ۲ + VIP) ───
export function vipReminderText(b: VipBooking): string {
  const d = VIP_DOCTORS[b.doctorIdx];
  return (
    `⏰ <b>یادآوری نوبت</b>\n\n` +
    `نوبت شما: <b>${b.dayLabel} ساعت ${b.time}</b>\n` +
    `${d.name} (${d.spec})\n\n` +
    `آیا این نوبت را حفظ می‌کنید؟`
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
