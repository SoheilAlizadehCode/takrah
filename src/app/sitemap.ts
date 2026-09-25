import type { MetadataRoute } from "next";
import { articles } from "@/data";
import { categories, hrefs, staticPages, siteConfig } from "@/lib/site";

/**
 * سایت‌مپ پویا — با اضافه شدن هر مقاله جدید در src/data،
 * آدرس آن به‌صورت خودکار در همین مسیر /sitemap.xml منتشر می‌شود.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    // صفحات دسته‌بندی
    ...categories.map((c) => ({
      url: `${siteConfig.url}${hrefs.category(c.id)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // مقالات
    ...articles.map((a) => ({
      url: `${siteConfig.url}${hrefs.article(a.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // صفحات ثابت
    ...staticPages.map((p) => ({
      url: `${siteConfig.url}${hrefs.page(p.id)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
