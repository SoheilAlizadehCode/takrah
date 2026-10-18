// ─── عیب‌یابی زنده‌ی هوش مصنوعی و وویس (مخصوص مدیر) ───
// GET  /api/telegram/ai-diag?key=<VIP_WEBHOOK_SECRET>  → تست واقعی LLM زدات + وضعیت دقیق
// POST /api/telegram/ai-diag?key=<VIP_WEBHOOK_SECRET>  → تست ASR با {"file_base64": "..."}
// کلید هرگز در پاسخ برنمی‌گردد؛ فقط طول آن نمایش داده می‌شود.
import { NextRequest } from "next/server";
import { ZAI_BASE, ZAI_KEY, ZAI_MODEL } from "@/lib/ai";
import { VIP_SECRET } from "@/lib/vip-bot";
import { CLINIC_SECRET } from "@/lib/clinic-bot";
import { getEvents, kvGet, safeParse } from "@/lib/kv";
import { TTS_VOICE, ttsSpeak, whisperTranscribe } from "@/lib/voice";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function auth(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  return (Boolean(VIP_SECRET) && key === VIP_SECRET) || (Boolean(CLINIC_SECRET) && key === CLINIC_SECRET);
}

/** تست LLM — همان پارامترهای avaLLM (با ?model= قابل تغییر برای تست مدل‌های رایگان) */
export async function GET(req: NextRequest) {
  if (!auth(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (req.nextUrl.searchParams.get("last")) {
    // مشاهده‌ی آخرین خطاها/نتیجه‌های واقعی ربات — برای عیب‌یابی پس از هر تست
    const [llm, voice, tts, events] = await Promise.all([
      kvGet("dbg:llm"),
      kvGet("dbg:voice"),
      kvGet("dbg:tts"),
      getEvents(),
    ]);
    return Response.json({
      ok: true,
      dbg: {
        llm: llm ? safeParse(llm, null) : null,
        voice: voice ? safeParse(voice, null) : null,
        tts: tts ? safeParse(tts, null) : null,
        recentEvents: events.slice(-20).reverse(),
      },
    });
  }
  if (req.nextUrl.searchParams.get("tts")) {
    // تست گوینده‌ی آوا (اج → گوگل) — بایت‌های mp3 باید > 0 باشد
    const t0 = Date.now();
    const sp = await ttsSpeak("سلام، من آوا هستم؛ صدای من وصل است.");
    return Response.json({
      ok: Boolean(sp),
      engine: sp?.engine ?? null,
      bytes: sp?.buf.length ?? 0,
      ms: Date.now() - t0,
      voice: TTS_VOICE,
    });
  }
  const model = req.nextUrl.searchParams.get("model") || ZAI_MODEL;
  const t0 = Date.now();
  let status = 0;
  let ok = false;
  let snippet = "";
  try {
    const res = await fetch(`${ZAI_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ZAI_KEY}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "سلام! فقط بنویس: آماده‌ام" }],
        max_tokens: 30,
        thinking: { type: "disabled" },
      }),
      signal: AbortSignal.timeout(25_000),
    });
    status = res.status;
    ok = res.ok;
    const j = (await res.json().catch(() => null)) as unknown;
    snippet = (JSON.stringify(j) ?? "no-json").slice(0, 500);
  } catch (e) {
    snippet = e instanceof Error ? e.message : "error";
  }
  return Response.json({
    ok,
    llmStatus: status,
    ms: Date.now() - t0,
    base: ZAI_BASE,
    model,
    keyLen: ZAI_KEY.length,
    snippet,
  });
}

/** تست ASR — فایل صوتی base64 را با همان مسیر ربات به زدات می‌فرستد */
export async function POST(req: NextRequest) {
  if (!auth(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { file_base64?: string } | null;
  const b64 = (body?.file_base64 ?? "").trim();
  if (!b64) return Response.json({ ok: false, error: "file_base64 خالی است" }, { status: 400 });
  const buf = Buffer.from(b64, "base64");
  const t0 = Date.now();
  const asrModel = req.nextUrl.searchParams.get("model") || process.env.VOICE_ASR_MODEL || "glm-asr-2512";
  const provider = req.nextUrl.searchParams.get("provider") || "zai";
  const ext = (req.nextUrl.searchParams.get("ext") || "ogg").replace(/[^a-z0-9]/gi, "");
  const mimes: Record<string, string> = {
    ogg: "audio/ogg", wav: "audio/wav", mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", flac: "audio/flac",
  };
  if (provider === "whisper") {
    // تست مسیر Whisper-سازگار (Groq/HF) — همان مسیر واقعی ربات
    const t = await whisperTranscribe(buf, `voice.${ext}`, mimes[ext] ?? "audio/ogg");
    if (!t && !process.env.WHISPER_API_KEY)
      return Response.json({ ok: false, error: "WHISPER_API_KEY تنظیم نشده" }, { status: 400 });
    return Response.json({ ok: Boolean(t), text: t, ms: Date.now() - t0, bytes: buf.length });
  }
  let status = 0;
  let ok = false;
  let text: string | null = null;
  let snippet = "";
  try {
    const form = new FormData();
    if (provider === "eleven") {
      const ek = process.env.ELEVENLABS_API_KEY ?? "";
      if (!ek) return Response.json({ ok: false, error: "ELEVENLABS_API_KEY تنظیم نشده" }, { status: 400 });
      form.append("file", new Blob([Uint8Array.from(buf)], { type: mimes[ext] ?? "audio/ogg" }), `voice.${ext}`);
      form.append("model_id", process.env.ELEVENLABS_STT_MODEL ?? "scribe_v1");
      const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: { "xi-api-key": ek },
        body: form,
        signal: AbortSignal.timeout(30_000),
      });
      status = r.status;
      ok = r.ok;
      const j2 = (await r.json().catch(() => null)) as { text?: string } | null;
      text = j2?.text ?? null;
      snippet = (JSON.stringify(j2) ?? "no-json").slice(0, 500);
      return Response.json({ ok, asrStatus: status, ms: Date.now() - t0, text, snippet, bytes: buf.length });
    }
    form.append("model", asrModel);
    form.append("stream", "false");
    form.append("file", new Blob([Uint8Array.from(buf)], { type: mimes[ext] ?? "application/octet-stream" }), `voice.${ext}`);
    const res = await fetch(`${ZAI_BASE}/audio/transcriptions`, {
      method: "POST",
      headers: ZAI_KEY ? { Authorization: `Bearer ${ZAI_KEY}` } : {},
      body: form,
      signal: AbortSignal.timeout(30_000),
    });
    status = res.status;
    ok = res.ok;
    const j = (await res.json().catch(() => null)) as { text?: string } | null;
    text = j?.text ?? null;
    snippet = (JSON.stringify(j) ?? "no-json").slice(0, 500);
  } catch (e) {
    snippet = e instanceof Error ? e.message : "error";
  }
  return Response.json({
    ok,
    asrStatus: status,
    ms: Date.now() - t0,
    text,
    snippet,
    bytes: buf.length,
  });
}
