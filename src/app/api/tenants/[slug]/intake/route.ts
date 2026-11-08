// ─── دستیار دکتر — پرسش‌نامه‌ی بیمار → خلاصه‌ی هوش مصنوعی → وویس → تلگرام پزشک ───
// بیمار فرم را پر می‌کند؛ GLM خلاصه‌ی ساختاریافته می‌سازد؛ صدای دلارا همان خلاصه را
// به وویس تبدیل می‌کند و هم وویس هم متن برای پزشک/منشی ارسال می‌شود.
// سهمیه‌ی ماهانه بر اساس پلن کنترل می‌شود (trial 15 / basic 60 / pro 200).
import { ZAI_BASE, ZAI_KEY, ZAI_MODEL } from "@/lib/ai";
import { logEvent, safeParse } from "@/lib/kv";
import {
  bumpUsage,
  getTenant,
  getUsage,
  intakeAudioUrl,
  intakeVoice,
  newIntakeId,
  PLAN_INTAKE_LIMIT,
  putIntake,
  putIntakeAudio,
  type Tenant,
} from "@/lib/tenants";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface IntakeBody {
  name?: string;
  age?: string;
  phone?: string;
  complaint?: string;
  history?: string;
  meds?: string;
  allergies?: string;
  pain?: number;
  extra?: string;
  doctorId?: string;
}

function fallbackSummary(b: Required<Pick<IntakeBody, "name" | "age" | "complaint" | "history" | "meds" | "allergies">> & { pain: number; extra: string }): { urgency: "low" | "mid" | "high"; summary: string } {
  const urgency = b.pain >= 7 || /خونریزی|تب بالا|شدید|تورم سریع/.test(b.complaint) ? "high" : b.pain >= 4 ? "mid" : "low";
  const lines = [
    `بیمار: ${b.name}${b.age ? ` — ${b.age} ساله` : ""}`,
    `شکایت اصلی: ${b.complaint}`,
    b.history ? `سابقه: ${b.history}` : "",
    b.meds ? `داروها: ${b.meds}` : "",
    b.allergies ? `حساسیت: ${b.allergies}` : "",
    `شدت درد: ${b.pain} از ۱۰`,
    b.extra ? `نکات دیگر: ${b.extra}` : "",
  ].filter(Boolean);
  return { urgency, summary: lines.join("\n") };
}

