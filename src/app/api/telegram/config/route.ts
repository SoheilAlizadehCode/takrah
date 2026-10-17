// ─── وضعیت عمومی ربات‌ها (برای دموهای plan2 و plan3) ───
// دموی takrah.top/demos/plan2.html  →  /api/telegram/config           (ربات کلینیک)
// دموی takrah.top/demos/plan3.html  →  /api/telegram/config?bot=vip   (ربات VIP)
// اگر ربات تنظیم شده باشد، نام کاربری‌اش برمی‌گردد تا دکمه و QR زنده شود.
import { CLINIC_TOKEN, SITE_URL } from "@/lib/clinic-bot";
import { VIP_TOKEN } from "@/lib/vip-bot";

export const dynamic = "force-dynamic";

type CacheEntry = { at: number; username: string | null };
const cache = new Map<string, CacheEntry>();

async function botUsername(token: string): Promise<string | null> {
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      next: { revalidate: 0 },
    });
    const j = (await res.json().catch(() => null)) as {
      ok?: boolean;
      result?: { username?: string };
    } | null;
    return j?.ok && j.result?.username ? j.result.username : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const bot = new URL(req.url).searchParams.get("bot") ?? "clinic";
  const token = bot === "vip" ? VIP_TOKEN : CLINIC_TOKEN;

  // کش ۶۰ ثانیه‌ای تا getMe در هر بازدید صدا زده نشود
  const hit = cache.get(bot);
  if (hit && Date.now() - hit.at < 60_000) {
    return Response.json(
      {
        bot,
        configured: Boolean(hit.username),
        botUsername: hit.username,
        site: SITE_URL,
      },
      { headers: { "cache-control": "public, max-age=60" } },
    );
  }

  const username = await botUsername(token);
  cache.set(bot, { at: Date.now(), username });

  return Response.json(
    { bot, configured: Boolean(username), botUsername: username, site: SITE_URL },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}
