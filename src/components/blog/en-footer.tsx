import Link from "next/link";
import { Route } from "lucide-react";
import { siteConfig } from "@/lib/site";

/** فوتر سادهٔ نسخهٔ انگلیسی */
export function EnFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Route className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-base font-extrabold">TakRah</span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              A Persian-first tech blog, now opening its doors to English readers —
              plain-language guides on AI, security, and programming.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
            <Link href="/en" className="text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link
              href={siteConfig.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Telegram Channel
            </Link>
            <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © 2026 TakRah — All rights reserved.
        </p>
      </div>
    </footer>
  );
}
