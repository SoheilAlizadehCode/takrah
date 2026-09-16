import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/blog/category-view";
import { categories } from "@/lib/site";
import { hrefs } from "@/lib/site";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

/** تولید استاتیک همه صفحات دسته‌بندی در زمان build */
export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = categories.find((c) => c.id === id);
  if (!category) return {};

  return {
    title: `${category.name} — آموزش‌ها و راهنماها`,
    description: category.description,
    alternates: {
      canonical: hrefs.category(category.id),
    },
    openGraph: {
      type: "website",
      title: `${category.name} | تک‌راه`,
      description: category.description,
      url: hrefs.category(category.id),
      locale: "fa_IR",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  return <CategoryView categoryId={category.id} />;
}
