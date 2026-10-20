// ─── آوای اینستاگرام — منشی هوشمند دایرکت + کامنت→دایرکت (API رسمی متا) ───
// دو مسیر رسمی متا پشتیبانی می‌شود (هر دو با همین کد کار می‌کنند):
//   ۱) Instagram API with Instagram Login → https://graph.instagram.com (توکن اینستاگرام؛ بدون نیاز به پیج فیسبوک) ← پیش‌فرض
//   ۲) مسیر کلاسیک Messenger              → https://graph.facebook.com  (توکن پیج فیسبوک) — با IG_GRAPH_BASE قابل تغییر
// زنجیره‌ی AI همان آوای تلگرام است: Whisper (گوش) ← GLM-4.5-Flash (مغز) ← Edge TTS «دلارا» (صدا)
//
// متغیرهای محیطی:
//   INSTAGRAM_ACCESS_TOKEN     الزامی برای ارسال واقعی
//   INSTAGRAM_VERIFY_TOKEN     الزامی برای وبهوک
//   INSTAGRAM_APP_SECRET       توصیه‌شده (امضای وبهوک)
//   INSTAGRAM_USER_ID          اختیاری (پروب) | IG_GRAPH_BASE / IG_GRAPH_VERSION اختیاری
//   INSTAGRAM_SYSTEM_PROMPT    اختیاری (شخصیت آوا روی اینستاگرام)
//   INSTAGRAM_COMMENT_KEYWORDS اختیاری (پیش‌فرض: قیمت، هزینه، تعرفه، نرخ، چند)
//   INSTAGRAM_PUBLIC_REPLY     اختیاری (پاسخ عمومی زیر کامنت)

import crypto from "crypto";
import { ZAI_BASE, ZAI_KEY, ZAI_MODEL } from "./ai";
import { kvGet, kvSet, logEvent, safeParse } from "./kv";
import { ttsSpeak, whisperTranscribe } from "./voice";

export const IG_GRAPH_BASE = (process.env.IG_GRAPH_BASE ?? "https://graph.instagram.com").replace(
  /\/$/,
  "",
);
export const IG_GRAPH_VERSION = process.env.IG_GRAPH_VERSION ?? "v26.0";
export const IG_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN ?? "";
export const IG_APP_SECRET = process.env.INSTAGRAM_APP_SECRET ?? "";
export const IG_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN ?? "";
export const IG_USER_ID = process.env.INSTAGRAM_USER_ID ?? "";
export const IG_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://takrah.top";

export const IG_COMMENT_KEYWORDS = (process.env.INSTAGRAM_COMMENT_KEYWORDS ?? "قیمت,هزینه,تعرفه,نرخ,چند")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
export const IG_PUBLIC_REPLY =
  process.env.INSTAGRAM_PUBLIC_REPLY ?? "سلام! 🌟 جواب کامل رو همین الان به دایرکت فرستادم";

export const IG_FALLBACK =
  "سلام! 🌟 پیامت رسید و ثبتش کردم؛ به‌زودی همکارانم دقیق جوابت رو می‌دن. اگه فوریه، لطفاً دوباره پیام بده.";

export const IG_SYSTEM_PROMPT =
  process.env.INSTAGRAM_SYSTEM_PROMPT ??
  [
    "تو «آوا» هستی؛ منشی هوشمند و خوش‌برخورد این پیج اینستاگرام.",
    "فارسی صمیمی و کوتاه جواب بده (حداکثر ۴-۵ جمله) و از ایموجی کم و به‌جا استفاده کن.",
    "اگر سوال درباره قیمت، تعرفه یا جزئیات خدمتی بود و اطلاعات دقیق در پرامپت نبود، صادقانه بگو که برای قیمت دقیق همکاران در دایرکت/تماس اعلام می‌کنند و پیامش را ثبت کرده‌ای.",
    "همیشه گفتگو را یک قدم به جلو ببر: دعوت به ادامه گفتگو در همین دایرکت یا ثبت درخواست/سفارش.",
    "جواب‌های طولانی، فهرست‌های خشک و وعده‌های تاییدنشده نده.",
  ].join("\n");

export function igAvailable(): boolean {
  return Boolean(IG_TOKEN);
}

// ─── تایپ‌های وبهوک ───
export interface IgMessage {
  mid?: string;
  text?: string;
  is_echo?: boolean;
  attachments?: { type?: string; payload?: { url?: string } }[];
}
export interface IgMessaging {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: IgMessage;
}
export interface IgCommentValue {
  id?: string;
  text?: string;
  from?: { id?: string; username?: string };
  media?: { id?: string };
}

// ─── جلوگیری از پردازش تکراری (ریترای وبهوک متا) ───
export async function igSeenOnce(key: string): Promise<boolean> {
  if (!key) return true;
  const k = `ig:seen:${key}`;
  if (await kvGet(k)) return false;
  await kvSet(k, "1", 86_400);
  return true;
}

