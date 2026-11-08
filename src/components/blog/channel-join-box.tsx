import { Send } from "lucide-react";
import { TrackedLink } from "./tracked-link";
import { siteConfig } from "@/lib/site";

/**
 * باکس «عضویت در کانال تلگرام» — موتور رشد کانال @takrahTop.
 *
 * دو جایگاه در همهٔ مقاله‌ها (فارسی و انگلیسی):
 *   - inline: نوار باریک بعد از پاراگراف اول بدنه
 *   - full:   باکس کامل انتهای مقاله، قبل از تبلیغ پایین
 *
 * ردیابی: رویداد موجود telegram_click با location=channel_box_inline /
 * channel_box_bottom ثبت می‌شود تا در GA4 بفهمیم کدام مقاله بیشترین
 * عضو به کانال می‌فرستد (بدون نیاز به تعریف رویداد جدید در GA4).
 */
export function ChannelJoinBox({
  lang = "fa",
  variant = "full",
  articleSlug,
}: {
  lang?: "fa" | "en";
  variant?: "inline" | "full";
  articleSlug?: string;
}) {
  const isFa = lang === "fa";
  const location = variant === "inline" ? "channel_box_inline" : "channel_box_bottom";

  if (variant === "inline") {
    return (
      <TrackedLink
        href={siteConfig.telegramChannel}
        event="telegram_click"
        params={{ location, target: "channel", article: articleSlug }}
        className="group my-2 flex items-center justify-between gap-3 rounded-xl border border-sky-500/30 bg-gradient-to-l from-sky-500/10 via-sky-500/5 to-transparent px-4 py-3 transition-colors hover:border-sky-500/60 hover:from-sky-500/20"
      >
        <span className="flex items-center gap-2.5 text-start text-sm font-bold text-sky-800 dark:text-sky-300">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm transition-transform group-hover:scale-110">
            <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          </span>
          {isFa
            ? "همین الان عضو کانال تک‌راه شو — ابزارهای AI و راه‌های درآمد، اول از همه اونجا منتشر میشن"
            : "Join the TakRah channel — AI tools and income tips land there first"}
        </span>
        <span className="hidden shrink-0 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-sky-600 sm:block">
          {isFa ? "عضویت رایگان" : "Join free"}
        </span>
      </TrackedLink>
    );
  }

  return (
    <aside
      aria-label={isFa ? "عضویت در کانال تلگرام تک‌راه" : "Join TakRah Telegram channel"}
      className="mt-8 overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-l from-sky-500/15 via-sky-500/5 to-indigo-500/10"
    >
      <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-start">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/30"
          aria-hidden="true"
        >
          <Send className="h-7 w-7 rtl:-scale-x-100" />
        </span>
        <div className="flex-1">
          <p className="text-base font-extrabold text-foreground">
            {isFa
              ? "مطلب بعدی را از تلگرام دنبال کن 🚀"
              : "Catch the next post on Telegram 🚀"}
          </p>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">
            {isFa
              ? "عضویت رایگان است — هر هفته ابزارهای تازهٔ هوش مصنوعی، ویدیوهای آموزشی با زیرنویس فارسی و راه‌های واقعی درآمد آنلاین در کانال تک‌راه منتشر می‌شود. بدون اسپم؛ هر وقت خواستی می‌توانی ترک کنی."
              : "Membership is free — every week the TakRah channel publishes new AI tools, videos with subtitles, and realistic ways to make money online. No spam; leave anytime."}
          </p>
        </div>
        <TrackedLink
          href={siteConfig.telegramChannel}
          event="telegram_click"
          params={{ location, target: "channel", article: articleSlug }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-600"
        >
          <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          {isFa ? "عضویت در کانال تک‌راه" : "Join on Telegram"}
        </TrackedLink>
      </div>
    </aside>
  );
}
