// ─── گزارش روزانه برای رئیس درمانگاه (فراخوانی توسط Vercel Cron — هر شب) ───
// گزارش به DIRECTOR_CHAT_ID (یا fallback: VIP_ADMIN_CHAT_ID) ارسال می‌شود.
// تنظیمات Vercel:
//   DIRECTOR_CHAT_ID → چت‌آی‌دی رئیس (با /id در ربات VIP می‌گیرد)
//   CRON_SECRET      → اختیاری؛ اگر تنظیم باشد فقط فراخوانی Vercel مجاز است
import { DIRECTOR_CHAT_ID, VIP_ADMIN_CHAT_ID, replyVip } from "@/lib/vip-bot";
import { buildReport, reportText } from "@/lib/reports";
import { logEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function runDailyReport(): Promise<Response> {
  const target = DIRECTOR_CHAT_ID || VIP_ADMIN_CHAT_ID;
  if (!target) {
    return Response.json({
      ok: false,
      error: "DIRECTOR_CHAT_ID تنظیم نشده — چت‌آی‌دی رئیس را با /id بگیرید و در Vercel ست کنید",
    });
  }
  const report = await buildReport();
  await replyVip(target, reportText(report));
  await logEvent("report");
  return Response.json({
    ok: true,
    sentTo: target,
    storage: report.storage,
    ai: report.ai,
    totals: report.totals,
  });
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }
  return runDailyReport();
}

export async function POST(req: Request) {
  return GET(req);
}
