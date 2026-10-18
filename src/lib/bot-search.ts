// Shared logic for the @TakrahTop_bot — search + growth engine for takrah.top
import { articles } from "@/data";
import type { Article } from "@/lib/blog-types";

const SITE = "https://takrah.top";
export const CHANNEL_URL = "https://t.me/takrahTop";
export const BOT_USERNAME = "TakrahTop_bot";

/* ─── نرمال‌سازی فارسی ─────────────────────────────────────────── */

/** Normalize Persian text for matching (ZWNJ, diacritics, Arabic variants, Persian digits). */
export function normalizeFa(input: string): string {
  return input
    .replace(/[\u064B-\u0652\u0640]/g, "") // harakat + tatweel
    .replace(/\u200c/g, " ") // ZWNJ -> space
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ─── جستجو ────────────────────────────────────────────────────── */

/** Score & rank articles against a free-text query; returns top matches. */
export function searchArticles(query: string, limit = 5): Article[] {
  const q = normalizeFa(query);
  if (!q) return [];
  const words = q.split(" ").filter((w) => w.length > 1);
  if (words.length === 0) return [];

  const scored = articles.map((a) => {
    const title = normalizeFa(a.title);
    const tags = normalizeFa(a.tags.join(" "));
    const excerpt = normalizeFa(a.excerpt);
    let score = 0;
    for (const w of words) {
      if (title.includes(w)) score += 3;
      if (tags.includes(w)) score += 2;
      if (excerpt.includes(w)) score += 1;
    }
    return { a, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((s) => s.a);
}

/** Latest articles (site order = newest last). */
export function recentArticles(limit = 5): Article[] {
  return [...articles].slice(-limit).reverse();
}

/**
 * محبوب‌ترین مقاله‌ها — دستچین‌شده بر اساس بازدید واقعی پست‌های کانال
 * (اکسل/ابزارها/نقشه‌راه/سایت‌سازی بالاترین ویو؛ پایتون هم روند صعودی).
 * هر ماه می‌شود این لیست را با دیتای جدید کانال به‌روز کرد.
 */
export function popularArticles(limit = 5): Article[] {
  const popularSlugs = [
    "build-website-with-wordpress",
    "programming-roadmap",
    "free-productivity-tools",
    "excel-for-everyday",
    "learn-python-from-zero",
  ];
  const found = popularSlugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is Article => Boolean(a));
  return found.slice(0, limit);
}

/* ─── لینک‌های اشتراک‌گذاری (بدون نیاز به inline mode) ─────────── */

function tmeShare(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** دکمه «معرفی ربات به دوستان». */
export function shareBotUrl(): string {
  return tmeShare(
    `https://t.me/${BOT_USERNAME}`,
    "ربات تک‌راه 🤖\nهر مقاله‌ای درباره هوش مصنوعی، برنامه‌نویسی و درآمد اینترنتی داری، اینجا جستجو کن:\n\n🌐 takrah.top\n📢 @takrahTop",
  );
}

/** دکمه «اشتراک‌گذاری این مقاله». */
export function shareArticleUrl(a: Article): string {
  return tmeShare(
    `${SITE}/article/${a.slug}`,
    `${a.title}\n\n📖 از تک‌راه — مرجع فارسی هوش مصنوعی`,
  );
}

/* ─── کیبورد اصلی ──────────────────────────────────────────────── */

export type InlineButton = { text: string; url?: string; callback_data?: string };
export type InlineKeyboard = { inline_keyboard: InlineButton[][] };

export function mainKeyboard(): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "🌐 سایت تک‌راه", url: SITE },
        { text: "📢 عضویت در کانال", url: CHANNEL_URL },
      ],
      [{ text: "📥 دانلود فایل‌های آموزشی", url: `${SITE}/student/download` }],
      [
        { text: "🏆 محبوب‌ترین مقاله‌ها", callback_data: "top" },
        { text: "🆕 جدیدترین مقاله‌ها", callback_data: "new" },
      ],
      [{ text: "📤 معرفی تک‌راه به دوستان", url: shareBotUrl() }],
    ],
  };
}

