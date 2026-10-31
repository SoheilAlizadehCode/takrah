"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route, Menu, X } from "lucide-react";

const NAV = [
  { label: "Home", href: "/en" },
  { label: "AI", href: "/en#articles" },
  { label: "Security", href: "/en#articles" },
  { label: "Programming", href: "/en#articles" },
];

/** هدر سادهٔ نسخهٔ انگلیسی — با دکمهٔ سوئیچ به فارسی */
export function EnHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";

  // سوئیچ به فارسی: اگر همین مقاله نسخهٔ فارسی دارد، مستقیم برو؛ وگرنه خانه
  const faHref = pathname.startsWith("/en/article/")
    ? pathname.replace(/^\/en/, "")
    : "/";

  const link =
    "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/en" className="flex items-center gap-2" aria-label="TakRah home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Route className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">TakRah</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className={link}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={faHref}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Read in Persian"
          >
            فارسی
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border/60 bg-background px-4 py-2 md:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
