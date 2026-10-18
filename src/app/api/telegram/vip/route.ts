// ─── وبهوک ربات VIP کلینیک سلامت ───
// آینه‌ی دموی پلن ۳: تخصص → پزشک → روز → ساعت → نام → تلفن → توضیحات → تأیید
// + منشی هوشمند «آوا» (هر متن آزاد = سوال) + مشاوره رایگان (سرنخ‌گیری) + یادآوری
// ثبت واقعی: نوبت/سرنخ ذخیره و کارت آن برای ادمین (VIP_ADMIN_CHAT_ID) ارسال می‌شود.
import { NextRequest } from "next/server";
import {
  CLINIC,
  SPECS,
  SLOTS,
  DIRECTOR_CHAT_ID,
  VIP_ADMIN_CHAT_ID,
  VIP_DOCTORS,
  VIP_SECRET,
  VIP_TOKEN,
  type PendingVip,
  type VipBooking,
  type VipLead,
  avaAnswer,
  avaAnswerSmart,
  avaIntroText,
  confirmVipKeyboard,
  daysKeyboardVip,
  doctorsKeyboardForSpec,
  isPhone,
  normalizePhone,
  pendingVipState,
  replyVip,
  saveVipBooking,
  saveVipLead,
  skipNoteKeyboard,
  slotsKeyboardVip,
  specsKeyboard,
  tgVip,
  userVipBookings,
  vipAdminNotification,
  vipBookingConfirmedText,
  vipDoctorsListText,
  vipInfoText,
  vipMainKeyboard,
  vipSummaryCard,
  vipWelcomeText,
  workingDays,
} from "@/lib/vip-bot";
import { aiAvailable, avaLLM, ZAI_BASE, ZAI_KEY, ZAI_MODEL } from "@/lib/ai";
import { getEvents, kvGet, kvSet, logEvent, safeParse, storageMode } from "@/lib/kv";
import { buildReport, reportText } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Keyboard = {
  inline_keyboard: { text: string; callback_data?: string; url?: string }[][];
};

function btn(text: string, data: string): { text: string; callback_data: string } {
  return { text, callback_data: data };
}

