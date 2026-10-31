import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnArticleView } from "@/components/blog/en-article-view";
import { englishArticles, getEnArticle } from "@/data/en";
import { siteConfig } from "@/lib/site";

interface EnArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** تولید استاتیک فقط برای مقاله‌های ترجمه‌شدهٔ انگلیسی */
export function generateStaticParams() {
  return englishArticles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: EnArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getEnArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    alternates: {
      canonical: `${siteConfig.url}/en/article/${slug}`,
      languages: {
        en: `${siteConfig.url}/en/article/${slug}`,
        "fa-IR": `${siteConfig.url}/article/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${siteConfig.url}/en/article/${slug}`,
      type: "article",
      images: [{ url: article.cover }],
    },
  };
}

export default async function EnArticlePage({ params }: EnArticlePageProps) {
  const { slug } = await params;
  const article = getEnArticle(slug);
  if (!article) notFound();
  return <EnArticleView article={article} />;
}
