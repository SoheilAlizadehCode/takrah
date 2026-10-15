// Shared search logic for the @TakrahTop_bot article-search feature.
import { articles } from "@/data";
import type { Article } from "@/lib/blog-types";

const SITE = "https://takrah.top";

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

/** Format one article line for Telegram HTML messages. */
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

export function recentReplyMessage(): string {
  const hits = recentArticles();
  const body = hits.map(line).join("\n\n");
  return `🆕 تازه‌ترین مقاله‌های تک‌راه:\n\n${body}\n\n🌐 takrah.top`;
}

export const WELCOME = [
  "سلام! 👋 من ربات تک‌راه هستم.",
  "",
  "مقاله‌های سایت takrah.top رو برات جستجو می‌کنم.",
  "",
  "طریقه استفاده:",
  "• هر موضوعی رو بنویس: «پایتون»، «درآمد با هوش مصنوعی»، «صرافی»، «امنیت» و...",
  "• /recent — تازه‌ترین مقاله‌ها",
  "• /help — راهنما",
  "",
  "🌐 https://takrah.top",
  "📢 @takrahTop",
].join("\n");

export const HELP = WELCOME;
