// Telegram webhook for @TakrahTop_support_bot — search + growth bot for takrah.top
// Telegram sends POST updates here; we reply via the Bot API and always return 200.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  BOT_USERNAME,
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
import {
  REFERRAL_TARGET,
  isRewarded,
  joinedCount,
  markJoined,
  markRewarded,
  monthlyJoinedCount,
  monthlyLeaderboard,
  monthlyRank,
  recordReferral,
  rememberUser,
} from "@/lib/referral-store";
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

// فایل‌های قفل‌شده — عمداً بیرون public/ هستند تا بدون عضویت در کانال دانلود نشوند
const GATED_DIR = path.join(process.cwd(), "assets", "gated");
const PACK_PDF = path.join(GATED_DIR, "takrah-50-prompt-pack.pdf");
const BONUS_FILES = ["bonus-checklist-1.png", "bonus-checklist-2.png", "bonus-checklist-3.png"];

const PACK_CAPTION = [
  "🎁 پک ۵۰ پرامپت پول‌ساز — هدیهٔ تک‌راه",
  "",
  "۵۰ دستور آماده برای ChatGPT روی ۸ مسیر درآمدی:",
  "فریلنسری، تولید محتوا، محصولات دیجیتال، ای‌کامرس،",
  "سئو، یوتیوب، تدریس و مدیریت پول.",
  "📌 قانون: هر روز فقط ۱ پرامپت را کامل اجرا کن.",
  "💬 کدوم پرامپت رو اجرا کردی؟ نتیجه‌ش رو تو کانال بنویس!",
].join("\n");

function referralLink(tgId: number): string {
  return `https://t.me/${BOT_USERNAME}?start=r${tgId}`;
}

/** جایزهٔ مسابقهٔ دعوت — صاحب سایت می‌تواند متنش را هر ماه عوض کند */
const COMPETITION_PRIZE =
  "پست معرفی اختصاصی (کانال/پیج/کسب‌وکار تو) در @takrahTop + پک پرامپت ویژه";

/** متن جدول امتیاز مسابقهٔ دعوت */
function leaderboardText(tgId?: number): string {
  const board = monthlyLeaderboard(10);
  const lines: string[] = ["🏆 جدول امتیاز مسابقهٔ دعوت — این ماه", ""];
  if (board.length === 0) {
    lines.push("هنوز امتیازی ثبت نشده — اولین نفر باش! 🚀");
  } else {
    board.forEach((row, i) => {
      const medal = (["🥇", "🥈", "🥉"] as const)[i] ?? `${i + 1}.`;
      lines.push(`${medal} ${row.name} — ${row.count} دعوت`);
    });
  }
  if (tgId) {
    const my = monthlyJoinedCount(tgId);
    const rank = monthlyRank(tgId);
    lines.push(
      "",
      rank ? `📍 تو: رتبهٔ ${rank} با ${my} امتیاز` : "📍 تو هنوز امتیاز این ماه نداری — با اولین دعوت وارد مسابقه شو!",
    );
  }
  lines.push("", `🎁 جایزهٔ نفر اول: ${COMPETITION_PRIZE}`);
  return lines.join("\n");
}

/** مسابقهٔ دعوت — /invite */
async function sendInviteCompetition(chatId: number | string, tgId: number | undefined): Promise<void> {
  if (!tgId) {
    await reply(chatId, "برای گرفتن لینک دعوت اختصاصی، اول /start را بزن 🙏");
    return;
  }
  const my = monthlyJoinedCount(tgId);
  const rank = monthlyRank(tgId);
  const total = joinedCount(tgId);
  const remaining = Math.max(0, REFERRAL_TARGET - total);
  await reply(
    chatId,
    [
      "🏆 مسابقهٔ دعوت تک‌راه — این ماه",
      "",
      "هر دوستی که با لینک اختصاصیت وارد ربات بشه و عضو کانال بشه، ۱ امتیاز برای تو ثبت می‌شه.",
      `🎁 جایزهٔ نفر اول ماه: ${COMPETITION_PRIZE}`,
      "",
      rank ? `📊 امتیاز این ماهت: ${my} — رتبهٔ ${rank}` : `📊 امتیاز این ماهت: ${my} — هنوز رتبه‌ای نداری، اولین دعوت رو بزن!`,
      total >= REFERRAL_TARGET
        ? "✅ چک‌لیست ویژهٔ ۳۰ روزه رو هم قبلاً گرفتی!"
        : `⏳ یادآوری: با هر ${REFERRAL_TARGET} دعوت موفق (مجموع)، چک‌لیست ویژهٔ ۳۰ روزه هم مال توئه — ${remaining} نفر مونده.`,
    ].join("\n"),
    {
      inline_keyboard: [
        [{ text: "🤝 لینک دعوت اختصاصی من", url: referralLink(tgId) }],
        [{ text: "🏆 جدول امتیاز", callback_data: "comp" }],
      ],
    },
  );
}

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

