// ─── ثبت خودکار وبهوک تلگرام ───
// کافیست در مرورگر باز کنید:
//   https://takrah.top/api/telegram/setup?key=<CLINIC_WEBHOOK_SECRET>
// ربات کلینیک ثبت می‌شود. با &bot=all ربات رشد بلاگ + ربات VIP هم ثبت می‌شوند.
// فقط VIP:  ?key=<SECRET>&bot=vip
import { NextRequest } from "next/server";
import { CLINIC_SECRET, CLINIC_TOKEN, SITE_URL } from "@/lib/clinic-bot";
import { VIP_SECRET, VIP_TOKEN } from "@/lib/vip-bot";

export const dynamic = "force-dynamic";

const GROWTH_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const GROWTH_SECRET =
  process.env.TELEGRAM_WEBHOOK_SECRET ?? "tk9f4e2c1a7b35d8e0f6a4c2b9d17e35";

async function setWebhook(
  token: string,
  url: string,
  secret: string,
): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        secret_token: secret,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: false,
      }),
    });
    const j = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    return { url, ok: Boolean(j?.ok), description: j?.description ?? "no-response" };
  } catch (e) {
    return { url, ok: false, description: e instanceof Error ? e.message : "error" };
  }
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const bot = req.nextUrl.searchParams.get("bot") ?? "clinic";

  // کلید باید با secret ربات کلینیک (یا متغیر SETUP_KEY) بخواند
  const setupKey = process.env.SETUP_KEY ?? CLINIC_SECRET;
  if (!key || key !== setupKey) {
    return Response.json({ ok: false, error: "کلید نامعتبر است — ?key= را بررسی کنید" }, { status: 403 });
  }

  const results: Record<string, unknown>[] = [];

  if (bot === "clinic" || bot === "all") {
    if (!CLINIC_TOKEN) {
      results.push({
        bot: "clinic",
        ok: false,
        description:
          "متغیر CLINIC_BOT_TOKEN در Vercel تنظیم نشده — اول توکن BotFather را در Environment Variables اضافه کنید و redeploy بگیرید",
      });
    } else {
      results.push({
        bot: "clinic",
        ...(await setWebhook(
          CLINIC_TOKEN,
          `${SITE_URL}/api/telegram/clinic`,
          CLINIC_SECRET,
        )),
      });
    }
  }

  if (bot === "all" && GROWTH_TOKEN) {
    results.push({
      bot: "growth-blog",
      ...(await setWebhook(GROWTH_TOKEN, `${SITE_URL}/api/telegram-bot`, GROWTH_SECRET)),
    });
  }

  if (bot === "vip" || bot === "all") {
    if (!VIP_TOKEN) {
      results.push({
        bot: "vip",
        ok: false,
        description:
          "متغیر VIP_BOT_TOKEN در Vercel تنظیم نشده — اول توکن BotFather را در Environment Variables اضافه کنید و redeploy بگیرید",
      });
    } else {
      results.push({
        bot: "vip",
        ...(await setWebhook(VIP_TOKEN, `${SITE_URL}/api/telegram/vip`, VIP_SECRET)),
      });
    }
  }

  return Response.json({ ok: results.some((r) => r.ok), site: SITE_URL, results });
}
