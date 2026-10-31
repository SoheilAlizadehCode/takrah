"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Route,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Sparkles,
  ChevronDown,
  Library,
  BookOpen,
  Download,
} from "lucide-react";
import { categories, hrefs } from "@/lib/site";
import { studentBooks } from "@/lib/student";
import { CategoryIcon } from "./category-icon";

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {/* لوگو */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="تک‌راه — صفحه اصلی"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Route className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight">تک‌راه</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              مسیر تو به دنیای تکنولوژی
            </span>
          </span>
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
          <Link href="/" className={navLink}>
            <span className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              خانه
            </span>
          </Link>
          {/* پکیج‌ها — آیتم ویژه ناوبری */}
          <Link
            href="/packages"
            className="group relative flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-600/20 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" aria-hidden="true" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            </span>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            پکیج‌ها
          </Link>
          {/* نسخهٔ انگلیسی سایت */}
          <Link
            href="/en"
            className="rounded-lg border border-border px-2.5 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="English version"
          >
            EN
          </Link>
          {categories.map((c) =>
            c.id === "student" ? (
              // بخش دانش‌آموز: منوی کشویی کتاب‌های درسی
              <div key={c.id} className="group relative">
                <Link
                  href={hrefs.studentHome}
                  className={`${navLink} flex items-center gap-1.5`}
                  aria-haspopup="true"
                >
                  <span className="flex items-center gap-1.5">
                    <CategoryIcon id={c.id} className="h-3.5 w-3.5" />
                    {c.name}
                  </span>
                  <ChevronDown
                    className="h-3 w-3 transition-transform group-hover:rotate-180"
                    aria-hidden="true"
                  />
                </Link>
                <div className="invisible absolute start-0 top-full z-50 w-72 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg">
                    <Link
                      href="/student/download"
                      className="flex items-center gap-2 border-b border-border/50 bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      دانلود فایل‌های آموزشی
                      <span className="ms-auto flex h-2 w-2">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-60" aria-hidden="true" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                      </span>
                    </Link>
                    <Link
                      href={hrefs.studentHome}
                      className="flex items-center gap-2 border-b border-border/50 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-muted"
                    >
                      <Library className="h-4 w-4" aria-hidden="true" />
                      کتابخانه دانش‌آموزی تک‌راه
                    </Link>
                    {studentBooks.map((b) => (
                      <Link
                        key={b.slug}
                        href={hrefs.studentBook(b.slug)}
                        className="block px-4 py-2.5 transition-colors hover:bg-muted"
                      >
                        <span className="flex items-start gap-2 text-sm font-medium">
                          <BookOpen
                            className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span>
                            {b.title}
                            <span className="block text-[11px] font-normal text-muted-foreground">
                              {b.grade} · {b.field}
                            </span>
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={c.id} href={hrefs.category(c.id)} className={navLink}>
                <span className="flex items-center gap-1.5">
                  <CategoryIcon id={c.id} className="h-3.5 w-3.5" />
                  {c.name}
                </span>
              </Link>
            ),
          )}
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          {/* جستجو */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="جستجو در مقالات"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">جستجو…</span>
          </button>

          {/* تم روشن/تیره */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="تغییر حالت روشن و تیره"
          >
            <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
            <Moon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
          </button>

          {/* منوی موبایل */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* منوی کشویی موبایل */}
      {menuOpen && (
        <nav
          className="border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden"
          aria-label="ناوبری موبایل"
        >
          <ul className="grid grid-cols-2 gap-1.5">
            <li>
              <Link
                href="/"
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${navLink}`}
                onClick={() => setMenuOpen(false)}
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                خانه
              </Link>
            </li>
            <li className="col-span-2">
              <Link
                href="/packages"
                className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-600/20 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
                onClick={() => setMenuOpen(false)}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                پکیج‌ها و دموهای زنده
              </Link>
            </li>
            <li className="col-span-2">
              <Link
                href="/en"
                className={`flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground ${navLink}`}
                onClick={() => setMenuOpen(false)}
                aria-label="English version"
              >
                EN — English version
              </Link>
            </li>
            {categories.map((c) =>
              c.id === "student" ? (
                // بخش دانش‌آموز در منوی موبایل: عنوان + شاخه کتاب‌ها
                <li key={c.id} className="col-span-2">
                  <Link
                    href={hrefs.studentHome}
                    className={`flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-sm font-bold text-primary ${navLink}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <CategoryIcon id={c.id} className="h-4 w-4" />
                    {c.name} — کتابخانه کتاب‌های درسی
                  </Link>
                  <ul className="mt-1 space-y-1 ps-3">
                    <li>
                      <Link
                        href="/student/download"
                        className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        دانلود فایل‌های آموزشی
                      </Link>
                    </li>
                    {studentBooks.map((b) => (
                      <li key={b.slug}>
                        <Link
                          href={hrefs.studentBook(b.slug)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={() => setMenuOpen(false)}
                        >
                          <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {b.title}
                          <span className="text-[10px] text-muted-foreground/70">
                            ({b.grade})
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={c.id}>
                  <Link
                    href={hrefs.category(c.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${navLink}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <CategoryIcon id={c.id} className="h-4 w-4" />
                    {c.name}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
