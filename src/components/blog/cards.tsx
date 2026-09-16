"use client";

import Image from "next/image";
import { Clock, ArrowLeft } from "lucide-react";
import type { Article } from "@/lib/blog-types";
import { getCategory } from "@/lib/site";
import { CategoryIcon } from "./category-icon";
import { toFaDigits } from "@/lib/format";

function Meta({ article, className = "" }: { article: Article; className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-xs text-muted-foreground ${className}`}>
      <span className="flex items-center gap-1">
        <CategoryIcon id={article.category} className="h-3.5 w-3.5" />
        {getCategory(article.category).name}
      </span>
      <span aria-hidden="true">·</span>
      <span>{article.date}</span>
      <span aria-hidden="true">·</span>
      <span className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {toFaDigits(article.readMinutes)} دقیقه مطالعه
      </span>
    </div>
  );
}

/** کارت استاندارد مقاله */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group">
      <a href={`#/article/${article.slug}`} className="block focus-visible:outline-none">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border/60 bg-muted">
          <Image
            src={article.cover}
            alt={`کاور مقاله: ${article.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="mt-4 space-y-2">
          <Meta article={article} />
          <h3 className="text-lg font-bold leading-8 transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
            {article.excerpt}
          </p>
        </div>
      </a>
    </article>
  );
}

/** کارت بزرگ مقاله ویژه (صفحه اصلی) */
export function FeaturedCard({ article }: { article: Article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <a
        href={`#/article/${article.slug}`}
        className="grid gap-0 md:grid-cols-2"
        aria-label={`خواندن مقاله: ${article.title}`}
      >
        <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[300px]">
          <Image
            src={article.cover}
            alt={`کاور مقاله: ${article.title}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            مقاله ویژه
          </span>
          <h2 className="text-2xl font-extrabold leading-[1.6] transition-colors group-hover:text-primary sm:text-[1.7rem]">
            {article.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-8 text-muted-foreground">
            {article.excerpt}
          </p>
          <Meta article={article} />
          <span className="mt-1 flex items-center gap-1.5 text-sm font-bold text-primary">
            ادامه مطلب
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </a>
    </article>
  );
}
