import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/article-view";
import { articles, getArticle } from "@/data";
import { getCategory, hrefs, siteConfig } from "@/lib/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** تولید استاتیک همه صفحات مقالات در زمان build */
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    alternates: {
      canonical: hrefs.article(article.slug),
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: hrefs.article(article.slug),
      siteName: siteConfig.name,
      locale: "fa_IR",
      images: [
        {
          url: article.cover,
          width: 1344,
          height: 768,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.cover],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const articleUrl = `${siteConfig.url}${hrefs.article(article.slug)}`;

  // داده ساختاریافته Article برای گوگل
  const articleJsonLd = {
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
    mainEntityOfPage: articleUrl,
    articleSection: category.name,
    keywords: article.tags.join("، "),
  };

  // مسیر راهنما برای نتایج جستجوی گوگل
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${siteConfig.url}${hrefs.category(category.id)}`,
      },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArticleView article={article} />
    </>
  );
}