// ─── حافظه‌ی گفتگو (هر کاربر، ۸ پیام آخر) ───
type Hist = { role: "user" | "assistant"; content: string }[];
const histKey = (sid: string) => `ig:hist:${sid}`;

async function igHistory(sid: string): Promise<Hist> {
  const raw = await kvGet(histKey(sid));
  return raw ? safeParse<Hist>(raw, []) : [];
}

async function igPushHistory(sid: string, m: Hist[number]): Promise<void> {
  const h = await igHistory(sid);
  h.push(m);
  await kvSet(histKey(sid), JSON.stringify(h.slice(-8)), 86_400);
}

// ─── فراخوانی API گراف متا ───
export async function igApi(
  path: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  if (!IG_TOKEN) return { ok: false, status: 0, data: "no-token" };
  try {
    const res = await fetch(`${IG_GRAPH_BASE}/${IG_GRAPH_VERSION}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${IG_TOKEN}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: e instanceof Error ? e.message : "error" };
  }
}

/** ایمن‌سازی خروجی LLM برای پیام‌رسان */
function sanitize(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 700);
}

// ─── مغز آوا روی اینستاگرام — همان GLM با حافظه‌ی مستقل ───
export async function igLLM(senderId: string, question: string): Promise<string | null> {
  if (!ZAI_KEY || !question.trim()) return null;
  const attempt = async (): Promise<string | null> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20_000);
    try {
      const history = await igHistory(senderId);
      const messages = [
        { role: "system", content: IG_SYSTEM_PROMPT },
        ...history,
        { role: "user", content: question.slice(0, 600) },
      ];
      const res = await fetch(`${ZAI_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ZAI_KEY}` },
        body: JSON.stringify({
          model: ZAI_MODEL,
          messages,
          temperature: 0.5,
          max_tokens: 400,
          thinking: { type: "disabled" },
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        await kvSet(
          "dbg:llm",
          JSON.stringify({ t: Date.now(), status: res.status, src: "ig", body: body.slice(0, 300) }),
        );
        return null;
      }
      const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const out = j.choices?.[0]?.message?.content;
      return out && out.trim() ? sanitize(out) : null;
    } catch (e) {
      await kvSet(
        "dbg:llm",
        JSON.stringify({
          t: Date.now(),
          status: 0,
          src: "ig",
          body: e instanceof Error ? e.message : "error",
        }),
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
  const first = await attempt();
  if (first !== null) {
    await igPushHistory(senderId, { role: "user", content: question });
    await igPushHistory(senderId, { role: "assistant", content: first });
    return first;
  }
  await new Promise((r) => setTimeout(r, 400));
  const second = await attempt();
  if (second !== null) {
    await igPushHistory(senderId, { role: "user", content: question });
    await igPushHistory(senderId, { role: "assistant", content: second });
  }
  return second;
}

// ─── ارسال دایرکت ───
export async function igSendText(igId: string, recipientId: string, text: string): Promise<boolean> {
  const r = await igApi(`${igId}/messages`, { recipient: { id: recipientId }, message: { text } });
  return r.ok;
}

export async function igSendAudio(
  igId: string,
  recipientId: string,
  audioUrl: string,
): Promise<boolean> {
  const r = await igApi(`${igId}/messages`, {
    recipient: { id: recipientId },
    message: { attachment: { type: "audio", payload: { url: audioUrl } } },
  });
  return r.ok;
}

/** تولید وویس «دلارا» و ذخیره‌ی عمومی ۱ ساعته برای ارسال به گراف */
export async function igTtsUrl(text: string): Promise<{ url: string; bytes: number } | null> {
  const sp = await ttsSpeak(text.slice(0, 600));
  if (!sp || !sp.buf.length) return null;
  const k = crypto.randomBytes(9).toString("hex");
  const b64 = sp.buf.toString("base64");
  await kvSet(`ig:aud:${k}`, b64, 3600);
  // اگر ذخیره‌سازی مشترک در دسترس نبود (فقط حافظه‌ی همین نمونه)، صرف‌نظر — متن اصلی ارسال شده است
  if ((await kvGet(`ig:aud:${k}`)) !== b64) return null;
  return { url: `${IG_SITE_URL}/api/instagram/audio?k=${k}`, bytes: sp.buf.length };
}

// ─── جریان دایرکت: متن یا ویس → شنیدن → مغز → متن + وویس ───
export async function handleIgMessage(igId: string, m: IgMessaging): Promise<void> {
  const msg = m.message;
  if (!msg || msg.is_echo) return;
  const sender = m.sender?.id ?? "";
  if (!sender) return;
  if (!(await igSeenOnce(msg.mid ?? ""))) return;

  let question = (msg.text ?? "").trim();
  let viaVoice = false;
  if (!question && msg.attachments?.length) {
    const att = msg.attachments.find((a) => a.type === "audio" || a.type === "video");
    const url = att?.payload?.url ?? "";
    if (url) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          const t = await whisperTranscribe(buf, "voice.mp4", "audio/mp4");
          if (t && t.trim()) {
            question = t.trim();
            viaVoice = true;
          }
        }
      } catch {
        /* ادامه با متن خالی */
      }
    }
  }

  if (!question) {
    if (msg.attachments?.length) {
      await igSendText(igId, sender, "الان فقط متن و ویس می‌فهمم 🌟 بگو چطور کمکت کنم؟");
    }
    return;
  }

  if (viaVoice) await logEvent("ig_voice", question.slice(0, 60));
  const reply = (await igLLM(sender, question)) ?? IG_FALLBACK;
  const sent = await igSendText(igId, sender, reply);
  if (sent) {
    const sp = await igTtsUrl(reply);
    if (sp) await igSendAudio(igId, sender, sp.url);
  }
  await logEvent("ig_msg", `${viaVoice ? "🎙" : "💬"} ${question.slice(0, 60)}${sent ? "" : " ⚠️ارسال ناموفق"}`);
}

// ─── جریان کامنت→دایرکت: کلمه‌کلید → پاسخ عمومی + پرایوت‌ریپلای هوشمند ───
export async function handleIgComment(igId: string, v: IgCommentValue): Promise<void> {
  const cid = v.id ?? "";
  const text = (v.text ?? "").trim();
  if (!cid || !text) return;
  const hit = IG_COMMENT_KEYWORDS.some((k) => text.toLowerCase().includes(k.toLowerCase()));
  if (!hit) return;
  if (!(await igSeenOnce(`cmt:${cid}`))) return;

  const uname = v.from?.username ? `@${v.from.username} ` : "";
  const answer =
    (await igLLM(
      `cmt:${v.from?.id ?? cid}`,
      `یک کاربر روی پست اینستاگرام این کامنت را گذاشته: «${text}». یک پیام خصوصی خیلی کوتاه و دوستانه بنویس که دقیقاً جواب همین کامنت باشد و او را به ادامه‌ی گفتگو در همین دایرکت دعوت کند. با سلام شروع کن.`,
    )) ?? IG_FALLBACK;

  // ۱) پاسخ عمومی کوتاه زیر کامنت (اختیاری و بی‌ضرر)
  await igApi(`${cid}/replies`, { message: IG_PUBLIC_REPLY });
  // ۲) پرایوت‌ریپلای — دایرکت به کامنت‌گذار (روی هر کامنت فقط یک‌بار، تا ۷ روز)
  const pr = await igApi(`${igId}/messages`, {
    recipient: { comment_id: cid },
    message: { text: `${uname ? `${uname}سلام! ` : "سلام! "}${answer}` },
  });
  await logEvent("ig_comment", `${text.slice(0, 60)} → ${pr.ok ? "dm ok" : `dm fail ${pr.status}`}`);
}

// ─── پروب اتصال — برای ai-diag ───
export async function igProbe(): Promise<Record<string, unknown>> {
  if (!IG_TOKEN) return { ok: false, configured: false, error: "INSTAGRAM_ACCESS_TOKEN تنظیم نشده" };
  const t0 = Date.now();
  try {
    const res = await fetch(
      `${IG_GRAPH_BASE}/${IG_GRAPH_VERSION}/me?fields=id,name,username,followers_count`,
      { headers: { Authorization: `Bearer ${IG_TOKEN}` }, signal: AbortSignal.timeout(15_000) },
    );
    const j = (await res.json().catch(() => null)) as {
      id?: string;
      name?: string;
      username?: string;
      followers_count?: number;
      error?: { message?: string };
    } | null;
    if (!res.ok) {
      // مسیر کلاسیک: /me با توکن پیج = خود پیج؛ سپس رفع شماره‌ی اینستاگرام
      let classic: { username?: string; id?: string } | null = null;
      if (j?.id) {
        const r2 = await fetch(
          `${IG_GRAPH_BASE}/${IG_GRAPH_VERSION}/${j.id}?fields=instagram_business_account{username,id}`,
          { headers: { Authorization: `Bearer ${IG_TOKEN}` }, signal: AbortSignal.timeout(15_000) },
        ).catch(() => null);
        const j2 = r2 && r2.ok ? ((await r2.json().catch(() => null)) as never) : null;
        classic = (j2 as { instagram_business_account?: { username?: string; id?: string } } | null)
          ?.instagram_business_account ?? null;
      }
      return {
        ok: false,
        configured: true,
        status: res.status,
        ms: Date.now() - t0,
        error: j?.error?.message ?? "خطای گراف",
        classicIgAccount: classic,
        hint: "توکن معتبر نیست یا مسیر گراف را در IG_GRAPH_BASE/IG_GRAPH_VERSION تنظیم کنید",
      };
    }
    return {
      ok: true,
      configured: true,
      status: res.status,
      ms: Date.now() - t0,
      account: { id: j?.id, username: j?.username ?? null, name: j?.name ?? null, followers: j?.followers_count ?? null },
    };
  } catch (e) {
    return { ok: false, configured: true, ms: Date.now() - t0, error: e instanceof Error ? e.message : "error" };
  }
}
