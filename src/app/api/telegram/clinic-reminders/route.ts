// ─── یادآوری خودکار ۲۴ ساعته (فراخوانی توسط Vercel Cron — روزانه) ───
// نوبت‌هایی که فردا (به وقت تهران) هستند، پیام یادآوری می‌گیرند — عین سناریوی دموی plan2.
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

export const dynamic = "force-dynamic";

async function runReminders(): Promise<Response> {
  const tomorrow = tehranIso(1);
  const bookings = await allBookings();
  let sent = 0;

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

  return Response.json({
    ok: true,
    tomorrow,
    storage: process.env.UPSTASH_REDIS_REST_URL ? "redis" : "memory",
    candidates: bookings.filter((b) => b.dayIso === tomorrow && !b.reminded24).length,
    sent,
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