async function answerCb(id: string, text?: string): Promise<void> {
  if (!id) return;
  await tgVip("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
}

/** نشانگر «در حال نوشتن…» — حس زنده بودن منشی */
async function typing(chatId: number): Promise<void> {
  await tgVip("sendChatAction", { chat_id: chatId, action: "typing" });
}

/** کانتکست کلینیک برای پرامپت هوش مصنوعی */
function clinicCtx() {
  return {
    name: CLINIC.name,
    address: CLINIC.address,
    phone: CLINIC.phone,
    hours: CLINIC.hours,
    specs: SPECS.map((s) => ({ emoji: s.emoji, name: s.name })),
    doctors: VIP_DOCTORS.map((d) => ({ name: d.name, spec: d.spec, days: d.days })),
  };
}

/** پاسخ آوا: اول هوش مصنوعی (اگر کلید باشد)، وگرنه موتور داخلی با حافظه
 *  voiceOrigin=true → اگر TTS متصل بود، آوا با صدای واقعی هم جواب می‌دهد 🎧 */
async function avaRespond(chatId: number, text: string, voiceOrigin = false): Promise<void> {
  await typing(chatId);
  // موضوع سوال را همیشه با موتور داخلی برچسب می‌زنیم (برای گزارش مدیر)
  const probe = avaAnswer(text);
  await logEvent("ava_q", probe.meta?.topic);

  if (aiAvailable()) {
    const llmText = await avaLLM(chatId, text, clinicCtx());
    if (llmText) {
      if (voiceOrigin) {
        const spoken = await speakReply(chatId, llmText);
        if (spoken) return; // پاسخ صوتی + کپتشن متن ارسال شد
      }
      await replyVip(chatId, llmText, vipMainKeyboard());
      return;
    }
  }
  const a = await avaAnswerSmart(chatId, text);
  await replyVip(chatId, a.text, a.keyboard ?? vipMainKeyboard());
}

// ─── صدای آوا: تبدیل پاسخ به گفتار با ElevenLabs + ارسال به تلگرام ───
// مدل‌ها به ترتیب امتحان می‌شوند (eleven_v3 فارسی را پشتیبانی می‌کند) و مدل
// برنده در Redis کش می‌شود تا پاسخ‌های بعدی سریع‌تر باشد.
async function ttsEleven(text: string): Promise<Buffer | null> {
  const key = process.env.ELEVENLABS_API_KEY ?? "";
  if (!key) return null;
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "9BWtsMINqrJLrRacOk9x"; // Aria
  const cached = await kvGet("cfg:ttsModel");
  const candidates = [
    ...(cached ? [cached] : []),
    process.env.ELEVENLABS_TTS_MODEL ?? "",
    "eleven_v3",
    "eleven_multilingual_v2",
    "eleven_flash_v2_5",
  ].filter((m, i, arr) => Boolean(m) && arr.indexOf(m) === i);
  for (const model of candidates) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35_000);
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": key, "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.slice(0, 800), model_id: model }),
          signal: ctrl.signal,
        },
      );
      if (res.ok) {
        const ab = await res.arrayBuffer();
        if (ab.byteLength > 1000) {
          if (model !== cached) await kvSet("cfg:ttsModel", model);
          return Buffer.from(ab);
        }
        await kvSet("dbg:tts", JSON.stringify({ t: Date.now(), model, status: res.status, body: "empty-audio" }));
      } else {
        const body = await res.text().catch(() => "");
        await kvSet(
          "dbg:tts",
          JSON.stringify({ t: Date.now(), model, status: res.status, body: body.slice(0, 240) }),
        );
      }
    } catch (e) {
      await kvSet(
        "dbg:tts",
        JSON.stringify({ t: Date.now(), model, status: 0, body: e instanceof Error ? e.message : "error" }),
      );
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/** ارسال پاسخ صوتی + کپتشن متن؛ true اگر صدا ارسال شد */
async function speakReply(chatId: number, answer: string): Promise<boolean> {
  const mp3 = await ttsEleven(answer);
  if (!mp3) return false;
  try {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("audio", new Blob([Uint8Array.from(mp3)], { type: "audio/mpeg" }), "ava.mp3");
    form.append("caption", answer.slice(0, 1024));
    form.append("parse_mode", "HTML");
    form.append("performer", "آوا — منشی کلینیک سلامت");
    form.append("title", "پاسخ صوتی آوا");
    const res = await fetch(`https://api.telegram.org/bot${VIP_TOKEN}/sendAudio`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(25_000),
    });
    if (res.ok) return true;
    const body = await res.text().catch(() => "");
    await kvSet(
      "dbg:tts",
      JSON.stringify({ t: Date.now(), model: "telegram-sendAudio", status: res.status, body: body.slice(0, 240) }),
    );
    return false;
  } catch {
    return false;
  }
}

