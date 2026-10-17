// ─── یادآوری خودکار ۲۴ ساعته (فراخوانی توسط Vercel Cron — روزانه) ───
// نوبت‌هایی که فردا (به وقت تهران) هستند، پیام یادآوری می‌گیرند — عین سناریوی دموها.
// نوبت‌های پلن ۲ با ربات کلینیک و نوبت‌های VIP با ربات VIP پیام می‌گیرند.
// برای کارکرد ماندگار، متغیرهای Upstash را تنظیم کنید؛ در حالت memory فقط تا ری‌استارت بعدی معتبر است.
import {
  ADMIN_CHAT_ID,
  allBookings,
  reminderKeyboard,
  reminderText,
  reply,
  tehranIso,
  updateBooking,
} from "@/lib/clinic-bot";
import {
  VIP_ADMIN_CHAT_ID,
  allVipBookings,
  replyVip,
  updateVipBooking,
  vipReminderKeyboard,
  vipReminderText,
} from "@/lib/vip-bot";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function runReminders(): Promise<Response> {
  const tomorrow = tehranIso(1);
  const [bookings, vipBookings] = await Promise.all([allBookings(), allVipBookings()]);
  let sent = 0;
  let sentVip = 0;

  for (const b of bookings) {
    if (b.dayIso !== tomorrow || b.reminded24) continue;
    await reply(b.chatId, reminderText(b), reminderKeyboard(b));
    b.reminded24 = true;
    await updateBooking(b);
    sent++;
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
    if (VIP_ADMIN_CHAT_ID) {
      await replyVip(
        VIP_ADMIN_CHAT_ID,
        `🔔 یادآوری ۲۴ساعته VIP برای «نوبت #${b.id}» (${b.userName}) ارسال شد.`,
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
