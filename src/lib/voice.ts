// ─── لایه‌ی صدا: آوا هم حرف می‌زند و هم می‌شنود ───
// TTS: صدای عصبی فارسی مایکروسافت اج (fa-IR-DilaraNeural) — رایگان، بدون کلید، بدون حساب
// STT: هر endpoint سازگار با Whisper (Groq رایگان / OpenAI / HuggingFace) — فارسی عالی
import { kvSet } from "./kv";

export const TTS_VOICE = process.env.TTS_VOICE ?? "fa-IR-DilaraNeural";

/** صدای عصبی فارسی — رایگان، بدون کلید، بدون حساب */
export async function edgeTTS(text: string): Promise<Buffer | null> {
  // علائم مارک‌داونی و HTML باقی‌مانده را پاک می‌کنیم تا در گفتار خوانده نشوند
  const clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`~|>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return null;
  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
    const tts = new MsEdgeTTS();
    await tts.setMetadata(TTS_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(clean.slice(0, 900));
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk));
    }
    const buf = Buffer.concat(chunks);
    return buf.length > 1000 ? buf : null;
  } catch (e) {
    await kvSet(
      "dbg:tts",
      JSON.stringify({
        t: Date.now(),
        stage: "edge",
        status: 0,
        body: e instanceof Error ? e.message.slice(0, 240) : "error",
      }),
    );
    return null;
  }
}

/** Google TTS — پشتیبانِ Edge (بدون کلید؛ قطعه‌قطعه تا ۱۸۰ کاراکتر و چسباندن mp3) */
async function gttsSpeak(text: string): Promise<Buffer | null> {
  const clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`~|>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return null;
  // برش جمله‌محور به قطعات ≤ ۱۸۰ کاراکتر
  const words = clean.slice(0, 900).split(" ");
  const parts: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 180) {
      if (cur) parts.push(cur.trim());
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) parts.push(cur.trim());
  if (parts.length > 6) return null; // بیش از حد طولانی — صرف‌نظر
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const chunks: Buffer[] = [];
    for (const p of parts) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fa&q=${encodeURIComponent(p)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
        signal: ctrl.signal,
      });
      if (!res.ok) {
        await kvSet(
          "dbg:tts",
          JSON.stringify({ t: Date.now(), stage: "gtts", status: res.status, body: (await res.text().catch(() => "")).slice(0, 160) }),
        );
        return null;
      }
      const ab = await res.arrayBuffer();
      if (ab.byteLength < 500) return null;
      chunks.push(Buffer.from(ab));
    }
    const buf = Buffer.concat(chunks);
    return buf.length > 1000 ? buf : null;
  } catch (e) {
    await kvSet(
      "dbg:tts",
      JSON.stringify({ t: Date.now(), stage: "gtts", status: 0, body: e instanceof Error ? e.message.slice(0, 160) : "error" }),
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** گوینده‌ی آوا: سه تلاش مایکروسافت (۴۲۹ نوسانی IPها) → گوگل → null */
export async function ttsSpeak(text: string): Promise<{ buf: Buffer; engine: string } | null> {
  for (let i = 0; i < 3; i++) {
    const edge = await edgeTTS(text);
    if (edge) return { buf: edge, engine: "edge" };
    if (i < 2) await new Promise((r) => setTimeout(r, i === 0 ? 300 : 800));
  }
  const g = await gttsSpeak(text);
  if (g) return { buf: g, engine: "gtts" };
  return null;
}

/**
 * تبدیل گفتار به متن با هر endpoint سازگار با Whisper (OpenAI-compatible).
 * پیش‌فرض: Groq (whisper-large-v3 — رایگان، OGG مستقیم، فارسی عالی)
 * حالت HuggingFace: اگر WHISPER_BASE_URL شامل huggingface باشد، بدنه‌ی خام می‌فرستد.
 */
export async function whisperTranscribe(
  buf: Buffer,
  filename = "voice.ogg",
  mime = "audio/ogg",
): Promise<string | null> {
  const key = process.env.WHISPER_API_KEY ?? "";
  if (!key) return null;
  const base = (process.env.WHISPER_BASE_URL ?? "https://api.groq.com/openai/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.WHISPER_MODEL ?? "whisper-large-v3";
  const isHF = base.includes("huggingface");
  const stage = isHF ? "hf" : "whisper";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);
  try {
    let res: Response;
    if (isHF) {
      res = await fetch(`${base}/models/openai/whisper-large-v3`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": mime },
        body: new Uint8Array(buf),
        signal: ctrl.signal,
      });
    } else {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(buf)], { type: mime }), filename);
      form.append("model", model);
      form.append("response_format", "json");
      res = await fetch(`${base}/audio/transcriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
        signal: ctrl.signal,
      });
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      await kvSet(
        "dbg:voice",
        JSON.stringify({ t: Date.now(), stage, status: res.status, body: body.slice(0, 240) }),
      );
      return null;
    }
    const j = (await res.json().catch(() => null)) as { text?: string } | null;
    const out = j?.text && j.text.trim() ? j.text.trim().slice(0, 500) : null;
    await kvSet(
      "dbg:voice",
      JSON.stringify({ t: Date.now(), stage, ok: Boolean(out), text: (out ?? "").slice(0, 80) }),
    );
    return out;
  } catch (e) {
    await kvSet(
      "dbg:voice",
      JSON.stringify({
        t: Date.now(),
        stage,
        status: 0,
        body: e instanceof Error ? e.message.slice(0, 240) : "error",
      }),
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** آیا مسیری برای شنیدن وویس هست؟ */
export function sttAvailable(): boolean {
  return Boolean(
    process.env.WHISPER_API_KEY ||
      process.env.ELEVENLABS_API_KEY ||
      process.env.VOICE_ASR_URL ||
      process.env.ZAI_API_KEY,
  );
}

/** موتور فعلی شنیدن — برای health */
export function sttEngine(): string {
  if (process.env.WHISPER_API_KEY) return "whisper";
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.VOICE_ASR_URL) return "custom";
  if (process.env.ZAI_API_KEY) return "zai";
  return "none";
}
