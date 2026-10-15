// Telegram webhook for @TakrahTop_bot — article search bot for takrah.top
// Telegram sends POST updates here; we reply via the Bot API and always return 200.
import { NextRequest } from "next/server";
import { searchReplyMessage, recentReplyMessage, WELCOME, HELP } from "@/lib/bot-search";

export const dynamic = "force-dynamic";

// Telegram "secret_token" webhook verification (repo is private; rotate if needed).
const WEBHOOK_SECRET = "tk9f4e2c1a7b35d8e0f6a4c2b9d17e35";

const TOKEN = "8681245270:AAHuamrLbL8Fhk-sJCleAejlWpo6F0jpNzc";

async function reply(chatId: number | string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // swallow — Telegram retries failed webhooks; never throw after replying point
  }
}

export async function POST(req: NextRequest) {
  // Verify the request really came from Telegram
  if (req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  let update: {
    message?: { text?: string; chat?: { id?: number | string } };
  };
  try {
    update = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  const chatId = update.message?.chat?.id;
  const text = (update.message?.text || "").trim();
  if (!chatId || !text) return Response.json({ ok: true });

  if (text.startsWith("/start")) {
    await reply(chatId, WELCOME);
  } else if (text.startsWith("/help")) {
    await reply(chatId, HELP);
  } else if (text.startsWith("/recent")) {
    await reply(chatId, recentReplyMessage());
  } else {
    await reply(chatId, searchReplyMessage(text));
  }

  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({ ok: true, bot: "takrah-search", hint: "POST telegram updates here" });
}
