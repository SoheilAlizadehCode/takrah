// Telegram webhook for @TakrahTop_bot — search + growth bot for takrah.top
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
import { articles } from "@/data";

export const dynamic = "force-dynamic";

// Telegram "secret_token" webhook verification (repo is private; rotate if needed).
const WEBHOOK_SECRET = "tk9f4e2c1a7b35d8e0f6a4c2b9d17e35";

const TOKEN = "8681245270:AAHuamrLbL8Fhk-sJCleAejlWpo6F0jpNzc";
const CHANNEL = "@takrahTop";
const SITE_URL = "https://takrah.top";

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
  message?: { chat?: { id?: number | string } };
  data?: string;
}): Promise<void> {
  const chatId = cb.message?.chat?.id;
  const data = cb.data || "";
  if (!chatId) return;

  await tg("answerCallbackQuery", { callback_query_id: (cb as { id?: string }).id ?? "" });

  if (data === "top") await reply(chatId, topReplyMessage(), mainKeyboard());
  else if (data === "new") await reply(chatId, newReplyMessage(), mainKeyboard());
}

export async function POST(req: NextRequest) {
  // Verify the request really came from Telegram
  if (req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  type Update = {
    message?: Parameters<typeof handleMessage>[0];
    callback_query?: { id?: string; data?: string; message?: { chat?: { id?: number | string } } };
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
