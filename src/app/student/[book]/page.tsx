import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentBookView } from "@/components/blog/student-views";
import { getStudentBook, studentBooks } from "@/lib/student";
import { hrefs, siteConfig } from "@/lib/site";

interface BookPageProps {
  params: Promise<{ book: string }>;
}

/** تولید استاتیک صفحات همه کتاب‌ها در زمان build */
export function generateStaticParams() {
  return studentBooks.map((b) => ({ book: b.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { book } = await params;
  const data = getStudentBook(book);
  if (!data) return {};

  return {
    title: `${data.title} (${data.grade}) | کتابخانه دانش‌آموزی تک‌راه`,
    description: data.description,
    alternates: {
      canonical: hrefs.studentBook(data.slug),
    },
    openGraph: {
      type: "website",
      title: data.title,
      description: data.tagline,
      url: hrefs.studentBook(data.slug),
      siteName: siteConfig.name,
      locale: "fa_IR",
      images: [{ url: data.cover, width: 1344, height: 768, alt: data.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.tagline,
      images: [data.cover],
    },
  };
}

export default async function StudentBookPage({ params }: BookPageProps) {
  const { book } = await params;
  const data = getStudentBook(book);
  if (!data) notFound();

  // داده ساختاریافته Breadcrumb برای گوگل
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "کتابخانه دانش‌آموزی",
        item: `${siteConfig.url}${hrefs.studentHome}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.title,
        item: `${siteConfig.url}${hrefs.studentBook(data.slug)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <StudentBookView book={data} />
    </>
  );
}
