// ─── وبهوک ربات نوبت‌دهی کلینیک سلامت ───
// آینه‌ی دموی پلن ۲: انتخاب پزشک → روز → ساعت → نام → تلفن → تأیید
// ثبت‌نام واقعی: نوبت ذخیره می‌شود و کارت نوبت برای ادمین (CLINIC_ADMIN_CHAT_ID) ارسال می‌گردد.
import { NextRequest } from "next/server";
import {
  ADMIN_CHAT_ID,
  CLINIC,
  CLINIC_SECRET,
  CLINIC_TOKEN,
  DOCTORS,
  SLOTS,
  type Booking,
  type PendingBooking,
  adminNotification,
  bookingConfirmedText,
  confirmKeyboard,
  daysKeyboard,
  doctorsKeyboard,
  doctorsListText,
  infoText,
  isPhone,
  mainKeyboard,
  normalizePhone,
  pendingState,
  reminderKeyboard,
  reminderText,
  reply,
  saveBooking,
  slotsKeyboard,
  summaryCard,
  tg,
  updateBooking,
  userBookings,
  welcomeText,
  workingDays,
} from "@/lib/clinic-bot";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Keyboard = {
  inline_keyboard: { text: string; callback_data?: string; url?: string }[][];
};

function btn(text: string, data: string): { text: string; callback_data: string } {
  return { text, callback_data: data };
}

