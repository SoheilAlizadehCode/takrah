// ─── سرو وویس خلاصه‌ی بیمار — فقط با لینک امضاشده ───
// الگوی همان /api/instagram/audio: محتوا در Redis (TTL ۷ روز)، سرو mp3 با امضا
import { verifyIntakeAudio } from "@/lib/tenants";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const p = new URL(req.url).searchParams;
  const s = (p.get("s") ?? "").toLowerCase();
  const id = (p.get("id") ?? "").toLowerCase();
  const k = (p.get("k") ?? "").toLowerCase();
  if (!s || !id || !k) return new Response("bad key", { status: 400 });
  const buf = await verifyIntakeAudio(s, id, k);
  if (!buf || !buf.length) return new Response("expired", { status: 404 });
  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "content-type": "audio/mpeg",
      "content-length": String(buf.length),
      "cache-control": "public, max-age=3600",
    },
  });
}
