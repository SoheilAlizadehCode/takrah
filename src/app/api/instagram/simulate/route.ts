// ─── شبیه‌ساز آوای اینستاگرام — تست کامل زنجیره‌ی AI بدون اکانت متا ───
// همان مسیری که وبهوک واقعی می‌رود، فقط بدون ارسال به اینستاگرام:
// POST /api/instagram/simulate?key=<VIP_WEBHOOK_SECRET یا CLINIC_WEBHOOK_SECRET>
// Body: { "text": "سوال متنی" } یا { "voice_base64": "...", "ext": "ogg" } یا { "comment_text": "قیمت چنده؟" }
import { NextRequest } from "next/server";
import { CLINIC_SECRET } from "@/lib/clinic-bot";
import { VIP_SECRET } from "@/lib/vip-bot";
import {
  IG_COMMENT_KEYWORDS,
  igLLM,
  igTtsUrl,
  type IgCommentValue,
} from "@/lib/instagram-bot";
import { kvSet } from "@/lib/kv";
import { whisperTranscribe } from "@/lib/voice";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function auth(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  return (Boolean(VIP_SECRET) && key === VIP_SECRET) || (Boolean(CLINIC_SECRET) && key === CLINIC_SECRET);
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!auth(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | { text?: string; voice_base64?: string; ext?: string; comment_text?: string; sender?: string }
    | null;
  if (!body) return Response.json({ ok: false, error: "بدنه نامعتبر" }, { status: 400 });

  const sender = (body.sender ?? "sim-user").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "sim-user";

  // حالت کامنت — شبیه‌سازی جریان کامنت→دایرکت (فقط جواب هوشمند، بدون ارسال)
  if (body.comment_text) {
    const text = body.comment_text.trim();
    const hit = IG_COMMENT_KEYWORDS.some((k) => text.toLowerCase().includes(k.toLowerCase()));
    if (!hit) {
      return Response.json({
        ok: true,
        mode: "comment",
        keywordHit: false,
        note: "کلمه‌کلیدی در کامنت نبود؛ در حالت واقعی هیچ دایرکتی نمی‌رود",
      });
    }
    const v: IgCommentValue = { id: "sim-cmt", text, from: { id: sender, username: "sim" } };
    const answer =
      (await igLLM(
        `cmt:${sender}`,
        `یک کاربر روی پست اینستاگرام این کامنت را گذاشته: «${text}». یک پیام خصوصی خیلی کوتاه و دوستانه بنویس که دقیقاً جواب همین کامنت باشد و او را به ادامه‌ی گفتگو در همین دایرکت دعوت کند. با سلام شروع کن.`,
      )) ?? null;
    const sp = answer ? await igTtsUrl(answer) : null;
    return Response.json({
      ok: true,
      mode: "comment",
      keywordHit: true,
      keywords: IG_COMMENT_KEYWORDS,
      dmText: answer,
      voiceBytes: sp?.bytes ?? null,
      note: "در حالت واقعی: پاسخ عمومی زیر کامنت + همین پیام در دایرکت",
    });
  }

  // حالت دایرکت — متن یا ویس
  let question = (body.text ?? "").trim();
  let asrText: string | null = null;
  if (!question && body.voice_base64) {
    const buf = Buffer.from(body.voice_base64, "base64");
    const ext = (body.ext ?? "ogg").replace(/[^a-z0-9]/gi, "");
    const mimes: Record<string, string> = {
      ogg: "audio/ogg", mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", wav: "audio/wav",
    };
    asrText = await whisperTranscribe(buf, `voice.${ext}`, mimes[ext] ?? "audio/ogg");
    question = (asrText ?? "").trim();
  }
  if (!question) {
    return Response.json({ ok: false, error: "text یا voice_base64 یا comment_text بده" }, { status: 400 });
  }

  const reply = await igLLM(`sim:${sender}`, question);
  const sp = reply ? await igTtsUrl(reply) : null;
  return Response.json({
    ok: true,
    mode: body.voice_base64 ? "voice" : "text",
    asrText,
    question,
    reply,
    voiceBytes: sp?.bytes ?? null,
    note: "شبیه‌ساز: ارسال واقعی به اینستاگرام انجام نمی‌شود",
  });
}

/** پاک‌کردن حافظه‌ی شبیه‌ساز — برای تست تمیز: DELETE ?key=... */
export async function DELETE(req: NextRequest): Promise<Response> {
  if (!auth(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  await kvSet("ig:hist:sim:sim-user", "[]");
  return Response.json({ ok: true, cleared: true });
}
