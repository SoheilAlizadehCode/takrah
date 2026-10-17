// ─── کد QR لینک ربات‌ها (SVG برداری — بدون CDN خارجی) ───
// استفاده در دموی plan2:  <img src="/api/telegram/qr">
// استفاده در دموی plan3:  <img src="/api/telegram/qr?bot=vip">
import { CLINIC_TOKEN } from "@/lib/clinic-bot";
import { VIP_TOKEN } from "@/lib/vip-bot";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

const cached = new Map<string, { at: number; svg: string }>();

export async function GET(req: Request) {
  const bot = new URL(req.url).searchParams.get("bot") ?? "clinic";
  const token = bot === "vip" ? VIP_TOKEN : CLINIC_TOKEN;

  if (!token) {
    return new Response("ربات هنوز تنظیم نشده است", { status: 503 });
  }

  const hit = cached.get(bot);
  if (hit && Date.now() - hit.at < 300_000) {
    return new Response(hit.svg, {
      headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" },
    });
  }

  let username = "";
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const j = (await res.json().catch(() => null)) as {
      ok?: boolean;
      result?: { username?: string };
    } | null;
    username = j?.result?.username ?? "";
  } catch {
    username = "";
  }
  if (!username) return new Response("ربات در دسترس نیست", { status: 503 });

  const svg = await QRCode.toString(`https://t.me/${username}?start=book`, {
    type: "svg",
    margin: 1,
    width: 320,
    errorCorrectionLevel: "M",
    color: { dark: "#16324aff", light: "#ffffffff" },
  });

  cached.set(bot, { at: Date.now(), svg });
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" },
  });
}
