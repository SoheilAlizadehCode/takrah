// ─── کد QR صفحه‌ی هر کلینیک — SVG برداری، بدون CDN خارجی ───
// استفاده: <img src="/api/tenants/qr?slug=salamat">
import QRCode from "qrcode";
import { SITE_URL } from "@/lib/clinic-bot";
import { slugValid } from "@/lib/tenants";

export const dynamic = "force-dynamic";

const cached = new Map<string, { at: number; svg: string }>();

export async function GET(req: Request): Promise<Response> {
  const slug = (new URL(req.url).searchParams.get("slug") ?? "").toLowerCase();
  if (!slugValid(slug)) return new Response("bad slug", { status: 400 });

  const hit = cached.get(slug);
  if (hit && Date.now() - hit.at < 600_000) {
    return new Response(hit.svg, {
      headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=600" },
    });
  }

  const svg = await QRCode.toString(`${SITE_URL}/c/${slug}`, {
    type: "svg",
    margin: 1,
    width: 240,
    color: { dark: "#16324a", light: "#ffffff" },
  });
  cached.set(slug, { at: Date.now(), svg });
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=600" },
  });
}
