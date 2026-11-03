"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { gaEvent } from "@/lib/ga";
import { EN_ARTICLE_SLUGS } from "@/data/en-slugs";

/**
 * دکمهٔ تغییر زبان — طبق تصمیم محصول، همیشه «اولین آیتم» نوار ناوبری است
 * (قبل از خانه/Home و همهٔ دسته‌ها) و در هر دو نسخهٔ فارسی و انگلیسی شکل یکسانی دارد.
 *
 * مقصد هوشمند است:
 * - فارسی ← انگلیسی: اگر همین صفحه نسخهٔ انگلیسی دارد، همان صفحه باز می‌شود
 *   (مقاله با اسلاگ یکسان، دسته‌بندی)، وگرنه صفحهٔ اصلی /en
 * - انگلیسی ← فارسی: چون اسلاگ مقاله‌ها یکی است، /en از مسیر حذف می‌شود؛ وگرنه /
 */
export function LanguageSwitch({ from }: { from: "fa" | "en" }) {
  const pathname = usePathname() ?? "/";
  const to = from === "fa" ? "en" : "fa";

  let href = from === "fa" ? "/en" : "/";

  if (from === "fa") {
    // مقالهٔ فارسی → مقالهٔ انگلیسی هم‌اسلاگ
    const article = pathname.match(/^\/article\/([a-z0-9-]+)$/);
    if (article && EN_ARTICLE_SLUGS.includes(article[1])) {
      href = `/en${pathname}`;
    } else if (/^\/category\/(ai|mobile|security|software|web-tools|programming)$/.test(pathname)) {
      // دستهٔ فارسی → دستهٔ انگلیسی هم‌شناسه (دانش‌آموز در انگلیسی نداریم)
      href = `/en${pathname}`;
    }
  } else if (pathname === "/en" || pathname.startsWith("/en/")) {
    // انگلیسی → فارسی: اسلاگ‌های مقاله و دسته یکی است
    href = pathname.replace(/^\/en/, "") || "/";
  }

  const isFa = from === "fa";

  return (
    <Link
      href={href}
      onClick={() => gaEvent("language_switch", { from, to, path: pathname })}
      aria-label={isFa ? "Switch to English version" : "خواندن سایت به فارسی"}
      title={isFa ? "English version" : "نسخهٔ فارسی"}
      className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-sky-600/30 bg-gradient-to-l from-sky-600/15 via-sky-500/10 to-indigo-500/10 px-3 py-2 text-sm font-bold text-sky-800 shadow-sm transition-all hover:border-sky-600/50 hover:from-sky-600/25 hover:via-sky-500/15 hover:to-indigo-500/15 hover:shadow-md dark:border-sky-400/30 dark:from-sky-400/15 dark:via-sky-400/10 dark:to-indigo-400/10 dark:text-sky-300 dark:hover:from-sky-400/25 dark:hover:border-sky-400/50"
    >
      <Globe
        className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-12"
        aria-hidden="true"
      />
      {isFa ? "EN" : "فارسی"}
    </Link>
  );
}