/** کیبورد با دکمه اشتراک‌گذاری مقاله مشخص. */
export function articleKeyboard(a: Article): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "📖 خواندن مقاله", url: `${SITE}/article/${a.slug}` },
        { text: "📤 برای دوستت بفرست", url: shareArticleUrl(a) },
      ],
      ...mainKeyboard().inline_keyboard.slice(0, 2),
    ],
  };
}

/* ─── متن‌های پاسخ ─────────────────────────────────────────────── */

function line(a: Article): string {
  const meta = `${a.readMinutes} دقیقه مطالعه`;
  return `<b><a href="${SITE}/article/${a.slug}">${escapeHtml(a.title)}</a></b>\n${meta}`;
}

export function searchReplyMessage(query: string): string {
  const hits = searchArticles(query);
  if (hits.length === 0) {
    return (
      "موردی پیدا نشد! 🤔\n\nیک کلمه‌ی ساده‌تر امتحان کن، مثلاً:\n• <code>پایتون</code>\n• <code>درآمد</code>\n• <code>صرافی</code>\n• <code>امنیت</code>\n• <code>هوش مصنوعی</code>\n\nهمه‌ی مقاله‌ها: https://takrah.top"
    );
  }
  const body = hits.map(line).join("\n\n");
  return `🔍 نتیجه‌ی جستجوی «${escapeHtml(query)}»:\n\n${body}\n\n🌐 takrah.top`;
}

export function topReplyMessage(): string {
  const hits = popularArticles();
  const body = hits.map(line).join("\n\n");
  return `🏆 محبوب‌ترین مقاله‌های تک‌راه (انتخاب مخاطب‌ها):\n\n${body}\n\n💡 موضوع بنویس تا دقیق‌تر جستجو کنم!`;
}

export function newReplyMessage(): string {
  const hits = recentArticles();
  const body = hits.map(line).join("\n\n");
  return `🆕 تازه‌ترین مقاله‌های تک‌راه:\n\n${body}`;
}

export function welcomeText(isMember: boolean | null): string {
  const memberLine =
    isMember === false
      ? "\n❗️به‌نظر می‌رسه هنوز عضو کانال نشدی؛ جدیدترین مقاله‌ها اونجا منتشر می‌شن!"
      : "";
  return [
    "سلام! 👋 من ربات تک‌راه هستم.",
    "",
    "هر موضوعی درباره‌ی هوش مصنوعی، برنامه‌نویسی و درآمد اینترنتی داشته باشی، برات مقاله‌ش رو پیدا می‌کنم. کافیه کلمه‌ش رو بنویسی: «پایتون»، «درآمد»، «صرافی»، «امنیت» و...",
    "📥 فایل‌های آموزشی کتاب‌های درسی هم تو سایت قابل دانلوده: takrah.top/student/download",
    memberLine,
    "",
    "🌐 takrah.top | 📢 @takrahTop",
  ].join("\n");
}

/** سلام عمیق‌لینکی: /start ref_<slug> — وقتی کسی مقاله را از دوستش گرفته. */
export function refWelcomeText(a: Article): string {
  return [
    "سلام! 👋 یه دوستت این مقاله رو برات فرستاده:",
    "",
    `<b><a href="${SITE}/article/${a.slug}">${escapeHtml(a.title)}</a></b>`,
    "",
    "من ربات تک‌راه هستم؛ هر موضوعی درباره هوش مصنوعی، برنامه‌نویسی و درآمد اینترنتی داشته باشی، بنویس تا مقاله‌ش رو پیدا کنم!",
    "",
    "🌐 takrah.top | 📢 @takrahTop",
  ].join("\n");
}

export const HELP = welcomeText(null);