// ─── وویس: دریافت صدا → متن → آوا ───
// ترتیب سرویس‌ها: ElevenLabs Scribe (رایگان ۳۰دقیقه/ماه، OGG مستقیم، فارسی عالی)
//  → سرویس اختصاصی VOICE_ASR_URL (JSON-base64) → GLM-ASR زدات (نیازمند شارژ حساب)
//  → پیام محترمانه
async function transcribeEleven(buf: Buffer): Promise<string | null> {
  const key = process.env.ELEVENLABS_API_KEY ?? "";
  if (!key) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const form = new FormData();
    form.append("file", new Blob([Uint8Array.from(buf)], { type: "audio/ogg" }), "voice.ogg");
    form.append("model_id", process.env.ELEVENLABS_STT_MODEL ?? "scribe_v1");
    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": key },
      body: form,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      await kvSet(
        "dbg:voice",
        JSON.stringify({ t: Date.now(), stage: "eleven", status: res.status, body: body.slice(0, 240) }),
      );
      return null;
    }
    const j = (await res.json().catch(() => null)) as { text?: string } | null;
    const out = j?.text && j.text.trim() ? j.text.trim().slice(0, 500) : null;
    await kvSet(
      "dbg:voice",
      JSON.stringify({ t: Date.now(), stage: "eleven", ok: Boolean(out), text: (out ?? "").slice(0, 80) }),
    );
    return out;
  } catch (e) {
    await kvSet(
      "dbg:voice",
      JSON.stringify({ t: Date.now(), stage: "eleven", status: 0, body: e instanceof Error ? e.message : "error" }),
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function asrTranscribe(buf: Buffer): Promise<string | null> {
  const customUrl = process.env.VOICE_ASR_URL ?? "";
  const key = process.env.VOICE_ASR_KEY ?? ZAI_KEY ?? "";
  if (!customUrl && !key) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    let res: Response;
    if (customUrl) {
      res = await fetch(customUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
        body: JSON.stringify({
          model: process.env.VOICE_ASR_MODEL ?? "asr",
          file_base64: buf.toString("base64"),
        }),
        signal: ctrl.signal,
      });
    } else {
      // سرویس رسمی زدات — GLM-ASR (فقط multipart)
      const form = new FormData();
      form.append("model", process.env.VOICE_ASR_MODEL ?? "glm-asr-2512");
      form.append("stream", "false");
      form.append("file", new Blob([Uint8Array.from(buf)], { type: "audio/ogg" }), "voice.ogg");
      res = await fetch(`${ZAI_BASE}/audio/transcriptions`, {
        method: "POST",
        headers: key ? { Authorization: `Bearer ${key}` } : {},
        body: form,
        signal: ctrl.signal,
      });
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      await kvSet(
        "dbg:voice",
        JSON.stringify({ t: Date.now(), stage: customUrl ? "custom" : "zai", status: res.status, body: body.slice(0, 240) }),
      );
      return null;
    }
    const j = (await res.json().catch(() => null)) as
      | { text?: string; result?: string | { text?: string } }
      | null;
    const out =
      typeof j?.text === "string"
        ? j.text
        : typeof j?.result === "string"
          ? j.result
          : (j?.result as { text?: string } | undefined)?.text;
    const clean = out && out.trim() ? out.trim().slice(0, 500) : null;
    await kvSet(
      "dbg:voice",
      JSON.stringify({ t: Date.now(), stage: customUrl ? "custom" : "zai", ok: Boolean(clean), text: (clean ?? "").slice(0, 80) }),
    );
    return clean;
  } catch (e) {
    await kvSet(
      "dbg:voice",
      JSON.stringify({ t: Date.now(), stage: customUrl ? "custom" : "zai", status: 0, body: e instanceof Error ? e.message : "error" }),
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function handleVoice(chatId: number, fileId: string, durationSec = 0): Promise<void> {
  await typing(chatId);
  if (durationSec > 31) {
    await replyVip(
      chatId,
      `🎙 وویس شما <b>${Math.round(durationSec)} ثانیه</b> است؛ فعلاً فقط وویس‌های کمتر از <b>۳۰ ثانیه</b> را می‌شنوم.

لطفاً سوال را کوتاه‌تر ضبط کنید یا متنی بنویسید 🙏`,
      vipMainKeyboard(),
    );
    return;
  }
  let buf: Buffer | null = null;
  try {
    const g = (await tgVip("getFile", { file_id: fileId })) as
      | { ok?: boolean; result?: { file_path?: string } }
      | null;
    if (g?.ok && g.result?.file_path) {
      const bin = await fetch(`https://api.telegram.org/file/bot${VIP_TOKEN}/${g.result.file_path}`);
      if (bin.ok) {
        const ab = await bin.arrayBuffer();
        if (ab.byteLength <= 20 * 1024 * 1024) buf = Buffer.from(ab);
      }
    }
  } catch {
    /* ادامه با پیام محترمانه */
  }

  const text = buf ? (await transcribeEleven(buf)) ?? (await asrTranscribe(buf)) : null;
  if (!text) {
    await logEvent("voice", "بدون تبدیل متن");
    await replyVip(
      chatId,
      `🎤 <b>وویس شما دریافت شد!</b>\n\n` +
        `این لحظه شنیدن صدای شما را با متن دقیق‌تر جواب می‌دهم — لطفاً همان سوال را <b>متنی</b> بنویسید یا از دکمه‌های زیر استفاده کنید 🙏`,
      vipMainKeyboard(),
    );
    return;
  }
  await logEvent("voice", text.slice(0, 60));
  await avaRespond(chatId, text, true);
}

async function editOrReply(
  chatId: number | string,
  messageId: number | undefined,
  text: string,
  keyboard?: Keyboard,
): Promise<void> {
  if (messageId) {
    const res = (await tgVip("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })) as { ok?: boolean } | null;
    if (res?.ok) return;
  }
  await replyVip(chatId, text, keyboard);
}

// ─── پیام‌های متنی (فرمان‌ها + مراحل + سوال آزاد برای آوا) ───
async function handleText(chatId: number, text: string, fromName?: string): Promise<void> {
  const p = pendingVipState.get(chatId);

  if (text.startsWith("/start")) {
    const payload = text.split(" ")[1] || "";
    pendingVipState.del(chatId);
    if (payload === "book") {
      await replyVip(chatId, "🏥 <b>تخصص مورد نظر را انتخاب کنید:</b>", specsKeyboard());
      return;
    }
    if (payload === "ava") {
      pendingVipState.set(chatId, { mode: "ava", step: "name" });
      await replyVip(chatId, avaIntroText());
      return;
    }
    await replyVip(chatId, vipWelcomeText(fromName), vipMainKeyboard());
    return;
  }

  if (text.startsWith("/id")) {
    await replyVip(
      chatId,
      `🆔 شناسه‌ی چت شما:\n<code>${chatId}</code>\n\n` +
        `اگر مدیر کلینیک هستید، این عدد را در متغیر VIP_ADMIN_CHAT_ID قرار دهید تا نوبت‌ها و سرنخ‌های جدید برایتان ارسال شود.`,
    );
    return;
  }

  if (text.startsWith("/bookings") || text.startsWith("/my")) {
    const list = await userVipBookings(chatId);
    if (!list.length) {
      await replyVip(chatId, "هنوز نوبتی ندارید — با دکمه‌ی «🗓 رزرو نوبت» شروع کنید 🌸", vipMainKeyboard());
      return;
    }
    const body = list
      .map(
        (b) =>
          `🧾 <code>#${b.id}</code>\n${SPECS[b.specIdx].emoji} ${SPECS[b.specIdx].name}\n🩺 ${VIP_DOCTORS[b.doctorIdx].name}\n🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>`,
      )
      .join("\n\n");
    await replyVip(chatId, `🔎 <b>نوبت‌های شما:</b>\n\n${body}`, vipMainKeyboard());
    return;
  }

  if (text.startsWith("/help")) {
    await replyVip(
      chatId,
      "راهنما:\n/start — شروع و منوی اصلی\n/bookings — نوبت‌های من\n/id — شناسه چت (برای مدیر)\n/report — گزارش عملکرد (فقط مدیریت)\n/help — همین راهنما\n\nهر سوال دیگری هم بنویسید یا وویس بفرستید — منشی هوشمند «آوا» جواب می‌دهد 🤖",
      vipMainKeyboard(),
    );
    return;
  }

  // ── گزارش عملکرد — فقط مدیریت (رئیس درمانگاه) ──
  if (text.startsWith("/report") || text.startsWith("/stats")) {
    const admin = String(VIP_ADMIN_CHAT_ID || DIRECTOR_CHAT_ID);
    if (String(chatId) !== admin) {
      await replyVip(chatId, "🔒 این بخش فقط برای مدیریت کلینیک است. 🙏");
      return;
    }
    await typing(chatId);
    const r = await buildReport();
    await replyVip(chatId, reportText(r));
    return;
  }

  // ── مراحل رزرو نوبت ──
  if (p?.mode === "booking" && p.step === "name") {
    const name = text.replace(/\s+/g, " ").trim();
    if (name.length < 3 || name.length > 60) {
      await replyVip(chatId, "لطفاً نام و نام خانوادگی کامل را بنویسید 🙏");
      return;
    }
    p.name = name;
    p.step = "phone";
    pendingVipState.set(chatId, p);
    await replyVip(
      chatId,
      `خوش آمدید ${name}! 🌸\nحالا <b>شماره موبایل</b> خود را بفرستید (مثلاً ۰۹۱۱۱۲۳۴۵۶۷)\nتا در صورت نیاز بتوانیم نوبت را هماهنگ کنیم.`,
    );
    return;
  }

  if (p?.mode === "booking" && p.step === "phone") {
    if (!isPhone(text)) {
      await replyVip(
        chatId,
        "شماره موبایل معتبر نیست — با ۰۹ شروع می‌شود و ۱۱ رقم است.\nمثال: ۰۹۱۱۱۲۳۴۵۶۷",
      );
      return;
    }
    p.phone = normalizePhone(text);
    p.step = "note";
    pendingVipState.set(chatId, p);
    await replyVip(
      chatId,
      `📝 <b>توضیحات (اختیاری):</b>\nاگر توضیحی برای پزشک دارید بنویسید — مثلاً «درد دندان از دو روز پیش...»`,
      skipNoteKeyboard(),
    );
    return;
  }

  if (p?.mode === "booking" && p.step === "note") {
    p.note = text.slice(0, 300);
    pendingVipState.set(chatId, p);
    await replyVip(chatId, vipSummaryCard(p), confirmVipKeyboard());
    return;
  }

  // ── مراحل مشاوره (سرنخ‌گیری) ──
  if (p?.mode === "lead" && p.step === "name") {
    const name = text.replace(/\s+/g, " ").trim();
    if (name.length < 3 || name.length > 60) {
      await replyVip(chatId, "لطفاً نام و نام خانوادگی کامل را بنویسید 🙏");
      return;
    }
    p.name = name;
    p.step = "phone";
    pendingVipState.set(chatId, p);
    await replyVip(
      chatId,
      `${name} عزیز 🌸\n<b>شماره موبایل</b> خود را بفرستید تا کارشناس پذیرش با شما تماس بگیرد.`,
    );
    return;
  }

  if (p?.mode === "lead" && p.step === "phone") {
    if (!isPhone(text)) {
      await replyVip(
        chatId,
        "شماره موبایل معتبر نیست — با ۰۹ شروع می‌شود و ۱۱ رقم است.\nمثال: ۰۹۱۱۱۲۳۴۵۶۷",
      );
      return;
    }
    p.phone = normalizePhone(text);
    p.step = "topic";
    pendingVipState.set(chatId, p);
    await replyVip(chatId, "آخرین قدم! موضوع مشاوره را انتخاب کنید 👇", {
      inline_keyboard: [
        ...SPECS.map((s, i) => [{ text: `${s.emoji} ${s.name}`, callback_data: `lt:${i}` }]),
        [{ text: "💬 سوال عمومی", callback_data: "lt:-1" }],
      ],
    });
    return;
  }

  // ── حالت گفتگو با آوا ──
  if (p?.mode === "ava") {
    pendingVipState.del(chatId);
    await avaRespond(chatId, text);
    return;
  }

  // متن آزاد بدون حالت → مستقیم به منشی هوشمند (قلب پلن VIP)
  await avaRespond(chatId, text);
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
  if (data === "noop") {
    await answerCb(cbId);
    return;
  }

  if (data === "home") {
    pendingVipState.del(chatId);
    await editOrReply(chatId, messageId, vipWelcomeText(), vipMainKeyboard());
    return;
  }

  if (data === "book") {
    pendingVipState.del(chatId);
    await editOrReply(chatId, messageId, "🏥 <b>تخصص مورد نظر را انتخاب کنید:</b>", specsKeyboard());
    return;
  }

  if (data === "docs") {
    await editOrReply(chatId, messageId, vipDoctorsListText(), {
      inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
    });
    return;
  }

  if (data === "info") {
    await editOrReply(chatId, messageId, vipInfoText(), {
      inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
    });
    return;
  }

  if (data === "my") {
    const list = await userVipBookings(chatId);
    if (!list.length) {
      await editOrReply(chatId, messageId, "هنوز نوبتی ندارید — بیایید اولین نوبت را بگیریم! 🌸", {
        inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
      });
      return;
    }
    const body = list
      .map(
        (b) =>
          `🧾 <code>#${b.id}</code>\n🩺 ${VIP_DOCTORS[b.doctorIdx].name}\n🗓 ${b.dayLabel} — ساعت <b>${b.time}</b>`,
      )
      .join("\n\n");
    await editOrReply(chatId, messageId, `🔎 <b>نوبت‌های شما:</b>\n\n${body}`, {
      inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منو", "home")]],
    });
    return;
  }

  // حالت گفتگو با آوا
  if (data === "ava") {
    pendingVipState.set(chatId, { mode: "ava", step: "name" });
    await editOrReply(chatId, messageId, avaIntroText());
    return;
  }

  // مشاوره رایگان — شروع سرنخ‌گیری
  if (data === "consult") {
    pendingVipState.set(chatId, {
      mode: "lead",
      step: "name",
      leadId: Math.random().toString(36).slice(2, 6).toUpperCase(),
    });
    await editOrReply(
      chatId,
      messageId,
      `📞 <b>مشاوره رایگان ${CLINIC.name}</b>\n\nکارشناس پذیرش با شما تماس می‌گیرد و همه‌ی سوال‌هایتان را جواب می‌دهد.\n\nاول <b>نام و نام خانوادگی</b> خود را بنویسید:`,
      { inline_keyboard: [[btn("❌ انصراف", "home")]] },
    );
    return;
  }

  // موضوع مشاوره → ثبت سرنخ
  if (data.startsWith("lt:")) {
    const ti = Number(data.slice(3));
    const p = pendingVipState.get(chatId);
    if (!p || p.mode !== "lead" || !p.name || !p.phone) {
      await editOrReply(chatId, messageId, "این درخواست منقضی شده — دوباره «📞 مشاوره رایگان» را بزنید 🌸", {
        inline_keyboard: [[btn("📞 مشاوره رایگان", "consult")]],
      });
      return;
    }
    const topic = ti >= 0 && SPECS[ti] ? `${SPECS[ti].emoji} ${SPECS[ti].name}` : "💬 سوال عمومی";
    const lead: VipLead = {
      id: p.leadId ?? Math.random().toString(36).slice(2, 6).toUpperCase(),
      chatId,
      userName: p.name,
      phone: p.phone,
      topic,
      createdAt: Date.now(),
    };
    await saveVipLead(lead);
    pendingVipState.del(chatId);
    await logEvent("lead", `${lead.userName} — ${topic}`);

    await editOrReply(
      chatId,
      messageId,
      `✅ <b>درخواست مشاوره‌ی شما ثبت شد!</b>\n\n👤 ${lead.userName}\n📱 ${lead.phone}\n📌 موضوع: ${topic}\n🧾 کد: <code>#${lead.id}</code>\n\n☎️ کارشناس پذیرش در ساعات کاری (۹ تا ۲۰) با شما تماس می‌گیرد. 🌸`,
      { inline_keyboard: [[btn("🗓 رزرو نوبت", "book")], [btn("🏠 منوی اصلی", "home")]] },
    );

    if (VIP_ADMIN_CHAT_ID) {
      await replyVip(
        VIP_ADMIN_CHAT_ID,
        `🎯 <b>سرنخ جدید (ربات VIP)</b>\n\n👤 ${lead.userName} — <code>${lead.phone}</code>\n📌 موضوع: ${topic}\n🧾 کد: <code>#${lead.id}</code>\n\n☎️ همین سرنخ باید تا امروز پیگیری شود!`,
      );
    }
    return;
  }

  // انتخاب تخصص → لیست پزشکان
  if (data.startsWith("spec:")) {
    const i = Number(data.slice(5));
    if (!Number.isInteger(i) || !SPECS[i]) {
      await answerCb(cbId, "گزینه نامعتبر است");
      return;
    }
    pendingVipState.del(chatId);
    await editOrReply(
      chatId,
      messageId,
      `${SPECS[i].emoji} <b>${SPECS[i].name}</b>\n\nپزشک مورد نظر را انتخاب کنید (⭐ تخصص همان شاخه است):`,
      doctorsKeyboardForSpec(i),
    );
    return;
  }

  // انتخاب پزشک → لیست روزها
  if (data.startsWith("d:")) {
    const i = Number(data.slice(2));
    if (!Number.isInteger(i) || !VIP_DOCTORS[i]) {
      await answerCb(cbId, "گزینه نامعتبر است");
      return;
    }
    const d = VIP_DOCTORS[i];
    pendingVipState.del(chatId);
    await editOrReply(
      chatId,
      messageId,
      `✨ <b>${d.name}</b> (${d.spec})\n🗓 روزهای مطب: ${d.days}\n\nچه روزی مناسب شماست؟`,
      daysKeyboardVip(i),
    );
    return;
  }

  // انتخاب روز → لیست اسلات‌ها
  if (data.startsWith("w:")) {
    const [, di, wi] = data.split(":").map(Number);
    if (!VIP_DOCTORS[di] || !days[wi]) {
      await answerCb(cbId, "گزینه نامعتبر است");
      return;
    }
    await editOrReply(
      chatId,
      messageId,
      `🗓 <b>${days[wi].label}</b> — ${VIP_DOCTORS[di].name}\n\nساعت مورد نظر را انتخاب کنید:\n(ساعت‌های ✖ پر شده‌اند)`,
      slotsKeyboardVip(di, wi),
    );
    return;
  }

  // انتخاب ساعت → مرحله‌ی نام
  if (data.startsWith("s:")) {
    const [, di, wi, si] = data.split(":").map(Number);
    if (!VIP_DOCTORS[di] || !days[wi] || !SLOTS[si]) {
      await answerCb(cbId, "گزینه نامعتبر است");
      return;
    }
    const bookingId = Math.random().toString(36).slice(2, 6).toUpperCase();
    pendingVipState.set(chatId, {
      mode: "booking",
      step: "name",
      doctorIdx: di,
      specIdx: VIP_DOCTORS[di].specIdx,
      dayIso: days[wi].iso,
      dayLabel: days[wi].label,
      time: SLOTS[si],
      bookingId,
    });
    await editOrReply(
      chatId,
      messageId,
      `عالی! ✨\n🩺 ${VIP_DOCTORS[di].name} — 🗓 ${days[wi].label} — 🕐 <b>${SLOTS[si]}</b>\n\nحالا <b>نام و نام خانوادگی</b> خود را بنویسید:`,
      { inline_keyboard: [[btn("❌ انصراف", "home")]] },
    );
    return;
  }

  // رد کردن توضیحات
  if (data === "skipnote") {
    const p = pendingVipState.get(chatId);
    if (!p || p.mode !== "booking") {
      await editOrReply(chatId, messageId, "این درخواست منقضی شده — دوباره شروع کنیم 🌸", {
        inline_keyboard: [[btn("🗓 رزرو نوبت", "book")]],
      });
      return;
    }
    p.note = undefined;
    pendingVipState.set(chatId, p);
    await editOrReply(chatId, messageId, vipSummaryCard(p), confirmVipKeyboard());
    return;
  }

  // تأیید نهایی نوبت VIP
  if (data === "vb:confirm") {
    const p = pendingVipState.get(chatId);
    if (!p || p.mode !== "booking" || !p.name || !p.phone) {
      await editOrReply(chatId, messageId, "این درخواست منقضی شده — بیایید از نو شروع کنیم 🌸", {
        inline_keyboard: [[btn("🗓 رزرو نوبت", "book")]],
      });
      return;
    }
    const booking: VipBooking = {
      id: p.bookingId ?? Math.random().toString(36).slice(2, 6).toUpperCase(),
      chatId,
      userName: p.name,
      phone: p.phone,
      note: p.note,
      specIdx: p.specIdx ?? VIP_DOCTORS[p.doctorIdx ?? 0].specIdx,
      doctorIdx: p.doctorIdx ?? 0,
      dayIso: p.dayIso ?? workingDays()[0].iso,
      dayLabel: p.dayLabel ?? "",
      time: p.time ?? SLOTS[0],
      createdAt: Date.now(),
    };
    await saveVipBooking(booking);
    pendingVipState.del(chatId);
    await logEvent("booking", `${booking.userName} — ${SPECS[booking.specIdx]?.name}`);

    await editOrReply(chatId, messageId, vipBookingConfirmedText(booking), {
      inline_keyboard: [[btn("🔎 نوبت‌های من", "my")], [btn("🏠 منوی اصلی", "home")]],
    });

    if (VIP_ADMIN_CHAT_ID) {
      await replyVip(VIP_ADMIN_CHAT_ID, vipAdminNotification(booking));
    }
    return;
  }

  if (data === "vb:cancel") {
    pendingVipState.del(chatId);
    await editOrReply(
      chatId,
      messageId,
      "باشه، نوبت ثبت نشد 🙏\nهر وقت خواستید در خدمتم!",
      vipMainKeyboard(),
    );
    return;
  }

  // پاسخ به یادآوری ۲۴ ساعته
  if (data.startsWith("rem:")) {
    const [, id, act] = data.split(":");
    if (act === "ok") {
      await logEvent("confirm", `#${id}`);
      await editOrReply(
        chatId,
        messageId,
        `عالی! 🙌 نوبت شما تأیید شد.\n📍 ${CLINIC.address}\n۱۵ دقیقه قبل حاضر باشید — ما منتظرتان هستیم 🌸`,
      );
      if (VIP_ADMIN_CHAT_ID)
        await replyVip(VIP_ADMIN_CHAT_ID, `✅ بیمار «نوبت VIP #${id}» را تأیید کرد.`);
      return;
    }
    if (act === "chg") {
      await editOrReply(
        chatId,
        messageId,
        `💬 مشکلی نیست! برای جابجایی نوبت، پذیرش را خبر کنید:\n☎️ <code>${CLINIC.phone}</code>\n\nیا همین حالا یک نوبت جدید بگیرید:`,
        { inline_keyboard: [[btn("🗓 رزرو نوبت جدید", "book")], [btn("🏠 منو", "home")]] },
      );
      if (VIP_ADMIN_CHAT_ID)
        await replyVip(VIP_ADMIN_CHAT_ID, `🔁 بیمار «نوبت VIP #${id}» درخواست جابجایی دارد.`);
      return;
    }
  }

  await answerCb(cbId);
}

// ─── POST: آپدیت‌های تلگرام ───
export async function POST(req: NextRequest) {
  if (req.headers.get("x-telegram-bot-api-secret-token") !== VIP_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  type Update = {
    message?: {
      chat?: { id?: number };
      from?: { first_name?: string };
      text?: string;
      voice?: { file_id?: string; duration?: number };
      audio?: { file_id?: string; duration?: number };
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
      if (!chatId) return Response.json({ ok: true });
      // وویس یا فایل صوتی → مسیر شنیدن
      if (msg.voice?.file_id || msg.audio?.file_id) {
        await handleVoice(
          chatId,
          (msg.voice?.file_id || msg.audio?.file_id) as string,
          ((msg.voice?.duration ?? msg.audio?.duration ?? 0) as number) || 0,
        );
        return Response.json({ ok: true });
      }
      const text = (msg.text || "").trim();
      if (text) {
        await handleText(chatId, text, msg.from?.first_name);
      }
    }
  } catch {
    // هرگز خطا به تلگرام برنگردد — retry بی‌مورد ایجاد نمی‌شود
  }

  return Response.json({ ok: true });
}

// ─── GET: بررسی سلامت ───
export async function GET() {
  return Response.json({
    ok: true,
    bot: "vip-receptionist",
    clinic: CLINIC.name,
    specs: SPECS.length,
    doctors: VIP_DOCTORS.length,
    slots: SLOTS.length,
    tokenConfigured: Boolean(VIP_TOKEN),
    adminConfigured: Boolean(VIP_ADMIN_CHAT_ID),
    directorConfigured: Boolean(DIRECTOR_CHAT_ID),
    storage: storageMode(),
    ai: aiAvailable(),
    aiModel: ZAI_MODEL,
    voiceAsr:
      Boolean(process.env.ELEVENLABS_API_KEY) ||
      Boolean(process.env.VOICE_ASR_URL) ||
      aiAvailable(),
    elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
    hint: "POST telegram updates here",
  });
}
