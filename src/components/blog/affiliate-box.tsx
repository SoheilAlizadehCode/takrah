import { Gift } from "lucide-react";
import { TrackedLink } from "./tracked-link";
import { AFFILIATE_EXCHANGES } from "@/data/affiliates";

/**
 * باکس افیلیت صرافی‌ها — انتهای بدنهٔ مقاله‌های هدف.
 * هر کلیک با رویداد affiliate_click ثبت می‌شود تا از GA4 بفهمیم
 * کدام صرافی و کدام مقاله پول‌ساز است. متن صادقانه است: لینک‌ها
 * لینک معرف‌اند و برای کاربر هیچ هزینهٔ اضافه‌ای ندارند.
 */
export function AffiliateBox({
  articleSlug,
  location = "article-bottom",
}: {
  articleSlug: string;
  location?: string;
}) {
  return (
    <aside
      aria-label="صرافی‌های پیشنهادی با لینک دعوت"
      className="mt-10 rounded-xl border border-primary/25 bg-primary/[0.06] p-5"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-primary">
        <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
        ثبت‌نام در صرافی‌ها با لینک دعوت تک‌راه
      </p>
      <p className="mt-1.5 text-[0.95rem] leading-[2] text-foreground/85">
        اگر قصد ثبت‌نام داری، از لینک‌های زیر شروع کن — همین اول کارمزد تخفیف‌دار
        می‌گیری و تک‌راه هم بدون هزینهٔ اضافه برای تو، پشتیبانی می‌شود:
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {AFFILIATE_EXCHANGES.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-lg border border-border/70 bg-background p-4"
          >
            <p className="text-sm font-extrabold text-foreground">{p.name}</p>
            <p className="mt-1 flex-1 text-xs leading-6 text-muted-foreground">{p.perk}</p>
            {p.code ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                کد دعوت: <span className="font-bold text-foreground">{p.code}</span>
              </p>
            ) : null}
            <TrackedLink
              href={p.url}
              event="affiliate_click"
              params={{ partner: p.id, article: articleSlug, location }}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              ثبت‌نام با لینک دعوت
            </TrackedLink>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[0.72rem] leading-5 text-muted-foreground">
        🔗 این لینک‌ها لینک معرف (رفیوجنال) تک‌راه هستند؛ برای تو هیچ هزینهٔ اضافه‌ای
        ندارند و از کارمزد معاملاتت کسر نمی‌شوند.
      </p>
    </aside>
  );
}
