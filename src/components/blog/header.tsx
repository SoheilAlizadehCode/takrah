"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Route, Search, Menu, X, Sun, Moon, Home } from "lucide-react";
import { categories, hrefs } from "@/lib/site";
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
          {categories.map((c) => (
            <Link key={c.id} href={hrefs.category(c.id)} className={navLink}>
              <span className="flex items-center gap-1.5">
                <CategoryIcon id={c.id} className="h-3.5 w-3.5" />
                {c.name}
              </span>
            </Link>
          ))}
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
            {categories.map((c) => (
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
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
