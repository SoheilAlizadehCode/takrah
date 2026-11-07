import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  MessageSquareText,
  Palette,
  Clapperboard,
  AudioLines,
  Code2,
  NotebookPen,
  ArrowLeft,
  ShieldCheck,
  Banknote,
  CircleCheck,
  TriangleAlert,
  Star,
  ExternalLink,
  CalendarCheck,
  Sparkles,
  Send,
} from "lucide-react";
import type { AiTool, ToolCategory } from "@/lib/tools-directory";
import {
  accessMeta,
  aiTools,
  formatScore,
  getRelatedTools,
  getToolCategory,
  getToolsByCategory,
  toolCategories as TOOL_CATEGORIES,
  AI_TOOLS_LAST_UPDATED,
} from "@/lib/tools-directory";
import { hrefs, siteConfig } from "@/lib/site";
import { getArticle } from "@/data";
import { TrackedLink } from "./tracked-link";
import { toFaDigits } from "@/lib/format";

const CATEGORY_ICONS: Record<ToolCategory["id"], ComponentType<{ className?: string }>> = {
  chatbot: MessageSquareText,
  image: Palette,
  video: Clapperboard,
  audio: AudioLines,
  code: Code2,
  productivity: NotebookPen,
};

const ACCESS_TONES: Record<accessTone, string> = {
  success: "border-emerald-600/30 bg-emerald-600/10 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
  warning: "border-amber-600/30 bg-amber-600/10 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
  info: "border-sky-600/30 bg-sky-600/10 text-sky-800 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300",
  danger: "border-rose-600/30 bg-rose-600/10 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300",
};

type accessTone = "success" | "warning" | "info" | "danger";

