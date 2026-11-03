import { Sparkles, MessageCircle, ExternalLink } from "lucide-react";
import { TrackedLink } from "./tracked-link";
import { PACKAGE_CTA_PLANS } from "@/data/package-cta";

/**
 * باکس CTA پکیج‌های اتوماسیون کلینیک JSDevelop — انتهای مقاله‌های
 * کسب‌وکاری (PACKAGE_CTA_SLUGS). استایل سبز هماهنگ با صفحهٔ /packages.
 *
 * رویدادها:
 *  - package_cta_click     → کلیک «مشاهدهٔ پکیج‌ها» (params: article)
 *  - package_contact_click → کلیک واتساپ (params: method, article, location)
 */
export function PackageCtaBox({
  articleSlug,
  location = "article-cta",
}: {
  articleSlug: string;
  location?: string;
}) {
  return (
    <aside
      aria-label="پکیج‌های اتوماسیون کلینیک JSDevelop"
      className="mt-10 overflow-hidden rounded-xl border border-emerald-600/25 bg-gradient-to-l from-emerald-600/10 via-transparent to-emerald-600/10 p-5"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
        صاحب کلینیک یا کسب‌وکاری؟ نوبت‌دهی و پذیرش را اتومات کن
      </p>
      <p className="mt-1.5 text-[0.95rem] leading-[2] text-foreground/85">
        پکیج‌های <b>اتوماسیون کلینیک JSDevelop</b> (فعال از ۲۰۰۹): وب‌سایت اختصاصی، نوبت‌دهی
        آنلاین، ربات یادآوری تلگرام و منشی هوش مصنوعی ۲۴ ساعته — همه با{" "}
        <b>دموی زنده و تعاملی</b>:
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PACKAGE_CTA_PLANS.map((plan) => (
          <div
            key={plan.name}
            className="rounded-lg border border-emerald-600/20 bg-background p-4"
          >
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {plan.name}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {plan.price}
              {plan.name === "پایه" ? (
                <span className="text-xs font-medium text-muted-foreground"> — بدون ماهانه</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{plan.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <TrackedLink
          href="/packages"
          event="package_cta_click"
          params={{ article: articleSlug, location }}
          useExternal={false}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          مشاهدهٔ پکیج‌ها و دموی زنده
        </TrackedLink>
        <TrackedLink
          href="https://wa.me/989229033102"
          event="package_contact_click"
          params={{ method: "whatsapp", article: articleSlug, location }}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-bold transition-colors hover:bg-muted"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          مشاورهٔ رایگان در واتساپ
        </TrackedLink>
      </div>

      <p className="mt-3 text-[0.72rem] leading-5 text-muted-foreground">
        🎬 دموها تعاملی‌اند — کلیک کن و دقیقاً مثل یک بیمار واقعی نوبت بگیر تا کیفیت کار را
        با چشم خودت ببینی.
      </p>
    </aside>
  );
}
