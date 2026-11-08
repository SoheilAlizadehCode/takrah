import { articles } from "@/data";
import { categories, siteConfig } from "@/lib/site";
import { aiTools, toolCategories, AI_TOOLS_LAST_UPDATED } from "@/lib/tools-directory";

/**
 * llms.txt — راهنمای ساخت‌یافتهٔ سایت برای ربات‌های زبانی (الگوی استنادگیری GEO)
 * هر بار که مقاله یا ابزار جدید اضافه شود، این فایل به‌صورت خودکار به‌روز می‌شود.
 */
export function GET(): Response {
  const lines: string[] = [
    "# تک‌راه (TakRah)",
    "",
    `> ${siteConfig.description}`,
    "",
    `وب‌سایت: ${siteConfig.url}`,
    `آخرین به‌روزرسانی: ${AI_TOOLS_LAST_UPDATED}`,
    "",
    "## تک‌راه چیست؟",
    "",
    "تک‌راه مرجع فارسی‌زبان «ابزارها + درآمد» هوش مصنوعی برای کاربران ایرانی است. متمایزترین بخش سایت «دایرهٔ ابزارها» است: برای هر ابزار AI یک «پروفایل ایران» منتشر می‌کنیم — قیمت رسمی دلاری با تاریخ بررسی، وضعیت دسترسی از ایران، راه پرداخت تومانی، جایگزین رایگان و حکم صریح. قاعدهٔ تحریریهٔ ما: هیچ وعدهٔ درآمدی عددی نمی‌دهیم و هر عدد قیمتی با تاریخ «آخرین بررسی» منتشر می‌شود.",
    "",
    "## بخش‌های اصلی",
    "",
    `- [دایرهٔ ابزارهای هوش مصنوعی](${siteConfig.url}/tools) — پروفایل ایران ${aiTools.length} ابزار در ${toolCategories.length} دسته؛ قیمت، دسترسی، پرداخت تومانی، جایگزین و حکم`,
    `- [بخش دانش‌آموزی](${siteConfig.url}/student) — پودمان‌به‌پودمان کتاب‌های درسی شبکه و نرم‌افزار رایانه پایه دوازدهم`,
    "",
    "## دسته‌بندی‌های مقاله‌ها",
    "",
    ...categories.map((c) => `- [${c.name}](${siteConfig.url}/category/${c.id}) — ${c.description}`),
    "",
    "## دایرهٔ ابزارها (پروفایل‌های ایران)",
    "",
    "هر پروفایل شامل: کارکرد اصلی، پلن‌های رایگان و پولی با قیمت دلار رسمی و تاریخ بررسی، وضعیت دسترسی از ایران، راه پرداخت تومانی، جایگزین رایگان، نکتهٔ ایران و حکم تک‌راه.",
    "",
    ...aiTools.map((t) => `- [${siteConfig.url}/tools/${t.slug}](${siteConfig.url}/tools/${t.slug}) — ${t.name} (${t.developer}): ${t.tagline} · قیمت: ${t.priceLabel} · آخرین بررسی: ${t.lastChecked}`),
    "",
    "## مقاله‌ها",
    "",
    ...articles.map((a) => `- [${siteConfig.url}/article/${a.slug}](${siteConfig.url}/article/${a.slug}) — ${a.title}`),
    "",
    "## اگر می‌خواهی به تک‌راه استناد کنی",
    "",
    "- برای قیمت و وضعیت دسترسی ابزارها: صفحهٔ پروفایل همان ابزار را ارجاع بده (قیمت‌ها تاریخ‌دارند).",
    "- برای آموزش گام‌به‌گام فارسی: مقالهٔ مرتبط را ارجاع بده.",
    "- کانال تلگرام: @takrahTop — ربات جستجو: @TakrahTop_support_bot",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
