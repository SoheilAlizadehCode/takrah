import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";
import { englishArticles, EN_CATEGORY_NAMES, EN_NAV_CATEGORY_IDS } from "@/data/en";
import { siteConfig } from "@/lib/site";

interface EnCategoryPageProps {
  params: Promise<{ id: string }>;
}

/** توضیح کوتاه انگلیسی برای هر دسته (فقط دسته‌های نسخهٔ انگلیسی) */
const EN_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  ai: "Plain-language guides to artificial intelligence — tools, prompts, real use cases, and honest ways to earn money with AI.",
  mobile: "Practical smartphone guides: buying decisions, battery tips, hidden settings, and everyday tricks.",
  security: "Stay safe online — passwords, phishing, privacy, and the security habits that actually matter.",
  software: "Step-by-step software tutorials you can follow even if you are not a tech person.",
  "web-tools": "Useful websites, online tools, and internet services — explained simply, with no jargon.",
  programming: "Learn to code from zero: roadmaps, Python, and beginner-friendly projects that build real skills.",
};

/** تولید استاتیک فقط برای دسته‌های نسخهٔ انگلیسی (بدون «دانش‌آموز») */
export function generateStaticParams() {
  return EN_NAV_CATEGORY_IDS.map((id) => ({ id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: EnCategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!EN_NAV_CATEGORY_IDS.includes(id)) return {};
  const name = EN_CATEGORY_NAMES[id] ?? id;
  return {
    title: `${name} Guides in English — TakRah`,
    description: EN_CATEGORY_DESCRIPTIONS[id] ?? `Browse TakRah's ${name} guides in plain English.`,
    alternates: {
      canonical: `${siteConfig.url}/en/category/${id}`,
      languages: {
        en: `${siteConfig.url}/en/category/${id}`,
        "fa-IR": `${siteConfig.url}/category/${id}`,
      },
    },
  };
}

export default async function EnCategoryPage({ params }: EnCategoryPageProps) {
  const { id } = await params;
  // «دانش‌آموز» و هر شناسهٔ ناشناخته فقط در نسخهٔ فارسی معنا دارد
  if (!EN_NAV_CATEGORY_IDS.includes(id)) notFound();

  const name = EN_CATEGORY_NAMES[id] ?? id;
  const articles = englishArticles.filter((a) => a.category === id);

  return (
    <div lang="en" dir="ltr" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      {/* ─── Hero ─── */}
      <section className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
          Category
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
          {EN_CATEGORY_DESCRIPTIONS[id] ?? `Browse TakRah's ${name} guides in plain English.`}
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {articles.length} {articles.length === 1 ? "guide" : "guides"} · also read in{" "}
          <Link href={`/category/${id}`} className="text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400">
            Persian
          </Link>
        </p>
      </section>

      {/* ─── Articles ─── */}
      <section className="mt-12" aria-label={`${name} articles`}>
        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/en/article/${a.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card transition-shadow hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.cover} alt={a.title} className="h-40 w-full object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {EN_CATEGORY_NAMES[a.category] ?? a.category}
                  </span>
                  <h2 className="mt-2 text-base font-extrabold leading-snug">{a.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{a.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {a.readMinutes} min read
                    <ArrowRight className="ms-auto h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No English guides in this category yet — new translations arrive every week.
            Meanwhile, the Persian versions are available.
          </p>
        )}
      </section>

      {/* ─── Back to all articles ─── */}
      <section className="mt-12 text-center">
        <Link
          href="/en"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Browse all English guides
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
