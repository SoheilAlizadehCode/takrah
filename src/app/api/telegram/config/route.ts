// ─── وضعیت عمومی ربات کلینیک (برای دموی plan2) ───
// دموی takrah.top/demos/plan2.html این‌جا را صدا می‌زند:
// اگر ربات تنظیم شده باشد، نام کاربری‌اش برمی‌گردد تا دکمه و QR زنده شود.
import { CLINIC_TOKEN, SITE_URL } from "@/lib/clinic-bot";

export const dynamic = "force-dynamic";

let cache: { at: number; username: string | null } | null = null;

export async function GET() {
  // کش ۶۰ ثانیه‌ای تا getMe در هر بازدید صدا زده نشود
  if (cache && Date.now() - cache.at < 60_000) {
    return Response.json(
      { configured: Boolean(cache.username), botUsername: cache.username, site: SITE_URL },
      { headers: { "cache-control": "public, max-age=60" } },
    );
  }

  let username: string | null = null;
  if (CLINIC_TOKEN) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${CLINIC_TOKEN}/getMe`, {
        next: { revalidate: 0 },
      });
      const j = (await res.json().catch(() => null)) as {
        ok?: boolean;
        result?: { username?: string };
      } | null;
      if (j?.ok && j.result?.username) username = j.result.username;
    } catch {
      username = null;
    }
  }

  cache = { at: Date.now(), username };
  return Response.json(
    { configured: Boolean(username), botUsername: username, site: SITE_URL },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}
