import Link from "next/link";
import { Route, Mail } from "lucide-react";
import { categories, hrefs, siteConfig, staticPages } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* درباره */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Route className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-base font-extrabold">تک‌راه</span>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* دسته‌بندی‌ها */}
          <nav aria-label="دسته‌بندی‌های سایت">
            <h3 className="mb-3 text-sm font-bold">دسته‌بندی‌ها</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={hrefs.category(c.id)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* صفحات و تماس */}
          <div className="space-y-3">
            <nav aria-label="صفحات سایت">
              <h3 className="mb-3 text-sm font-bold">تک‌راه</h3>
              <ul className="space-y-2">
                {staticPages.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={hrefs.page(p.id)}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {siteConfig.email}
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-center sm:flex-row sm:text-start">
          <p className="text-xs text-muted-foreground">
            © {siteConfig.founded} تک‌راه — تمامی حقوق محفوظ است.
          </p>
          <p className="text-xs text-muted-foreground">
            ساخته‌شده با علاقه برای جامعه فارسی‌زبان تکنولوژی
          </p>
        </div>
      </div>
    </footer>
  );
}
