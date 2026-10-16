// ─── کد QR لینک ربات کلینیک (SVG برداری — بدون CDN خارجی) ───
// استفاده در دموی plan2:  <img src="/api/telegram/qr">
import { CLINIC_TOKEN } from "@/lib/clinic-bot";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

let cached: { at: number; svg: string } | null = null;

export async function GET() {
  if (!CLINIC_TOKEN) {
    return new Response("ربات هنوز تنظیم نشده است", { status: 503 });
  }

  if (cached && Date.now() - cached.at < 300_000) {
    return new Response(cached.svg, {
      headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" },
    });
  }

  let username = "";
  try {
    const res = await fetch(`https://api.telegram.org/bot${CLINIC_TOKEN}/getMe`);
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

  cached = { at: Date.now(), svg };
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" },
  });
}
