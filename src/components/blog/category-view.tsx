"use client";

import { getByCategory } from "@/data";
import { getCategory } from "@/lib/site";
import { ArticleCard } from "./cards";
import { CategoryIcon } from "./category-icon";

export function CategoryView({ categoryId }: { categoryId: string }) {
  const category = getCategory(categoryId);
  const list = getByCategory(categoryId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* سربرگ دسته */}
      <header className="mb-10 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <CategoryIcon id={category.id} className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">{category.name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground sm:text-[0.95rem]">
          {category.description}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {list.length > 0
            ? `${list.length} مقاله در این دسته`
            : "به‌زودی مقالات این دسته منتشر می‌شود"}
        </p>
      </header>

      {list.length > 0 ? (
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          مقاله‌ای در این دسته پیدا نشد.
        </p>
      )}
    </div>
  );
}