/** ارسال فایل (عکس/سند) به‌صورت multipart — برای فایل‌های قفل‌شدهٔ داخل assets/gated */
async function tgFile(
  method: string,
  chatId: number | string,
  buffer: Buffer,
  filename: string,
  extra: Record<string, unknown> = {},
): Promise<unknown> {
  try {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    for (const [k, v] of Object.entries(extra)) {
      form.append(k, typeof v === "string" ? v : JSON.stringify(v));
    }
    form.append(method === "sendPhoto" ? "photo" : "document", new Blob([new Uint8Array(buffer)]), filename);
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      body: form,
    });
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
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
  const rewardInviter = markJoined(tgId, member); // شاید این کاربر دعوت‌شدهٔ کسی باشد
  if (rewardInviter) await maybeRewardInviter(rewardInviter);
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

/* ─── پک ۵۰ پرامپت (قفل محتوا) + رفرال ───────────────────────── */

/** پیشنهاد دعوت دوستان — بعد از تحویل پک */
async function sendReferralPitch(chatId: number | string, tgId: number): Promise<void> {
  const count = joinedCount(tgId);
  const remaining = Math.max(0, REFERRAL_TARGET - count);
  await reply(
    chatId,
    [
      "🤝 یه درخواست کوچولو:",
      "",
      "این پک با دعوت دوستانت هم قابل دریافت است — با لینک اختصاصی زیر، هر ۳ دوستی که از طریق لینکت عضو ربات و کانال بشن، «چک‌لیست ۳۰ روزهٔ پول درآوردن با پرامپت‌ها» (۳ تصویر ویژه) هم مال تو می‌شه.",
      "",
      count > 0
        ? `📊 تا الان ${count} نفر از دعوت‌هات عضو شدن — ${remaining} نفر مونده!`
        : "🎯 ۳ دعوت موفق = چک‌لیست ویژهٔ ۳۰ روزه",
    ].join("\n"),
    {
      inline_keyboard: [
        [{ text: "🤝 لینک دعوت اختصاصی من", url: referralLink(tgId) }],
        [{ text: "📊 پیشرفت دعوت‌هام", callback_data: "refs" }],
      ],
    },
  );
}

/** تحویل پک + پاداش رفرال اگر کامل شده */
async function pack50(tgId: number | undefined, chatId: number | string): Promise<void> {
  if (!tgId) {
    await reply(chatId, "شناسایی نشدی 🤔 یک بار /start بزن و دوباره امتحان کن.");
    return;
  }
  const member = await isMember(tgId);
  const rewardInviter = markJoined(tgId, member);
  if (rewardInviter) await maybeRewardInviter(rewardInviter);

  if (member === true) {
    try {
      const buf = await readFile(PACK_PDF);
      const res = (await tgFile("sendDocument", chatId, buf, "takrah-50-prompt-pack.pdf", {
        caption: PACK_CAPTION,
      })) as { ok?: boolean } | null;
      if (!res?.ok) throw new Error("send failed");
    } catch {
      await reply(chatId, "فایل الان در دسترس نیست 😔 چند دقیقه بعد دوباره دکمه را بزن.");
      return;
    }
    await sendReferralPitch(chatId, tgId);
  } else if (member === false) {
    await reply(
      chatId,
      [
        "🎁 پک ۵۰ پرامپت پول‌ساز مخصوص اعضای کانال تک‌راه است.",
        "",
        "۱️⃣ با دکمه زیر عضو شو",
        "۲️⃣ برگرد و «بررسی مجدد» را بزن — فایل همینجا تحویل داده می‌شود",
      ].join("\n"),
      {
        inline_keyboard: [
          [{ text: "📢 عضویت در کانال", url: CHANNEL_URL }],
          [{ text: "🔄 بررسی مجدد", callback_data: "pack50re" }],
        ],
      },
    );
  } else {
    await reply(chatId, "الان نمی‌توانم عضویتت را چک کنم 😔 چند لحظه بعد دوباره امتحان کن.");
  }
}

