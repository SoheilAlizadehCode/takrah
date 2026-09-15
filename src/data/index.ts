import type { Article } from "@/lib/blog-types";
import { articles1 } from "./articles-1";
import { articles2 } from "./articles-2";
import { articles3 } from "./articles-3";
import { articles4 } from "./articles-4";

export const articles: Article[] = [
  ...articles1,
  ...articles2,
  ...articles3,
  ...articles4,
];

export const getArticle = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const getByCategory = (categoryId: string): Article[] =>
  articles.filter((a) => a.category === categoryId);

export const getFeatured = (): Article =>
  articles.find((a) => a.featured) ?? articles[0];

/** مقالات مرتبط: ابتدا هم‌دسته‌ها، سپس بقیه */
export const getRelated = (article: Article, count = 3): Article[] => {
  const sameCategory = articles.filter(
    (a) => a.slug !== article.slug && a.category === article.category,
  );
  const others = articles.filter(
    (a) => a.slug !== article.slug && a.category !== article.category,
  );
  return [...sameCategory, ...others].slice(0, count);
};

export const searchArticles = (query: string): Article[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return articles.filter((a) => {
    const hay = [a.title, a.excerpt, ...a.tags].join(" ").toLowerCase();
    return q.split(/\s+/).every((word) => hay.includes(word));
  });
};
