// ─── عیب‌یابی زنده‌ی هوش مصنوعی و وویس (مخصوص مدیر) ───
// GET  /api/telegram/ai-diag?key=<VIP_WEBHOOK_SECRET>  → تست واقعی LLM زدات + وضعیت دقیق
// POST /api/telegram/ai-diag?key=<VIP_WEBHOOK_SECRET>  → تست ASR با {"file_base64": "..."}
// کلید هرگز در پاسخ برنمی‌گردد؛ فقط طول آن نمایش داده می‌شود.
import { NextRequest } from "next/server";
import { ZAI_BASE, ZAI_KEY, ZAI_MODEL } from "@/lib/ai";
import { VIP_SECRET } from "@/lib/vip-bot";
import { CLINIC_SECRET } from "@/lib/clinic-bot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function auth(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  return (Boolean(VIP_SECRET) && key === VIP_SECRET) || (Boolean(CLINIC_SECRET) && key === CLINIC_SECRET);
}

/** تست LLM — همان پارامترهای avaLLM */
export async function GET(req: NextRequest) {
  if (!auth(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const t0 = Date.now();
  let status = 0;
  let ok = false;
  let snippet = "";
  try {
    const res = await fetch(`${ZAI_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ZAI_KEY}` },
      body: JSON.stringify({
        model: ZAI_MODEL,
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
    model: ZAI_MODEL,
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
  let status = 0;
  let ok = false;
  let text: string | null = null;
  let snippet = "";
  try {
    const form = new FormData();
    form.append("model", process.env.VOICE_ASR_MODEL ?? "glm-asr-2512");
    form.append("stream", "false");
    form.append("file", new Blob([Uint8Array.from(buf)], { type: "audio/ogg" }), "voice.ogg");
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