async function answerCb(id: string, text?: string): Promise<void> {
  if (!id) return;
  await tg("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
}

async function editOrReply(
  chatId: number | string,
  messageId: number | undefined,
  text: string,
  keyboard?: Keyboard,
): Promise<void> {
  if (messageId) {
    const res = (await tg("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })) as { ok?: boolean } | null;
    if (res?.ok) return;
  }
  await reply(chatId, text, keyboard);
}

// ─── پیام‌های متنی (مرحله نام / تلفن / فرمان‌ها) ───
async function handleText(chatId: number, text: string, fromName?: string): Promise<void> {
  const p = pendingState.get(chatId);

  if (text.startsWith("/start")) {
    const payload = text.split(" ")[1] || "";
    pendingState.del(chatId);
    if (payload === "book") {
      // دیپ‌لینک t.me/<bot>?start=book → مستقیم انتخاب پزشک
      await reply(chatId, "👨‍⚕️ <b>پزشک مورد نظر را انتخاب کنید:</b>", doctorsKeyboard());
      return;
    }
    await reply(chatId, welcomeText(fromName), mainKeyboard());
    return;
  }

  if (text.startsWith("/id")) {
    await reply(
      chatId,
      `🆔 شناسه‌ی چت شما:\n<code>${chatId}</code>\n\n` +
        `اگر مدیر کلینیک هستید، این عدد را در متغیر محیطی CLINIC_ADMIN_CHAT_ID قرار دهید تا نوبت‌های جدید برایتان ارسال شود.`,
    );
    return;
  }

  if (text.startsWith("/bookings") || text.startsWith("/my")) {
    const list = await userBookings(chatId);
    if (!list.length) {
      await reply(chatId, "هنوز نوبتی ندارید — با دکمه‌ی «🗓 رزرو نوبت» شروع کنید 🌸", mainKeyboard());
      return;
    }
    const body = list
      .map(
        (b) =>
          `🧾 <code>#${b.id}</code>\n🩺 ${DOCTORS[b.doctorIdx].name}\n🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>`,
      )
      .join("\n\n");
    await reply(chatId, `🔎 <b>نوبت‌های شما:</b>\n\n${body}`, mainKeyboard());
    return;
  }

  if (text.startsWith("/help")) {
    await reply(
      chatId,
      "راهنما:\n/start — شروع و منوی اصلی\n/bookings — نوبت‌های من\n/id — شناسه چت (برای مدیر)\n/help — همین راهنما",
      mainKeyboard(),
    );
    return;
  }

  // ── مرحله‌ی نام ──
  if (p?.step === "name") {
    const name = text.replace(/\s+/g, " ").trim();
    if (name.length < 3 || name.length > 60) {
      await reply(chatId, "لطفاً نام و نام خانوادگی کامل را بنویسید 🙏");
      return;
    }
    p.name = name;
    p.step = "phone";
    pendingState.set(chatId, p);
    await reply(
      chatId,
      `خوش آمدید ${name}! 🌸\nحالا <b>شماره موبایل</b> خود را بفرستید (مثلاً ۰۹۱۱۱۲۳۴۵۶۷)\nتا در صورت نیاز بتوانیم نوبت را هماهنگ کنیم.`,
    );
    return;
  }

  // ── مرحله‌ی تلفن ──
  if (p?.step === "phone") {
    if (!isPhone(text)) {
      await reply(
        chatId,
        "شماره موبایل معتبر نیست — با ۰۹ شروع می‌شود و ۱۱ رقم است.\nمثال: ۰۹۱۱۱۲۳۴۵۶۷",
      );
      return;
    }
    p.phone = normalizePhone(text);
    pendingState.set(chatId, p);
    await reply(chatId, summaryCard(p), confirmKeyboard());
    return;
  }

  // متن آزاد → راهنمایی به منو (مثل رفتار دوستانه‌ی دمو)
  await reply(
    chatId,
    "برای رزرو نوبت از دکمه‌های زیر استفاده کنید 👇",
    mainKeyboard(),
  );
}

// ─── دکمه‌ها (callback) ───
async function handleCallback(
  chatId: number,
  data: string,
  cbId: string,
  messageId?: number,
): Promise<void> {
  const days = workingDays();

  if (data === "taken") {
    await answerCb(cbId, "این ساعت پر شده — یکی دیگر انتخاب کنید 🙏");
    return;
  }

  if (data === "home") {
    pendingState.del(chatId);
    await editOrReply(chatId, messageId, welcomeText(), mainKeyboard());
    return;
  }

  if (data === "book") {
    pendingState.del(chatId);
    await editOrReply(
      chatId,
      messageId,
      "👨‍⚕️ <b>پزشک مورد نظر را انتخاب کنید:</b>",
      doctorsKeyboard(),
    );
    return;
  }

  if (data === "docs") {
    await editOrReply(chatId, messageId, doctorsListText(), {
      inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
    });
    return;
  }

  if (data === "info") {
    await editOrReply(chatId, messageId, infoText(), {
      inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
    });
    return;
  }

  if (data === "my") {
    const list = await userBookings(chatId);
    if (!list.length) {
      await editOrReply(chatId, messageId, "هنوز نوبتی ندارید — بیایید اولین نوبت را بگیریم! 🌸", {
        inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
      });
      return;
    }
    const body = list
      .map(
        (b) =>
          `🧾 <code>#${b.id}</code>\n🩺 ${DOCTORS[b.doctorIdx].name}\n🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>`,
      )
      .join("\n\n");
    await editOrReply(chatId, messageId, `🔎 <b>نوبت‌های شما:</b>\n\n${body}`, {
      inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
    });
    return;
  }

  // انتخاب پزشک → لیست روزها
  if (data.startsWith("d:")) {
    const i = Number(data.slice(2));
    if (!Number.isInteger(i) || !DOCTORS[i]) {
      await answerCb(cbId, "گزینه نامعتبر است");
      return;
    }
    const d = DOCTORS[i];
    pendingState.del(chatId);
    await editOrReply(
      chatId,
      messageId,
      `✨ <b>${d.name}</b> (${d.spec})\n🗓 روزهای مطب: ${d.days}\n\nچه روزی مناسب شماست؟`,
      daysKeyboard(i),
    );
    return;
  }

  // انتخاب روز → لیست اسلات‌ها
  if (data.startsWith("w:")) {
    const [, di, wi] = data.split(":").map(Number);
    if (!DOCTORS[di] || !days[wi]) {
      await answerCb(cbId, "گزینه نامعتبر است");
      return;
    }
    await editOrReply(
      chatId,
      messageId,
      `🗓 <b>${days[wi].label}</b> — ${DOCTORS[di].name}\n\nساعت مورد نظر را انتخاب کنید:\n(ساعت‌های ✖ پر شده‌اند)`,
      slotsKeyboard(di, wi),
    );
    return;
  }

  // انتخاب ساعت → مرحله‌ی نام
  if (data.startsWith("s:")) {
    const [, di, wi, si] = data.split(":").map(Number);
    if (!DOCTORS[di] || !days[wi] || !SLOTS[si]) {
      await answerCb(cbId, "گزینه نامعتبر است");
      return;
    }
    const bookingId = Math.random().toString(36).slice(2, 6).toUpperCase();
    pendingState.set(chatId, {
      step: "name",
      doctorIdx: di,
      dayIso: days[wi].iso,
      dayLabel: days[wi].label,
      time: SLOTS[si],
      bookingId,
    });
    await editOrReply(
      chatId,
      messageId,
      `عالی! ✨\n🩺 ${DOCTORS[di].name} — 🗓 ${days[wi].label} — 🕐 <b>${SLOTS[si]}</b>\n\nحالا <b>نام و نام خانوادگی</b> خود را بنویسید:`,
      { inline_keyboard: [[btn("❌ انصراف", "home")]] },
    );
    return;
  }

  // تأیید نهایی نوبت
  if (data === "do:confirm") {
    const p = pendingState.get(chatId);
    if (!p || !p.name || !p.phone) {
      await editOrReply(chatId, messageId, "این درخواست منقضی شده — بیایید از نو شروع کنیم 🌸", {
        inline_keyboard: [[btn("🗓 رزرو نوبت", "book")]],
      });
      return;
    }
    const booking: Booking = {
      id: p.bookingId,
      chatId,
      userName: p.name,
      phone: p.phone,
      doctorIdx: p.doctorIdx,
      dayIso: p.dayIso,
      dayLabel: p.dayLabel,
      time: p.time,
      createdAt: Date.now(),
    };
    await saveBooking(booking);
    pendingState.del(chatId);

    await editOrReply(chatId, messageId, bookingConfirmedText(booking), {
      inline_keyboard: [[btn("🔎 نوبت‌های من", "my")], [btn("🏠 منوی اصلی", "home")]],
    });

    // کارت نوبت برای ادمین
    if (ADMIN_CHAT_ID) {
      await reply(ADMIN_CHAT_ID, adminNotification(booking));
    }
    return;
  }

  if (data === "do:cancel") {
    pendingState.del(chatId);
    await editOrReply(
      chatId,
      messageId,
      "باشه، نوبت ثبت نشد 🙏\nهر وقت خواستید در خدمتم!",
      mainKeyboard(),
    );
    return;
  }

  // پاسخ به یادآوری ۲۴ ساعته
  if (data.startsWith("rem:")) {
    const [, id, act] = data.split(":");
    if (act === "ok") {
      await editOrReply(
        chatId,
        messageId,
        `عالی! 🙌 نوبت شما تأیید شد.\n📍 ${CLINIC.address}\n۱۵ دقیقه قبل حاضر باشید — ما منتظرتان هستیم 🌸`,
      );
      if (ADMIN_CHAT_ID) await reply(ADMIN_CHAT_ID, `✅ بیمار «نوبت #${id}» را تأیید کرد.`);
      return;
    }
    if (act === "chg") {
      await editOrReply(
        chatId,
        messageId,
        `💬 مشکلی نیست! برای جابجایی نوبت، پذیرش را خبر کنید:\n☎️ <code>${CLINIC.phone}</code>\n\nیا همین حالا یک نوبت جدید بگیرید:`,
        { inline_keyboard: [[btn("🗓 رزرو نوبت جدید", "book")], [btn("🏠 منو", "home")]] },
      );
      if (ADMIN_CHAT_ID) await reply(ADMIN_CHAT_ID, `🔁 بیمار «نوبت #${id}» درخواست جابجایی دارد.`);
      return;
    }
  }

  await answerCb(cbId);
}

// ─── POST: آپدیت‌های تلگرام ───
export async function POST(req: NextRequest) {
  if (req.headers.get("x-telegram-bot-api-secret-token") !== CLINIC_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  type Update = {
    message?: {
      chat?: { id?: number };
      from?: { first_name?: string };
      text?: string;
    };
    callback_query?: {
      id?: string;
      data?: string;
      message?: { chat?: { id?: number }; message_id?: number };
    };
  };

  let update: Update;
  try {
    update = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  try {
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      if (chatId && cb.data) {
        await handleCallback(chatId, cb.data, cb.id ?? "", cb.message?.message_id);
      }
    } else if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || "").trim();
      if (chatId && text) {
        await handleText(chatId, text, msg.from?.first_name);
      }
    }
  } catch {
    // هرگز خطا به تلگرام برنگردد — retry بی‌مورد ایجاد نمی‌شود
  }

  return Response.json({ ok: true });
}

// ─── GET: بررسی سلامت (بدون توکن، فقط وضعیت) ───
export async function GET() {
  return Response.json({
    ok: true,
    bot: "clinic-booking",
    clinic: CLINIC.name,
    doctors: DOCTORS.length,
    slots: SLOTS.length,
    tokenConfigured: Boolean(CLINIC_TOKEN),
    hint: "POST telegram updates here",
  });
}