/** برچسب وضعیت دسترسی — مهم‌ترین سیگنال پروفایل ایران */
function AccessBadge({ tool, className }: { tool: AiTool; className?: string }) {
  const meta = accessMeta[tool.access];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${ACCESS_TONES[meta.tone]} ${className ?? ""}`}
    >
      {tool.access === "direct" ? (
        <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {meta.label}
    </span>
  );
}

/** امتیاز حکم تک‌راه */
function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      {formatScore(score)} از ۱۰
    </span>
  );
}

/** کارت ابزار در فهرست دایره */
function ToolCard({ tool }: { tool: AiTool }) {
  const category = getToolCategory(tool.category);
  const Icon = CATEGORY_ICONS[tool.category];
  return (
    <Link
      href={hrefs.aiTool(tool.slug)}
      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-extrabold leading-6 transition-colors group-hover:text-primary">
              {tool.name}
            </h3>
            <p className="text-xs text-muted-foreground">{tool.developer}</p>
          </div>
        </div>
        <ScoreBadge score={tool.score} />
      </div>
      <p className="text-sm leading-7 text-muted-foreground">{tool.tagline}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <AccessBadge tool={tool} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
          <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
          {tool.priceLabel}
        </span>
      </div>
      <p className="flex items-center gap-1 text-xs font-bold text-primary">
        پروفایل ایران و حکم تک‌راه
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        <span className="sr-only">{category.name}</span>
      </p>
    </Link>
  );
}

/** صفحهٔ اصلی دایرهٔ ابزارها — فهرست دسته‌محور */
export function ToolsDirectoryView() {
  const activeCategories = toolCategoriesWithTools();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* سربرگ بخش */}
      <header className="mb-10 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wrench className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
          دایرهٔ ابزارهای هوش مصنوعی تک‌راه
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground sm:text-[0.95rem]">
          برای هر ابزار فقط «چی هست» نمی‌گوییم؛ می‌گوییم برای کاربر ایرانی چه قیمت و چه وضعیت
          دسترسی‌ای دارد: قیمت رسمی دلاری با تاریخ بررسی، راه پرداخت تومانی، جایگزین رایگان و
          حکم صریح تک‌راه. جایی که هیچ مرجع انگلیسی‌ای جواب تو را نمی‌دهد.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
            {toFaDigits(aiTools.length)} ابزار در {toFaDigits(activeCategories.length)} دسته
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            آخرین بررسی قیمت و دسترسی: {AI_TOOLS_LAST_UPDATED}
          </span>
        </div>
        <p className="mt-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-xs leading-6 text-muted-foreground">
          ⚠️ وضعیت دسترسی و قیمت ابزارهای AI ماه‌به‌ماه عوض می‌شود؛ عددِ بدون تاریخ ارزش ندارد.
          هر پروفایل تاریخ «آخرین بررسی» خودش را دارد و هر ماه همه‌چیز دوباره چک می‌شود.
        </p>
      </header>

      {/* دسته‌ها */}
      {activeCategories.map((category) => {
        const Icon = CATEGORY_ICONS[category.id];
        const tools = getToolsByCategory(category.id);
        return (
          <section key={category.id} aria-labelledby={`tools-${category.id}`} className="mb-12">
            <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 id={`tools-${category.id}`} className="flex items-center gap-2 text-xl font-extrabold">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                {category.name}
              </h2>
              <span className="text-xs text-muted-foreground">
                {toFaDigits(tools.length)} ابزار
              </span>
            </div>
            <p className="mb-5 text-sm leading-7 text-muted-foreground">{category.description}</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      {/* CTA کانال — عادت بازگشت */}
      <section className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary p-3 text-primary-foreground shadow-sm">
          <Send className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold sm:text-lg">
            هر هفته «ابزار هفته» در کانال تک‌راه
          </h2>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">
            تغییر قیمت‌ها و وضعیت دسترسی ابزارها را در کانال اعلام می‌کنیم؛ عضو شو تا از
            به‌روزرسانی‌های دایره جا نمانی.
          </p>
        </div>
        <TrackedLink
          href={siteConfig.telegramChannel}
          event="telegram_click"
          params={{ location: "tools-directory", target: "channel" }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          عضویت در کانال
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </TrackedLink>
      </section>
    </div>
  );
}

function toolCategoriesWithTools(): ToolCategory[] {
  return TOOL_CATEGORIES.filter((c) => getToolsByCategory(c.id).length > 0);
}

/** صفحهٔ پروفایل یک ابزار — پروفایل کامل ایران */
export function ToolProfileView({ tool }: { tool: AiTool }) {
  const category = getToolCategory(tool.category);
  const access = accessMeta[tool.access];
  const relatedArticle = tool.relatedArticle ? getArticle(tool.relatedArticle) : undefined;
  const relatedTools = getRelatedTools(tool);
  const Icon = CATEGORY_ICONS[tool.category];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* مسیر ناوبری */}
      <nav aria-label="مسیر ناوبری" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">خانه</Link>
        <span aria-hidden="true">/</span>
        <Link href={hrefs.toolsHome} className="transition-colors hover:text-primary">
          دایرهٔ ابزارها
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-foreground">{tool.name}</span>
      </nav>

      {/* سربرگ ابزار */}
      <header className="rounded-2xl border border-border/70 bg-muted/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold leading-9">{tool.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                ساختهٔ {tool.developer} · {category.name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ScoreBadge score={tool.score} />
            <AccessBadge tool={tool} />
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{tool.tagline}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          آخرین بررسی قیمت و دسترسی: {tool.lastChecked}
        </p>
      </header>

      {/* حکم تک‌راه — اول از همه، قضاوت صریح */}
      <section aria-labelledby="verdict-heading" className="mt-8">
        <h2 id="verdict-heading" className="mb-3 flex items-center gap-2 text-lg font-extrabold">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          حکم تک‌راه
        </h2>
        <blockquote className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm leading-8">
          {tool.verdict}
        </blockquote>
      </section>

      {/* مشخصات کامل */}
      <section aria-labelledby="details-heading" className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 md:col-span-2">
          <h2 id="details-heading" className="mb-2 flex items-center gap-2 text-base font-extrabold">
            <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
            این ابزار دقیقاً چه می‌کند؟
          </h2>
          <p className="text-sm leading-8 text-muted-foreground">{tool.whatItDoes}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tool.bestFor.map((item) => (
              <span key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* قیمت‌ها */}
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
            <Banknote className="h-4 w-4 text-primary" aria-hidden="true" />
            قیمت‌ها (دلار رسمی)
          </h2>
          <p className="mb-4 rounded-xl bg-emerald-600/10 px-3 py-2 text-xs font-bold leading-6 text-emerald-800 dark:text-emerald-300">
            رایگان چی می‌ده؟ {tool.freeTier}
          </p>
          {tool.paidPlans.length > 0 ? (
            <ul className="space-y-2.5">
              {tool.paidPlans.map((plan) => (
                <li key={plan.name} className="flex flex-col gap-0.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
                  <span className="text-sm font-extrabold">{plan.name}</span>
                  <span className="text-xs leading-6 text-muted-foreground">{plan.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              این ابزار پلن پولی ندارد؛ همه‌چیز رایگان است.
            </p>
          )}
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            قیمت‌ها از صفحهٔ رسمی سازنده در تاریخ {tool.lastChecked} بررسی شده‌اند.
          </p>
        </div>

        {/* پروفایل ایران */}
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            پروفایل ایران
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-bold text-muted-foreground">وضعیت دسترسی</dt>
              <dd className="mt-1 leading-7">{access.label} — {tool.accessNote}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">پرداخت از ایران</dt>
              <dd className="mt-1 leading-7">{tool.paymentInIran}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">جایگزین رایگان / تومانی</dt>
              <dd className="mt-1 leading-7">{tool.alternative}</dd>
            </div>
          </dl>
        </div>

        {/* نکتهٔ ایران */}
        <div className="rounded-2xl border border-sky-600/30 bg-sky-600/5 p-5 md:col-span-2">
          <h2 className="mb-2 flex items-center gap-2 text-base font-extrabold text-sky-800 dark:text-sky-300">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            نکتهٔ ایران
          </h2>
          <p className="text-sm leading-8 text-muted-foreground">{tool.iranTip}</p>
        </div>
      </section>

      {/* اقدام — TrackedLink برای سنجش علاقهٔ بازار */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <TrackedLink
          href={tool.website}
          event="tool_visit"
          params={{ tool: tool.slug, from: "profile" }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
          ariaLabel={`رفتن به وب‌سایت رسمی ${tool.name}`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          وب‌سایت رسمی {tool.name}
        </TrackedLink>
        <Link
          href={hrefs.toolsHome}
          className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-5 py-3 text-sm font-bold transition-colors hover:bg-muted"
        >
          <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
          بقیهٔ ابزارهای دایره
        </Link>
      </div>

      {/* مقالهٔ مرتبط + ابزارهای هم‌دسته — لینک‌سازی داخلی */}
      {relatedArticle ? (
        <Link
          href={hrefs.article(relatedArticle.slug)}
          className="group mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl">
            <Image src={relatedArticle.cover} alt="" fill sizes="112px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-primary">مقالهٔ مرتبط تک‌راه</p>
            <h2 className="mt-1 text-sm font-extrabold leading-7 transition-colors group-hover:text-primary">
              {relatedArticle.title}
            </h2>
          </div>
          <ArrowLeft className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        </Link>
      ) : null}

      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools-heading" className="mt-10">
          <h2 id="related-tools-heading" className="mb-4 text-lg font-extrabold">
            ابزارهای هم‌دستهٔ {category.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((t) => (
              <Link
                key={t.slug}
                href={hrefs.aiTool(t.slug)}
                className="group rounded-2xl border border-border/60 bg-card p-4 transition-shadow hover:shadow-md"
              >
                <h3 className="text-sm font-extrabold transition-colors group-hover:text-primary">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">{t.tagline}</p>
                <AccessBadge tool={t} className="mt-3" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
