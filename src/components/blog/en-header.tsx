"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Route, Menu, X, Sun, Moon, Home, Sparkles } from "lucide-react";
import { LanguageSwitch } from "./language-switch";
import { CategoryIcon, CATEGORY_ICON_COLORS } from "./category-icon";
import { EN_NAV_CATEGORY_IDS, EN_CATEGORY_NAMES } from "@/data/en";

/**
 * هدر نسخهٔ انگلیسی — آینهٔ کامل هدر فارسی است (همان آیتم‌ها، همان ترتیب،
 * همان اندازهٔ آیکون‌ها) به‌جز بخش «دانش‌آموز» که طبق تصمیم محصول فقط
 * در نسخهٔ فارسی وجود دارد. دکمهٔ تغییر زبان همیشه اولین آیتم ناوبری است.
 */
export function EnHeader() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname() ?? "";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // سوئیچ به فارسی: اگر همین مقاله/دسته نسخهٔ فارسی دارد، مستقیم برو؛ وگرنه خانه
  const faHref = pathname.startsWith("/en") ? pathname.replace(/^\/en/, "") || "/" : "/";

  const navLink =
    "rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {/* لوگو */}
        <Link
          href="/en"
          className="flex items-center gap-2.5"
          aria-label="TakRah — home"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Route className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight">TakRah</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              Your path into tech
            </span>
          </span>
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className="mx-auto hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {/* Language switch — always the first nav item */}
          <span className="me-1 flex items-center">
            <LanguageSwitch from="en" />
          </span>
          <Link href="/en" className={navLink}>
            <span className="flex items-center gap-1.5">
              <Home className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Home
            </span>
          </Link>
          {/* Packages — highlighted nav item, mirrors the Persian header */}
          <Link
            href="/packages"
            className="group relative flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-600/20 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" aria-hidden="true" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            </span>
            <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" />
            Packages
          </Link>
          {EN_NAV_CATEGORY_IDS.map((id) => (
            <Link key={id} href={`/en/category/${id}`} className={navLink}>
              <span className="flex items-center gap-1.5">
                <CategoryIcon id={id} className={`h-[18px] w-[18px] ${CATEGORY_ICON_COLORS[id] ?? ""}`} />
                {EN_CATEGORY_NAMES[id] ?? id}
              </span>
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          {/* Language switch — always visible on the bar itself for mobile/tablet */}
          <span className="lg:hidden">
            <LanguageSwitch from="en" />
          </span>
          {/* حالت روشن/تیره */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle light and dark mode"
          >
            <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
            <Moon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
          </button>

          {/* منوی موبایل */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      {open && (
        <nav
          className="border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="grid grid-cols-2 gap-1.5">
            <li>
              <Link
                href="/en"
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground ${navLink}`}
                onClick={() => setOpen(false)}
              >
                <Home className="h-5 w-5 text-primary" aria-hidden="true" />
                Home
              </Link>
            </li>
            <li className="col-span-2">
              <Link
                href="/packages"
                className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-600/20 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
                onClick={() => setOpen(false)}
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Packages &amp; live demos
              </Link>
            </li>
            {EN_NAV_CATEGORY_IDS.map((id) => (
              <li key={id}>
                <Link
                  href={`/en/category/${id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${navLink}`}
                  onClick={() => setOpen(false)}
                >
                  <CategoryIcon id={id} className={`h-5 w-5 ${CATEGORY_ICON_COLORS[id] ?? ""}`} />
                  {EN_CATEGORY_NAMES[id] ?? id}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
