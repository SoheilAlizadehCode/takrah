import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Sparkles, ArrowRight } from "lucide-react";
import { englishArticles, EN_CATEGORY_NAMES } from "@/data/en";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "TakRah — Plain-Language Guides to AI, Security & Programming",
  description:
    "TakRah (Your Tech Path) in English: beginner-friendly guides on artificial intelligence, online security, and programming — written for humans, not engineers only.",
  alternates: {
    canonical: `${siteConfig.url}/en`,
    languages: {
      en: `${siteConfig.url}/en`,
      "fa-IR": siteConfig.url,
    },
  },
};

export default function EnHomePage() {
  const featured = englishArticles.find((a) => a.featured) ?? englishArticles[0];
  const rest = englishArticles.filter((a) => a.slug !== featured.slug);

  return (
    <div lang="en" dir="ltr" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      {/* ─── Hero ─── */}
      <section className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Now in English — TakRah goes global
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Your path into AI and technology
          <br className="hidden sm:block" />
          starts right here
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
          From artificial intelligence and digital security to learning how to code —
          TakRah&apos;s practical, jargon-free guides help you move through the digital
          world with confidence. We started in Persian; now we are writing for the world.
        </p>
      </section>

      {/* ─── Featured article ─── */}
      <section className="mt-12" aria-label="Featured article">
        <Link
          href={`/en/article/${featured.slug}`}
          className="group block overflow-hidden rounded-3xl border border-border/60 bg-card transition-shadow hover:shadow-lg"
        >
          <div className="grid md:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.cover}
              alt={featured.title}
              className="h-52 w-full object-cover md:h-full"
            />
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Featured · {EN_CATEGORY_NAMES[featured.category] ?? featured.category}
              </span>
              <h2 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{featured.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Read the guide
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ─── All English articles ─── */}
      <section id="articles" className="mt-14" aria-label="All English articles">
        <h2 className="text-xl font-extrabold tracking-tight">Latest articles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We translate our best Persian guides — new ones arrive every week.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
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
                <h3 className="mt-2 text-base font-extrabold leading-snug">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{a.excerpt}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {a.readMinutes} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Telegram CTA ─── */}
      <section className="mt-14 overflow-hidden rounded-3xl border border-emerald-600/25 bg-gradient-to-l from-emerald-600/10 via-transparent to-emerald-600/10 p-6 text-center sm:p-8">
        <h2 className="text-lg font-extrabold">Stay in the loop</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
          Join our Telegram channel to catch every new English and Persian guide the
          moment it is published.
        </p>
        <a
          href={siteConfig.telegramChannel}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Join TakRah on Telegram
        </a>
      </section>
    </div>
  );
}