async function glmSummary(b: {
  name: string;
  age: string;
  complaint: string;
  history: string;
  meds: string;
  allergies: string;
  pain: number;
  extra: string;
}): Promise<{ urgency: "low" | "mid" | "high"; summary: string } | null> {
  if (!ZAI_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const prompt = [
      "تو دستیار پزشکی هستی؛ اطلاعات یک بیمار را به خلاصه‌ی کوتاه و کاربردی برای پزشک تبدیل می‌کنی.",
      "فقط و فقط یک JSON معتبر برگردان، بدون هیچ متن اضافه، با این ساختار:",
      '{"urgency":"low|mid|high","summary":"خلاصه فارسی"}',
      "summary حداکثر ۹۰ کلمه، با این بخش‌ها (هر کدام در یک خط کوتاه):",
      "«شکایت اصلی: ...» / «یافته‌های مهم: ...» / «هشدار: ...» (اگر فوری است) / «پیشنهاد پرسش: دو پرسش که پزشک بهتر است بپرسد»",
      "هیچ تشخیص و نسخه‌ای ننویس — فقط جمع‌بندی داده‌ها.",
      "",
      `بیمار: ${b.name}${b.age ? `، ${b.age} ساله` : ""}`,
      `شکایت: ${b.complaint}`,
      b.history ? `سابقه بیماری: ${b.history}` : "سابقه: ذکر نشده",
      b.meds ? `داروهای مصرفی: ${b.meds}` : "دارو: ذکر نشده",
      b.allergies ? `حساسیت‌ها: ${b.allergies}` : "حساسیت: ذکر نشده",
      `شدت درد (۰ تا ۱۰): ${b.pain}`,
      b.extra ? `نکات بیمار: ${b.extra}` : "",
    ].join("\n");
    const res = await fetch(`${ZAI_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ZAI_KEY}` },
      body: JSON.stringify({
        model: ZAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
        thinking: { type: "disabled" },
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = j.choices?.[0]?.message?.content ?? "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = safeParse<{ urgency?: string; summary?: string }>(m[0], {});
    const urgency = parsed.urgency === "high" || parsed.urgency === "low" ? parsed.urgency : "mid";
    const summary = (parsed.summary ?? "").replace(/[*#`]/g, "").trim().slice(0, 900);
    return summary ? { urgency, summary } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** ارسال وویس به چت پزشک — multipart مستقیم به Bot API */
async function sendVoice(token: string, chatId: string, buf: Buffer, caption: string): Promise<boolean> {
  try {
    const form = new FormData();
    form.append("voice", new Blob([new Uint8Array(buf)], { type: "audio/mpeg" }), "khodase.mp3");
    form.append("chat_id", chatId);
    form.append("caption", caption.slice(0, 900));
    const res = await fetch(`https://api.telegram.org/bot${token}/sendVoice`, {
      method: "POST",
      body: form,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  const t: Tenant | null = await getTenant(slug);
  if (!t) return Response.json({ ok: false, err: "چنین کلینیکی نیست" }, { status: 404 });
  if (t.status === "expired" || t.status === "archived") {
    return Response.json({ ok: false, err: "اشتراک این کلینیک منقضی شده است" }, { status: 403 });
  }

  let body: IntakeBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, err: "بدنه‌ی درخواست نامعتبر است" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 60);
  const complaint = (body.complaint ?? "").trim().slice(0, 500);
  if (name.length < 2) return Response.json({ ok: false, err: "نام بیمار را بنویسید" }, { status: 400 });
  if (complaint.length < 5) return Response.json({ ok: false, err: "شرح شکایت خیلی کوتاه است" }, { status: 400 });

  const used = await getUsage(slug);
  if (used >= PLAN_INTAKE_LIMIT[t.plan]) {
    return Response.json(
      { ok: false, err: `سهمیه‌ی ماهانه (${PLAN_INTAKE_LIMIT[t.plan]} پرسش‌نامه) پر شده — پلن را ارتقا دهید`, limit: true },
      { status: 429 },
    );
  }

  const rec0 = {
    name,
    age: (body.age ?? "").replace(/\D/g, "").slice(0, 3),
    phone: (body.phone ?? "").replace(/[^\d+]/g, "").slice(0, 15),
    complaint,
    history: (body.history ?? "").trim().slice(0, 400),
    meds: (body.meds ?? "").trim().slice(0, 300),
    allergies: (body.allergies ?? "").trim().slice(0, 200),
    pain: Math.max(0, Math.min(10, Math.round(Number(body.pain) || 0))),
    extra: (body.extra ?? "").trim().slice(0, 400),
    doctorId: (body.doctorId ?? "").trim().slice(0, 8),
  };

  const ai = await glmSummary(rec0);
  const { urgency, summary } = ai ?? fallbackSummary({ ...rec0 });

  // وویس دلارا (رایگان) — اگر شد، ذخیره با لینک امضاشده
  const id = newIntakeId();
  let audioSig = "";
  let audioUrl = "";
  const buf = await intakeVoice(summary);
  if (buf) {
    audioSig = await putIntakeAudio(slug, id, buf);
    audioUrl = intakeAudioUrl(slug, id, audioSig);
  }
  const saved = await putIntake(slug, id, { ...rec0, summary, urgency, audioSig });

  await bumpUsage(slug);
  await logEvent("voice", `${slug}:intake`);

  // اطلاع‌رسانی به پزشک/منشی — وویس در چت + لینک پشتیبان
  if (t.ownerChatId && process.env.CLINIC_BOT_TOKEN) {
    const uLabel = urgency === "high" ? "🔴 فوری" : urgency === "mid" ? "🟡 توجه" : "🟢 عادی";
    const caption = `${uLabel} — خلاصه‌ی بیمار جدید (${t.name})\n\n${summary}`;
    let sent = false;
    if (buf) sent = await sendVoice(process.env.CLINIC_BOT_TOKEN, t.ownerChatId, buf, caption);
    if (!sent) {
      const { reply } = await import("@/lib/clinic-bot");
      await reply(
        t.ownerChatId,
        `${uLabel} <b>خلاصه‌ی بیمار جدید — ${t.name}</b>\n\n${summary.replace(/</g, "&lt;")}` +
          (audioUrl ? `\n\n🎧 وویس خلاصه:\n${audioUrl}` : ""),
      );
    }
  }

  return Response.json({ ok: true, id: saved.id, urgency, summary, audioUrl });
}
