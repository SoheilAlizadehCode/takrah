// Telegram webhook for @TakrahTop_support_bot — search + growth bot for takrah.top
// Telegram sends POST updates here; we reply via the Bot API and always return 200.
import { NextRequest } from "next/server";
import {
  articleKeyboard,
  mainKeyboard,
  newReplyMessage,
  refWelcomeText,
  searchReplyMessage,
  topReplyMessage,
  welcomeText,
  type InlineKeyboard,
} from "@/lib/bot-search";
import { botToken, makeVerifyCode } from "@/lib/student-gate";
import { articles } from "@/data";

export const dynamic = "force-dynamic";

// ⚠️ تاریخچه: توکن ربات اول (@TakrahTop_bot) در سورس عمومی لو رفته بود و بعداً ربات توسط
// سیستم ضدسوءاستفاده تلگرام محدود شد (false positive). ربات جدید: @TakrahTop_support_bot
// توکن از botToken() در student-gate می‌آید (متغیر TELEGRAM_BOT_TOKEN_V2 اولویت دارد)؛
// سکرت وبهوک از متغیر TELEGRAM_WEBHOOK_SECRET.
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

const TOKEN = botToken(); // مرکزی در student-gate — ربات جدید بعد از محدودیت ربات قبلی
const CHANNEL = "@takrahTop";
const SITE_URL = "https://takrah.top";
const CHANNEL_URL = "https://t.me/takrahTop";

type Keyboard = { inline_keyboard: { text: string; url?: string; callback_data?: string }[][] };

async function tg(method: string, body: Record<string, unknown>): Promise<unknown> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json().catch(() => null);
  } catch {
    return null; // swallow — Telegram retries failed webhooks; never throw after reply point
  }
}

async function reply(
  chatId: number | string,
  text: string,
  keyboard?: Keyboard,
): Promise<void> {
  await tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

/** آیا کاربر عضو کانال است؟ (بات ادمین کانال است) null = نامطمئن */
async function isMember(userId: number): Promise<boolean | null> {
  const res = (await tg("getChatMember", { chat_id: CHANNEL, user_id: userId })) as {
    ok?: boolean;
    result?: { status?: string };
  } | null;
  if (!res?.ok || !res.result?.status) return null;
  return !["left", "kicked"].includes(res.result.status);
}

function articleBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}

/* ─── گیت دانلود بخش دانش‌آموزی ─────────────────────────────────
 * سایت دکمه‌ای با لینک t.me/TakrahTop_support_bot?start=dlv_<nonce> نشان می‌دهد؛
 * بعد از چک عضویت، کد امضاشده‌ای به کاربر می‌دهیم تا در سایت وارد کند.
 * طراحی stateless — سایت با HMAC همان کد را تأیید می‌کند.
 */

async function sendVerifyCode(chatId: number | string, nonce: string, tgId: number): Promise<void> {
  await reply(
    chatId,
    [
      "✅ عضویتت در کانال تک‌راه تأیید شد!",
      "",
      "کد تأیید را کپی کن و در سایت وارد کن:",
      `<code>${makeVerifyCode(nonce, tgId)}</code>`,
      "",
      "(روی کد بزن تا کپی شود، بعد در سایت «تأیید و ادامه» را بزن)",
    ].join("\n"),
    { inline_keyboard: [[{ text: "🎓 بازگشت به صفحه دانلود", url: "https://takrah.top/student/download" }]] },
  );
}

async function downloadVerify(tgId: number | undefined, chatId: number | string, nonce: string): Promise<void> {
  if (!tgId || !/^[a-f0-9]{8,32}$/.test(nonce)) {
    await reply(chatId, "برای تأیید عضویت، از دکمه صفحه دانلود سایت استفاده کن 🙏");
    return;
  }
  const member = await isMember(tgId);
  if (member === true) {
    await sendVerifyCode(chatId, nonce, tgId);
  } else if (member === false) {
    await reply(
      chatId,
      [
        "📥 برای دانلود فایل‌های آموزشی بخش دانش‌آموزی، اول باید عضو کانال تک‌راه بشی.",
        "",
        "۱️⃣ با دکمه زیر عضو شو",
        "۲️⃣ بعد «بررسی مجدد» را بزن تا کدت را بگیری",
      ].join("\n"),
      {
        inline_keyboard: [
          [{ text: "📢 عضویت در کانال", url: CHANNEL_URL }],
          [{ text: "🔄 بررسی مجدد عضویت", callback_data: `dlvre_${nonce}` }],
        ],
      },
    );
  } else {
    await reply(chatId, "الان نمی‌توانم عضویتت را چک کنم 😔 چند لحظه بعد دوباره امتحان کن.");
  }
}

