"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, User, Lightbulb, ChevronLeft, Home, ListTree } from "lucide-react";
import type { Article } from "@/lib/blog-types";
import { getCategory, siteConfig } from "@/lib/site";
import { getRelated } from "@/data";
import { toFaDigits } from "@/lib/format";
import { CategoryIcon } from "./category-icon";
import { AdSlot } from "./ad-slot";
import { ArticleCard } from "./cards";

// ─── نمایش یک بلوک محتوایی ───
function BlockView({ block, id }: { block: Article["blocks"][number]; id?: string }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[1.05rem] leading-[2.2] text-foreground/90">{block.text}</p>
      );
    case "h2":
      return (
        <h2
          id={id}
          className="mt-12 flex scroll-mt-24 items-center gap-3 text-[1.4rem] font-extrabold leading-[1.8] first:mt-0"
        >
          <span className="h-7 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-8 text-xl font-bold leading-[1.8]">{block.text}</h3>
      );
    case "list":
      return block.ordered ? (
        <ol className="my-4 space-y-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[1.02rem] leading-[2.1] text-foreground/90">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {toFaDigits(i + 1)}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-4 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[1.02rem] leading-[2.1] text-foreground/90">
              <span className="mt-[0.85rem] h-2 w-2 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="my-6 rounded-e-xl border-s-4 border-primary/70 bg-muted/50 p-5">
          <p className="text-[1.02rem] font-medium leading-[2.1] text-foreground/90">
            {block.text}
          </p>
        </blockquote>
      );
    case "tip":
      return (
        <aside className="my-6 rounded-xl border border-primary/25 bg-primary/[0.06] p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            {block.title ?? "نکته"}
          </p>
          <p className="text-[0.98rem] leading-[2.1] text-foreground/85">{block.text}</p>
        </aside>
      );
    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/70">
                {block.headers.map((h, i) => (
                  <th key={i} className="border-b border-border/70 px-4 py-3 text-start font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="odd:bg-background even:bg-muted/30">
                  {row.map((cell, j) => (
                    <td key={j} className="border-b border-border/40 px-4 py-3 leading-7">
                      {cell}
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
}

// ─── فهرست مطالب ───
function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
  if (headings.length === 0) return null;
  return (
    <nav aria-label="فهرست مطالب" className="rounded-xl border border-border/70 bg-card p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold">
        <ListTree className="h-4 w-4 text-primary" aria-hidden="true" />
        فهرست مطالب
      </p>
      <ol className="space-y-2.5">
        {headings.map((h, i) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex gap-2 text-sm leading-6 text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="font-bold text-primary/60">{toFaDigits(i + 1)}.</span>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── نوار پیشرفت مطالعه ───
function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-primary transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── نمای کامل مقاله ───
export function ArticleView({ article }: { article: Article }) {
  const category = getCategory(article.category);
  const firstPIndex = article.blocks.findIndex((b) => b.type === "p");
  const midIndex = Math.floor(article.blocks.length / 2);
  const headings = article.blocks
    .map((b, i) => (b.type === "h2" ? { id: `sec-${i}`, text: b.text } : null))
    .filter((x): x is { id: string; text: string } => x !== null);
  const related = getRelated(article);

  // داده ساختاریافته Article برای گوگل
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: `${siteConfig.url}${article.cover}`,
    inLanguage: "fa-IR",
    author: { "@type": "Organization", name: `تحریریه ${siteConfig.name}`, url: siteConfig.url },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/article/${article.slug}`,
    articleSection: category.name,
    keywords: article.tags.join("، "),
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* مسیر راهنما (Breadcrumb) */}
        <nav aria-label="مسیر صفحه" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <li>
              <a href="#/" className="flex items-center gap-1 transition-colors hover:text-primary">
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                خانه
              </a>
            </li>
            <li aria-hidden="true">
              <ChevronLeft className="h-3.5 w-3.5" />
            </li>
            <li>
              <a
                href={`#/category/${category.id}`}
                className="transition-colors hover:text-primary"
              >
                {category.name}
              </a>
            </li>
            <li aria-hidden="true">
              <ChevronLeft className="h-3.5 w-3.5" />
            </li>
            <li className="line-clamp-1 max-w-[240px] text-foreground/80 sm:max-w-none">
              {article.title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          {/* ستون اصلی مقاله */}
          <div className="min-w-0">
            {/* سربرگ مقاله */}
            <header className="space-y-5">
              <a
                href={`#/category/${category.id}`}
                className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/15"
              >
                <CategoryIcon id={category.id} className="h-3.5 w-3.5" />
                {category.name}
              </a>
              <h1 className="text-2xl font-extrabold leading-[1.7] sm:text-3xl sm:leading-[1.75]">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" aria-hidden="true" />
                  تحریریه {siteConfig.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>{article.date}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {toFaDigits(article.readMinutes)} دقیقه مطالعه
                </span>
              </div>
            </header>

            {/* کاور */}
            <figure className="mt-7">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/60">
                <Image
                  src={article.cover}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
              </div>
            </figure>

            {/* بدنه مقاله */}
            <div className="mt-8 space-y-6">
              {article.blocks.map((block, i) => (
                <div key={i}>
                  <BlockView block={block} id={block.type === "h2" ? `sec-${i}` : undefined} />
                  {/* تبلیغ بعد از پاراگراف اول و وسط مقاله */}
                  {i === firstPIndex && <AdSlot slotKey={`${article.slug}-top`} format="horizontal" />}
                  {i === midIndex && <AdSlot slotKey={`${article.slug}-mid`} format="inline" />}
                </div>
              ))}
            </div>

            {/* تبلیغ پایین مقاله */}
            <AdSlot slotKey={`${article.slug}-bottom`} format="horizontal" />

            {/* برچسب‌ها */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* ستون کناری: فهرست مطالب */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        </div>

        {/* مقالات مرتبط */}
        <section className="mt-14 border-t border-border/60 pt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-7 text-xl font-extrabold">
            مقالات مرتبط
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
