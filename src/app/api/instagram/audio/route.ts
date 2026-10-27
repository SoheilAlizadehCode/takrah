// ─── سرو وویس تولیدشده برای دایرکت اینستاگرام ───
// آوا جواب را با TTS تبدیل به mp3 می‌کند، در Redis ذخیره می‌شود (TTL ۱ ساعت) و
// این مسیر لینک عمومی آن را به گراف متا می‌دهد: /api/instagram/audio?k=<key>
import { kvGet } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const k = (url.searchParams.get("k") ?? "").replace(/[^a-f0-9]/gi, "").slice(0, 32);
  if (!k) return new Response("bad key", { status: 400 });
  const b64 = await kvGet(`ig:aud:${k}`);
  if (!b64) return new Response("expired", { status: 404 });
  const buf = Buffer.from(b64, "base64");
  if (!buf.length) return new Response("empty", { status: 404 });
  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "content-type": "audio/mpeg",
      "content-length": String(buf.length),
      "cache-control": "public, max-age=3600",
    },
  });
}
