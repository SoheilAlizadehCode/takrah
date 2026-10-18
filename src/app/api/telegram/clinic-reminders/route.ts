// ─── یادآوری خودکار ۲۴ ساعته (فراخوانی توسط Vercel Cron — روزانه) ───
// نوبت‌هایی که فردا (به وقت تهران) هستند:
//   1) پیام یادآوری تلگرامی با متن ثابت
//   2) اگر REMINDER_VOICE_URL تنظیم باشد → پیام وویس صوتی (فایل ضبط‌شده)
//   3) اگر KAVENEGAR_API_KEY تنظیم باشد → «تماس تلفنی واقعی» با TTS فارسی کاوه‌نگار
// نوبت‌های پلن ۲ با ربات کلینیک و نوبت‌های VIP با ربات VIP پیام می‌گیرند.
// برای کارکرد ماندگار، متغیرهای Upstash را تنظیم کنید؛ در حالت memory فقط تا ری‌استارت بعدی معتبر است.
import {
  ADMIN_CHAT_ID,
  CLINIC_TOKEN,
  DOCTORS,
  allBookings,
  reminderKeyboard,
  reminderText,
  reply,
  tehranIso,
  updateBooking,
  type Booking,
} from "@/lib/clinic-bot";
import {
  VIP_ADMIN_CHAT_ID,
  VIP_TOKEN,
  allVipBookings,
  reminderCallText,
  replyVip,
  updateVipBooking,
  vipReminderKeyboard,
  vipReminderText,
} from "@/lib/vip-bot";
import { logEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── تماس صوتی با بیمار — کاوه‌نگار (TTS فارسی سمت سرویس) ───
// ثبت‌نام در kavenegar.com → کلید API → متغیر KAVENEGAR_API_KEY (اختیاری: KAVENEGAR_CALLER)
async function phoneCall(phone: string, message: string): Promise<boolean> {
  const key = process.env.KAVENEGAR_API_KEY ?? "";
  if (!key) return false;
  const receptor = phone.startsWith("0") ? `98${phone.slice(1)}` : phone;
  const caller = process.env.KAVENEGAR_CALLER ?? "";
  const url =
    `https://api.kavenegar.com/v1/${key}/call/maketts.json` +
    `?receptor=${encodeURIComponent(receptor)}` +
    `&message=${encodeURIComponent(message.slice(0, 300))}` +
    (caller ? `&caller=${encodeURIComponent(caller)}` : "");
  try {
    const res = await fetch(url, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/** ارسال وویس با ربات‌ها — لینک عمومی فایل صوتی در REMINDER_VOICE_URL */
async function sendVoiceNote(chatId: number, voiceUrl: string): Promise<boolean> {
  for (const token of [VIP_TOKEN, CLINIC_TOKEN]) {
    if (!token) continue;
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendVoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, voice: voiceUrl }),
      });
      if (res.ok) return true;
    } catch {
      /* ربات بعدی */
    }
  }
  return false;
}

/** متن ثابت تماس برای نوبت‌های پلن ۲ */
function plan2CallText(b: Booking): string {
  return (
    `سلام، از کلینیک سلامت. یادآوری نوبت. ` +
    `${b.dayLabel}، ساعت ${b.time}، ${DOCTORS[b.doctorIdx]?.name ?? ""}. ` +
    `لطفا پانزده دقیقه قبل حاضر باشید. تا شنیدن دوباره.`
  );
}

async function runReminders(): Promise<Response> {
  const tomorrow = tehranIso(1);
  const [bookings, vipBookings] = await Promise.all([allBookings(), allVipBookings()]);
  let sent = 0;
  let sentVip = 0;
  let calls = 0;
  let voices = 0;

  const reminderVoiceUrl = process.env.REMINDER_VOICE_URL ?? "";
  const kavenegarReady = Boolean(process.env.KAVENEGAR_API_KEY);

  for (const b of bookings) {
    if (b.dayIso !== tomorrow || b.reminded24) continue;
    await reply(b.chatId, reminderText(b), reminderKeyboard(b));
    b.reminded24 = true;
    await updateBooking(b);
    sent++;
    await logEvent("reminder", `plan2 #${b.id}`);

    if (reminderVoiceUrl) {
      const ok = await sendVoiceNote(b.chatId, reminderVoiceUrl);
      if (ok) voices++;
    }
    if (kavenegarReady) {
      const ok = await phoneCall(b.phone, plan2CallText(b));
      await logEvent("call", `${ok ? "ok" : "fail"} plan2 #${b.id} → ${b.phone}`);
      if (ok) calls++;
    }
    if (ADMIN_CHAT_ID) {
      await reply(ADMIN_CHAT_ID, `🔔 یادآوری ۲۴ساعته برای «نوبت #${b.id}» (${b.userName}) ارسال شد.`);
    }
  }

  for (const b of vipBookings) {
    if (b.dayIso !== tomorrow || b.reminded24) continue;
    await replyVip(b.chatId, vipReminderText(b), vipReminderKeyboard(b));
    b.reminded24 = true;
    await updateVipBooking(b);
    sentVip++;
    await logEvent("reminder", `vip #${b.id}`);

    if (reminderVoiceUrl) {
      const ok = await sendVoiceNote(b.chatId, reminderVoiceUrl);
      if (ok) voices++;
    }
    if (kavenegarReady) {
      const ok = await phoneCall(b.phone, reminderCallText(b));
      await logEvent("call", `${ok ? "ok" : "fail"} vip #${b.id} → ${b.phone}`);
      if (ok) calls++;
    }
    if (VIP_ADMIN_CHAT_ID) {
      await replyVip(
        VIP_ADMIN_CHAT_ID,
        `🔔 یادآوری ۲۴ساعته VIP برای «نوبت #${b.id}» (${b.userName}) ارسال شد.` +
          (kavenegarReady ? `\n📞 تماس تلفنی یادآوری هم انجام شد.` : ""),
      );
    }
  }

  return Response.json({
    ok: true,
    tomorrow,
    storage: process.env.UPSTASH_REDIS_REST_URL ? "redis" : "memory",
    candidates: bookings.filter((b) => b.dayIso === tomorrow && !b.reminded24).length,
    sent,
    candidatesVip: vipBookings.filter((b) => b.dayIso === tomorrow && !b.reminded24).length,
    sentVip,
    calls,
    voices,
    integrations: {
      phoneCall: kavenegarReady,
      voiceMessage: Boolean(reminderVoiceUrl),
    },
  });
}

export async function GET(req: Request) {
  // اگر CRON_SECRET تنظیم شده باشد، فقط فراخوانی Vercel Cron مجاز است
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }
  return runReminders();
}

export async function POST(req: Request) {
  return GET(req);
}
