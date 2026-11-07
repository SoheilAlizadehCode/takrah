import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolProfileView } from "@/components/blog/tools-views";
import { aiTools, getTool } from "@/lib/tools-directory";
import { hrefs, siteConfig } from "@/lib/site";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

/** تولید استاتیک همه صفحات ابزارها در زمان build */
export function generateStaticParams() {
  return aiTools.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};

  return {
    title: `${tool.name} چیست؟ قیمت، دسترسی در ایران و جایگزین‌ها | تک‌راه`,
    description: `${tool.tagline} — قیمت رسمی، وضعیت دسترسی از ایران، راه پرداخت تومانی، جایگزین رایگان و حکم تک‌راه. آخرین بررسی: ${tool.lastChecked}.`,
    alternates: {
      canonical: hrefs.aiTool(tool.slug),
    },
    openGraph: {
      type: "article",
      title: `${tool.name} با پروفایل ایران | تک‌راه`,
      description: tool.tagline,
      url: `${siteConfig.url}${hrefs.aiTool(tool.slug)}`,
      siteName: siteConfig.name,
      locale: "fa_IR",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} با پروفایل ایران | تک‌راه`,
      description: tool.tagline,
    },
  };
}

export default async function ToolProfilePage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  // دادهٔ ساختاریافته SoftwareApplication + Breadcrumb برای گوگل
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: "WebApplication",
        operatingSystem: "وب",
        description: tool.tagline,
        url: tool.website,
        ...(tool.priceUsd
          ? {
              offers: {
                "@type": "AggregateOffer",
                lowPrice: tool.priceUsd[0],
                highPrice: tool.priceUsd[1],
                priceCurrency: "USD",
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "دایرهٔ ابزارها", item: `${siteConfig.url}${hrefs.toolsHome}` },
          { "@type": "ListItem", position: 3, name: tool.name, item: `${siteConfig.url}${hrefs.aiTool(tool.slug)}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolProfileView tool={tool} />
    </>
  );
}
