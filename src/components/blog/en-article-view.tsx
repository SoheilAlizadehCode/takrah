import Link from "next/link";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import type { Article, Block } from "@/lib/blog-types";
import { EN_CATEGORY_NAMES } from "@/data/en";
import { TrackedLink } from "./tracked-link";
import { siteConfig } from "@/lib/site";

/** رندر بلوک‌های محتوا — نسخهٔ انگلیسی/LTR */
function EnBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mt-8 space-y-5 text-[15px] leading-8 text-foreground/90">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-xl font-extrabold tracking-tight text-foreground">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-lg font-bold text-foreground">
                {b.text}
              </h3>
            );
          case "list":
            return b.ordered ? (
              <ol key={i} className="list-decimal space-y-2 ps-6">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="list-disc space-y-2 ps-6">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-s-4 border-emerald-600/50 bg-muted/40 px-4 py-3 italic"
              >
                {b.text}
              </blockquote>
            );
          case "tip":
            return (
              <aside
                key={i}
                className="rounded-2xl border border-emerald-600/30 bg-emerald-600/10 px-4 py-3"
              >
                <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                  💡 {b.title ?? "Tip"}
                </p>
                <p className="mt-1 text-sm leading-7">{b.text}</p>
              </aside>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-2xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {b.headers.map((h, j) => (
                        <th key={j} className="px-3 py-2 text-start font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j} className="border-t border-border/60">
                        {row.map((c, k) => (
                          <td key={k} className="px-3 py-2">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** نمای مقالهٔ انگلیسی — LTR و بدون وابستگی به متن فارسی */
export function EnArticleView({ article }: { article: Article }) {
  return (
    <article lang="en" dir="ltr" className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/en" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground/70">
          {EN_CATEGORY_NAMES[article.category] ?? "Articles"}
        </span>
      </nav>

      <header>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{article.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {article.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {article.readMinutes} min read
          </span>
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 font-medium">
            {EN_CATEGORY_NAMES[article.category] ?? article.category}
          </span>
        </div>
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.cover}
        alt={article.title}
        className="mt-8 w-full rounded-3xl border border-border/60 object-cover"
        loading="eager"
      />

      <EnBlocks blocks={article.blocks} />

      {/* برچسب‌ها */}
      <div className="mt-10 flex flex-wrap gap-2">
        {article.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* CTA تلگرام — با ثبت رویداد telegram_click در GA4 */}
      <div className="mt-10 rounded-3xl border border-emerald-600/25 bg-gradient-to-l from-emerald-600/10 via-transparent to-emerald-600/10 p-6 text-center">
        <h2 className="text-lg font-extrabold">Want more plain-language tech guides?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          Join the TakRah Telegram channel for new articles, tools, and practical AI tips.
        </p>
        <TrackedLink
          href={siteConfig.telegramChannel}
          event="telegram_click"
          params={{ location: "en_article" }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Join on Telegram
        </TrackedLink>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/en" className="font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="me-1 inline h-4 w-4" aria-hidden="true" />
          Back to all articles
        </Link>
        <Link
          href={`/article/${article.slug}`}
          className="font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          نسخهٔ فارسی این مقاله ←
        </Link>
      </div>
    </article>
  );
}