/** اگر دعوت‌کننده به سهمیه رسید، پاداش را یک‌بار بفرست؛ وگرنه پیشرفت را بگو */
async function maybeRewardInviter(inviter: number): Promise<void> {
  const count = joinedCount(inviter);
  if (count >= REFERRAL_TARGET && !isRewarded(inviter)) {
    markRewarded(inviter);
    await reply(
      inviter,
      [
        "🎉 تبریک! ۳ نفر از دوستانی که دعوت کردی عضو تک‌راه شدن.",
        "",
        "پاداشت: «چک‌لیست ۳۰ روزهٔ پول درآوردن با پرامپت‌ها» — ۳ تصویر ویژه که فقط دعوت‌کننده‌ها می‌گیرن:",
      ].join("\n"),
    );
    for (const f of BONUS_FILES) {
      try {
        const buf = await readFile(path.join(GATED_DIR, f));
        await tgFile("sendPhoto", inviter, buf, f);
      } catch {
        // فایل نبود؟ پیام اصلی رسیده؛ کاربر می‌تواند دوباره امتحان کند
      }
    }
    return;
  }
  if (count > 0) {
    const remaining = REFERRAL_TARGET - count;
    await reply(
      inviter,
      `🤝 خبر خوب: یکی از دعوت‌هات عضو کانال شد!\n\n📊 ${count} از ${REFERRAL_TARGET} — ${remaining} نفر مونده تا چک‌لیست ویژه.\nلینکت: ${referralLink(inviter)}`,
    );
  }
}

