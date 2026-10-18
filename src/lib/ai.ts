// ─── موتور هوش مصنوعی آوا — GLM از طریق API سازگار با OpenAI ───
// پروداکشن: فقط با fetch خالص (بدون SDK) — سازگار با Vercel
// تنظیمات Vercel (همه اختیاری — بدون کلید، موتور داخلی آوا کار می‌کند):
//   ZAI_API_KEY   → کلید از api.z.ai
//   ZAI_BASE_URL  → پیش‌فرض https://api.z.ai/api/paas/v4
//   ZAI_MODEL     → پیش‌فرض glm-4.5-flash (رایگان!) — اگر حساب شارژ شد: glm-4.5-air یا glm-4.6
import { kvGet, kvSet, logEvent } from "./kv";

export const ZAI_KEY = process.env.ZAI_API_KEY ?? "";
export const ZAI_BASE = (process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/paas/v4").replace(
  /\/$/,
  "",
);
export const ZAI_MODEL = process.env.ZAI_MODEL ?? "glm-4.5-flash";

export function aiAvailable(): boolean {
  return Boolean(ZAI_KEY);
}

// ─── پرامپت سیستم — آوا با دانش کامل کلینیک ───
export function buildAvaSystemPrompt(clinic: {
  name: string;
  address: string;
  phone: string;
  hours: string;
  specs: { emoji: string; name: string }[];
  doctors: { name: string; spec: string; days: string }[];
}): string {
  return [
    `تو «آوا» هستی؛ منشی هوشمند و باحوصله‌ی «${clinic.name}» در رشت. با گرمی و احترام فارسی حرف می‌زنی، مثل یک منشی واقعی و حرفه‌ای.`,
    `همیشه کوتاه جواب بده (حداکثر ۵ جمله). از ایموجی کم و به‌جا استفاده کن.`,
    ``,
    `📍 اطلاعات کلینیک:`,
    `- آدرس: ${clinic.address}`,
    `- تلفن پذیرش: ${clinic.phone}`,
    `- ساعات کاری: ${clinic.hours.replace(/\n/g, " | ")}`,
    `- تخصص‌ها: ${clinic.specs.map((s) => s.name).join("، ")}`,
    `- پزشکان: ${clinic.doctors.map((d) => `${d.name} (${d.spec}، ${d.days})`).join("؛ ")}`,
    `- تعرفه‌ی نمونه: ترمیم و درمان دندان از ۸۰۰ هزار تومان؛ بقیه‌ی تعرفه‌ها بعد از معاینه توسط پزشک اعلام می‌شود.`,
    `- بیمه: با اکثر بیمه‌های پایه و تکمیلی قرارداد دارند (جزئیات هر بیمه را پذیرش بررسی می‌کند).`,
    ``,
    `قواعد طلایی:`,
    `1. جواب را فقط از اطلاعات بالا بده؛ قیمت دقیق خدمات دیگر را از خودت نساز — بگو پزشک بعد از معاینه دقیق می‌گوید.`,
    `2. در پایان هر پاسخ، با یک جمله‌ی کوتاه به رزرو نوبت در همین چت یا ثبت «مشاوره رایگان» دعوت کن.`,
    `3. اگر سوال خارج از اطلاعات تو بود، صادقانه بگو باید پذیرش پاسخ دهد و پیشنهاد بده شماره‌اش را ثبت کند تا تماس بگیرند.`,
    `4. اگر بیمار درد فوری یا شدید دارد، فوراً تلفن پذیرش را بده و رزرو سریع پیشنهاد کن.`,
    `5. از پاسخ‌های طولانی، فهرست‌های خشک و اصطلاحات پزشکی سنگین پرهیز کن؛ ساده و صمیمی بنویس.`,
  ].join("\n");
}

// ─── تاریخچه‌ی گفتگو (هر چت، ۱۰ پیام آخر) ───
export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const histKey = (chatId: number) => `vip:hist:${chatId}`;

export async function getHistory(chatId: number): Promise<ChatMsg[]> {
  const raw = await kvGet(histKey(chatId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ChatMsg[];
  } catch {
    return [];
  }
}

export async function pushHistory(chatId: number, msg: ChatMsg): Promise<void> {
  const h = await getHistory(chatId);
  h.push(msg);
  await kvSet(histKey(chatId), JSON.stringify(h.slice(-10)));
}

export async function clearHistory(chatId: number): Promise<void> {
  await kvSet(histKey(chatId), JSON.stringify([]));
}

/** خروجی LLM را برای parse_mode=HTML ایمن و کوتاه می‌کند */
function sanitize(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // هر تگ HTML را حذف کن
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 900);
}

// ─── پاسخ آوا با LLM — در هر خطا null برمی‌گرداند (fallback به موتور داخلی) ───
// یک تلاش مجدد خودکار روی خطاهای گذرا (timeout/شبکه) — تا آوا هیچ‌وقت
// به‌خاطر یک لغزش لحظه‌ای ساده جواب ندهد.
export async function avaLLM(
  chatId: number,
  question: string,
  clinic: Parameters<typeof buildAvaSystemPrompt>[0],
): Promise<string | null> {
  const first = await avaLLMTry(chatId, question, clinic);
  if (first !== null) return first;
  await new Promise((r) => setTimeout(r, 400));
  return avaLLMTry(chatId, question, clinic);
}

async function avaLLMTry(
  chatId: number,
  question: string,
  clinic: Parameters<typeof buildAvaSystemPrompt>[0],
): Promise<string | null> {
  if (!ZAI_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const history = await getHistory(chatId);
    const messages = [
      { role: "system", content: buildAvaSystemPrompt(clinic) },
      ...history,
      { role: "user", content: question.slice(0, 500) },
    ];
    const res = await fetch(`${ZAI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ZAI_KEY}`,
      },
      body: JSON.stringify({
        model: ZAI_MODEL,
        messages,
        temperature: 0.5,
        max_tokens: 500,
        thinking: { type: "disabled" },
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      // خطای خام ذخیره می‌شود تا در /api/telegram/ai-diag?last=1 قابل مشاهده باشد
      const body = await res.text().catch(() => "");
      await kvSet(
        "dbg:llm",
        JSON.stringify({ t: Date.now(), status: res.status, body: body.slice(0, 300) }),
      );
      return null;
    }
    const j = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const out = j.choices?.[0]?.message?.content;
    if (!out || !out.trim()) return null;
    const clean = sanitize(out);
    if (!clean) return null;
    await pushHistory(chatId, { role: "user", content: question });
    await pushHistory(chatId, { role: "assistant", content: clean });
    await logEvent("llm", question);
    return clean;
  } catch (e) {
    await kvSet(
      "dbg:llm",
      JSON.stringify({ t: Date.now(), status: 0, body: e instanceof Error ? e.message : "error" }),
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
