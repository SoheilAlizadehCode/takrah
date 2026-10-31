import type { MetadataRoute } from "next";
import { articles } from "@/data";
import { englishArticles } from "@/data/en";
import { categories, hrefs, staticPages, siteConfig } from "@/lib/site";
import { studentBooks } from "@/lib/student";

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
    // صفحه پکیج‌ها و دموهای زنده
    {
      url: `${siteConfig.url}/packages`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    // صفحات دسته‌بندی
    ...categories.map((c) => ({
      url: `${siteConfig.url}${hrefs.category(c.id)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // بخش دانش‌آموز: کتابخانه + دانلود + صفحات کتاب‌های درسی
    {
      url: `${siteConfig.url}${hrefs.studentHome}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/student/download`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...studentBooks.map((b) => ({
      url: `${siteConfig.url}${hrefs.studentBook(b.slug)}`,
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
    // ─── نسخهٔ انگلیسی (/en) با hreflang فارسی↔انگلیسی ───
    {
      url: `${siteConfig.url}/en`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${siteConfig.url}/en`,
          "fa-IR": siteConfig.url,
        },
      },
    },
    ...englishArticles.map((a) => ({
      url: `${siteConfig.url}/en/article/${a.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${siteConfig.url}/en/article/${a.slug}`,
          "fa-IR": `${siteConfig.url}${hrefs.article(a.slug)}`,
        },
      },
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
