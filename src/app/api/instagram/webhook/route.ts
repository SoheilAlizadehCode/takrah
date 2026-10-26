// ─── وبهوک رسمی متا برای آوای اینستاگرام ───
// GET  → تأیید وبهوک (hub.challenge) با INSTAGRAM_VERIFY_TOKEN
// POST → رویدادهای دایرکت (messages) و کامنت‌ها (comments)
// Callback URL در داشبورد متا: https://takrah.top/api/instagram/webhook
import crypto from "crypto";
import { NextRequest } from "next/server";
import {
  IG_APP_SECRET,
  IG_VERIFY_TOKEN,
  handleIgComment,
  handleIgMessage,
  type IgCommentValue,
  type IgMessaging,
} from "@/lib/instagram-bot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** تأیید وبهوک توسط متا */
export async function GET(req: NextRequest): Promise<Response> {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode") ?? "";
  const token = sp.get("hub.verify_token") ?? "";
  const challenge = sp.get("hub.challenge") ?? "";
  if (!IG_VERIFY_TOKEN) {
    return new Response("INSTAGRAM_VERIFY_TOKEN تنظیم نشده", { status: 500 });
  }
  if (mode === "subscribe" && token === IG_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  }
  return new Response("forbidden", { status: 403 });
}

interface IgWebhookBody {
  object?: string;
  entry?: {
    id?: string;
    time?: number;
    messaging?: IgMessaging[];
    changes?: { field?: string; value?: IgCommentValue }[];
  }[];
}

/** صحت امضای متا (X-Hub-Signature-256) */
function verifySignature(raw: string, header: string | null): boolean {
  if (!IG_APP_SECRET) return true; // بدون سکرت — فقط برای راه‌اندازی اولیه
  if (!header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", IG_APP_SECRET).update(raw, "utf8").digest("hex");
  const got = header.slice(7);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(got, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest): Promise<Response> {
  const raw = await req.text();
  // متا همیشه ۲۰۰ می‌خواهد؛ خطاها را می‌بلعیم تا ریترای بی‌پایان نشود
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return Response.json({ ok: false, error: "bad signature" }, { status: 401 });
  }
  let parsed: IgWebhookBody | null = null;
  try {
    parsed = JSON.parse(raw) as IgWebhookBody;
  } catch {
    return Response.json({ ok: true, note: "bad json ignored" });
  }
  if (!parsed || parsed.object !== "instagram" || !parsed.entry?.length) {
    return Response.json({ ok: true });
  }

  const jobs: Promise<void>[] = [];
  for (const entry of parsed.entry) {
    const igId = entry.id ?? "";
    for (const m of entry.messaging ?? []) {
      jobs.push(handleIgMessage(igId, m).catch(() => undefined));
    }
    for (const ch of entry.changes ?? []) {
      if (ch.field === "comments" && ch.value) {
        jobs.push(handleIgComment(igId, ch.value).catch(() => undefined));
      }
    }
  }
  await Promise.all(jobs);
  return Response.json({ ok: true });
}