async function handleMessage(message: {
  chat?: { id?: number | string };
  from?: { id?: number };
  text?: string;
}): Promise<void> {
  const chatId = message.chat?.id;
  const text = (message.text || "").trim();
  if (!chatId || !text) return;

  if (text.startsWith("/start")) {
    // deep link: /start ref_<slug> — از اشتراک‌گذاری مقاله
    const payload = text.split(" ")[1] || "";

    // deep link: /start dlv_<nonce> — گیت دانلود بخش دانش‌آموزی
    if (payload.startsWith("dlv_")) {
      await downloadVerify(message.from?.id, chatId, payload.slice(4));
      return;
    }

    const refSlug = payload.startsWith("ref_") ? payload.slice(4) : "";
    const refArticle = /^[a-z0-9-]+$/.test(refSlug) ? articleBySlug(refSlug) : undefined;

    if (refArticle) {
      await reply(chatId, refWelcomeText(refArticle), articleKeyboard(refArticle));
      return;
    }

    const member = message.from?.id ? await isMember(message.from.id) : null;
    await reply(chatId, welcomeText(member), mainKeyboard());
    return;
  }

  if (text.startsWith("/top")) {
    await reply(chatId, topReplyMessage(), mainKeyboard());
  } else if (text.startsWith("/new") || text.startsWith("/recent")) {
    await reply(chatId, newReplyMessage(), mainKeyboard());
  } else if (text.startsWith("/help")) {
    await reply(chatId, welcomeText(null), mainKeyboard());
  } else {
    await reply(chatId, searchReplyMessage(text), mainKeyboard());
  }
}

async function handleCallback(cb: {
  id?: string;
  from?: { id?: number };
  message?: { chat?: { id?: number | string } };
  data?: string;
}): Promise<void> {
  const chatId = cb.message?.chat?.id;
  const data = cb.data || "";
  if (!chatId) return;

  // گیت دانلود: بررسی مجدد عضویت بعد از عضویت در کانال
  if (data.startsWith("dlvre_")) {
    const nonce = data.slice(6);
    const tgId = cb.from?.id;
    if (tgId) {
      const member = await isMember(tgId);
      if (member === true) {
        await tg("answerCallbackQuery", { callback_query_id: cb.id ?? "", text: "عضویت تأیید شد! ✅" });
        await sendVerifyCode(chatId, nonce, tgId);
        return;
      }
      await tg("answerCallbackQuery", {
        callback_query_id: cb.id ?? "",
        text: "هنوز عضو کانال نشدی! اول دکمه عضویت را بزن 🙏",
        show_alert: true,
      });
    }
    return;
  }

  await tg("answerCallbackQuery", { callback_query_id: cb.id ?? "" });

  if (data === "top") await reply(chatId, topReplyMessage(), mainKeyboard());
  else if (data === "new") await reply(chatId, newReplyMessage(), mainKeyboard());
}

export async function POST(req: NextRequest) {
  // Verify the request really came from Telegram (فقط اگر سکرت تنظیم شده باشد)
  if (
    WEBHOOK_SECRET &&
    req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET
  ) {
    return new Response("forbidden", { status: 403 });
  }

  type Update = {
    message?: Parameters<typeof handleMessage>[0];
    callback_query?: {
      id?: string;
      from?: { id?: number };
      data?: string;
      message?: { chat?: { id?: number | string } };
    };
  };
  let update: Update;
  try {
    update = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  if (update.callback_query) {
    await handleCallback({ ...update.callback_query });
  } else if (update.message) {
    await handleMessage(update.message);
  }

  return Response.json({ ok: true });
}

export async function GET() {
  // smoke-check: webhook آماده است و دکمه‌ها درست ساخته می‌شوند
  const kb: InlineKeyboard = mainKeyboard();
  return Response.json({
    ok: true,
    bot: "takrah-growth",
    site: SITE_URL,
    buttons: kb.inline_keyboard.flat().map((b) => b.text),
    hint: "POST telegram updates here",
  });
}