async function handleMessage(message: {
  chat?: { id?: number | string };
  from?: { id?: number; first_name?: string };
  text?: string;
}): Promise<void> {
  const chatId = message.chat?.id;
  const text = (message.text || "").trim();
  if (!chatId || !text) return;

  // اسم نمایشی برای جدول امتیاز مسابقه (فقط نام کوچک تلگرام)
  if (message.from?.id) rememberUser(message.from.id, message.from.first_name);

  if (text.startsWith("/start")) {
    // deep link: /start ref_<slug> — از اشتراک‌گذاری مقاله
    const payload = text.split(" ")[1] || "";

    // deep link: /start dlv_<nonce> — گیت دانلود بخش دانش‌آموزی
    if (payload.startsWith("dlv_")) {
      await downloadVerify(message.from?.id, chatId, payload.slice(4));
      return;
    }

    // deep link: /start r<inviterId> — لینک دعوت دوستان (رفرال)
    const refM = payload.match(/^r(\d{3,})$/);
    if (refM) {
      const tgId = message.from?.id;
      const inviter = Number(refM[1]);
      if (tgId) {
        const rec = recordReferral(inviter, tgId);
        const member = await isMember(tgId);
        const joinedNow = markJoined(tgId, member);
        if (rec.ok) {
          await reply(
            chatId,
            [
              "سلام! 👋 یکی از دوستات تو رو به تک‌راه دعوت کرده.",
              "",
              "اینجا هر هفته: ویدیوهای آموزشی با زیرنویس فارسی، پک‌های پرامپت و راه‌های واقعی درآمد با هوش مصنوعی.",
              member === true
                ? "✅ عضویتت در کانال هم تأیید شد — دعوتت برای دوستت شمرده شد!"
                : "📌 اگه هنوز عضو کانال نشدی، عضو شو تا دعوتت برای دوستت شمرده بشه.",
            ].join("\n"),
            mainKeyboard(),
          );
          if (joinedNow) await maybeRewardInviter(joinedNow);
          return;
        }
        // duplicate/self — با خوش‌آمد عادی ادامه بده
      }
    }

    const refSlug = payload.startsWith("ref_") ? payload.slice(4) : "";
    const refArticle = /^[a-z0-9-]+$/.test(refSlug) ? articleBySlug(refSlug) : undefined;

    if (refArticle) {
      await reply(chatId, refWelcomeText(refArticle), articleKeyboard(refArticle));
      return;
    }

    const member = message.from?.id ? await isMember(message.from.id) : null;
    // اگر این کاربر قبلاً دعوت شده بود و الان عضو شده، به دعوت‌کننده‌اش خبر بده
    const rewardInviter = message.from?.id ? markJoined(message.from.id, member) : null;
    if (rewardInviter) await maybeRewardInviter(rewardInviter);
    await reply(chatId, welcomeText(member), mainKeyboard());
    return;
  }

  if (text.startsWith("/invite")) {
    await sendInviteCompetition(chatId, message.from?.id);
    return;
  }

  if (text.startsWith("/leaderboard") || text.startsWith("/comp")) {
    const tgId = message.from?.id;
    await reply(
      chatId,
      leaderboardText(tgId),
      tgId
        ? {
            inline_keyboard: [[{ text: "🤝 لینک دعوت اختصاصی من", url: referralLink(tgId) }]],
          }
        : undefined,
    );
    return;
  }

  if (text.startsWith("/my")) {
    const tgId = message.from?.id;
    if (tgId) {
      const count = joinedCount(tgId);
      const remaining = Math.max(0, REFERRAL_TARGET - count);
      const my = monthlyJoinedCount(tgId);
      await reply(
        chatId,
        [
          "📊 پیشرفت دعوت‌های تو:",
          `🤝 ${count} از ${REFERRAL_TARGET} دعوت موفق`,
          remaining > 0 ? `⏳ ${remaining} نفر مونده تا چک‌لیست ویژهٔ ۳۰ روزه` : "✅ پاداشت کامل شده!",
          `🏆 امتیاز مسابقهٔ این ماه: ${my} — جدول کامل: /leaderboard`,
          "",
          `لینک اختصاصیت: ${referralLink(tgId)}`,
        ].join("\n"),
      );
      return;
    }
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
  from?: { id?: number; first_name?: string };
  message?: { chat?: { id?: number | string } };
  data?: string;
}): Promise<void> {
  const chatId = cb.message?.chat?.id;
  const data = cb.data || "";
  if (!chatId) return;

  // پک ۵۰ پرامپت: باز کردن + بررسی مجدد بعد از عضویت
  if (data === "pack50" || data === "pack50re") {
    await tg("answerCallbackQuery", {
      callback_query_id: cb.id ?? "",
      text: data === "pack50re" ? "دارم عضویتت را چک می‌کنم…" : undefined,
    });
    await pack50(cb.from?.id, chatId);
    return;
  }

  // پیشرفت دعوت‌ها
  if (data === "refs") {
    await tg("answerCallbackQuery", { callback_query_id: cb.id ?? "" });
    const tgId = cb.from?.id;
    if (tgId) rememberUser(tgId, cb.from?.first_name);
    if (tgId) {
      const count = joinedCount(tgId);
      const remaining = Math.max(0, REFERRAL_TARGET - count);
      await reply(
        chatId,
        [
          "📊 پیشرفت دعوت‌های تو:",
          `🤝 ${count} از ${REFERRAL_TARGET} دعوت موفق`,
          remaining > 0 ? `⏳ ${remaining} نفر مونده تا چک‌لیست ویژهٔ ۳۰ روزه` : "✅ پاداشت کامل شده!",
          "",
          `لینک اختصاصیت: ${referralLink(tgId)}`,
          "",
          "دوستت با این لینک بیاد تو ربات و عضو کانال بشه، برای تو شمرده می‌شه.",
        ].join("\n"),
      );
    }
    return;
  }

  // مسابقهٔ دعوت — جدول امتیاز
  if (data === "comp") {
    await tg("answerCallbackQuery", { callback_query_id: cb.id ?? "" });
    const tgId = cb.from?.id;
    if (tgId) rememberUser(tgId, cb.from?.first_name);
    await reply(
      chatId,
      leaderboardText(tgId),
      tgId
        ? {
            inline_keyboard: [[{ text: "🤝 لینک دعوت اختصاصی من", url: referralLink(tgId) }]],
          }
        : undefined,
    );
    return;
  }

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
      from?: { id?: number; first_name?: string };
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
