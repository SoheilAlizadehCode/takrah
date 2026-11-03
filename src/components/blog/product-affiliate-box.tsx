import { ShoppingBag } from "lucide-react";
import { TrackedLink } from "./tracked-link";
import {
  AFFILIATE_PRODUCTS,
  AFFILIATE_STORES,
  PRODUCT_BOX_SLUGS,
  type AffiliateProduct,
} from "@/data/affiliates";

/**
 * باکس محصول‌های افیلیو (دیجی‌کالا / اسنپ‌شاپ) — انتهای مقاله‌های
 * «بهترین X» که لینک کوتاه aflo.ir دارند. فقط برای مقاله‌هایی رندر
 * می‌شود که در PRODUCT_BOX_SLUGS محصول ثبت شده باشند؛ در بقیهٔ
 * مقاله‌ها هیچ چیزی نمایش داده نمی‌شود.
 *
 * هر کلیک با رویداد affiliate_click ثبت می‌شود:
 *   partner = digikala | snappshop ، item = شناسهٔ محصول ، article = مقاله
 * لینک‌ها rel="sponsored nofollow" دارند (الزام گوگل برای لینک تجاری).
 */
export function ProductAffiliateBox({
  articleSlug,
  location = "article-bottom",
}: {
  articleSlug: string;
  location?: string;
}) {
  const ids = PRODUCT_BOX_SLUGS[articleSlug];
  if (!ids || ids.length === 0) return null;

  const byId = new Map(AFFILIATE_PRODUCTS.map((p) => [p.id, p]));
  const products: AffiliateProduct[] = ids
    .map((id) => byId.get(id))
    .filter((p): p is AffiliateProduct => Boolean(p));
  if (products.length === 0) return null;

  return (
    <aside
      aria-label="محصولهای پیشنهادی با لینک افیلیت"
      className="mt-10 rounded-xl border border-primary/25 bg-primary/[0.06] p-5"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-primary">
        <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
        اگر قصد خرید داری، از اینجا شروع کن
      </p>
      <p className="mt-1.5 text-[0.95rem] leading-[2] text-foreground/85">
        محصول‌های پیشنهادی این مقاله را مستقیم از فروشگاه‌های معتبر ببین —
        قیمت‌ همان قیمت رسمی فروشگاه است و خرید از این لینک‌ها بدون هزینهٔ
        اضافه برای تو، به رشد تک‌راه کمک می‌کند:
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((p) => {
          const store = AFFILIATE_STORES[p.store];
          return (
            <div
              key={p.id}
              className="flex flex-col rounded-lg border border-border/70 bg-background p-4"
            >
              <p className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-foreground">{p.title}</span>
                <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                  {store.name}
                </span>
              </p>
              {p.spec ? (
                <p className="mt-1 text-xs leading-6 text-muted-foreground">{p.spec}</p>
              ) : null}
              {p.price ? (
                <p className="mt-1 text-xs font-bold text-foreground/80">{p.price}</p>
              ) : null}
              <TrackedLink
                href={p.url}
                event="affiliate_click"
                params={{ partner: p.store, item: p.id, article: articleSlug, location }}
                rel="sponsored nofollow noopener"
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {store.cta}
              </TrackedLink>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[0.72rem] leading-5 text-muted-foreground">
        🔗 این لینک‌ها لینک همکاری در فروش (افیلیت) تک‌راه هستند؛ قیمت پرداختی تو
        حتی یک ریال بیشتر نمی‌شود و بخشی از کمیسیون فروشگاه به تولید محتوای
        رایگان تک‌راه می‌رسد.
      </p>
    </aside>
  );
}
