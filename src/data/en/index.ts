import type { Article } from "@/lib/blog-types";
import { enWhatIsAi } from "./what-is-ai-beginners-guide";
import { enPhishing } from "./phishing-awareness";
import { EN_ARTICLE_SLUGS } from "@/data/en-slugs";

/** مقاله‌های ترجمه‌شدهٔ انگلیسی — با اضافه شدن هر ترجمه جدید اینجا اضافه شود */
export const englishArticles: Article[] = [enWhatIsAi, enPhishing];

export const getEnArticle = (slug: string): Article | undefined =>
  englishArticles.find((a) => a.slug === slug);

/** آیا برای این اسلاگ نسخهٔ انگلیسی وجود دارد؟ */
export const hasEnglishVersion = (slug: string): boolean =>
  EN_ARTICLE_SLUGS.includes(slug);

/** نام انگلیسی دسته‌بندی‌ها */
export const EN_CATEGORY_NAMES: Record<string, string> = {
  ai: "Artificial Intelligence",
  mobile: "Mobile",
  security: "Security & Privacy",
  software: "Software",
  "web-tools": "Web & Tools",
  programming: "Programming",
  student: "Student",
};
