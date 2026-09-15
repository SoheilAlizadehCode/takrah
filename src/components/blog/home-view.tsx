"use client";

import { BookOpen, Sparkles, Users, GraduationCap } from "lucide-react";
import { articles, getFeatured } from "@/data";
import { categories } from "@/lib/site";
import { ArticleCard, FeaturedCard } from "./cards";
import { AdSlot } from "./ad-slot";
import { CategoryIcon } from "./category-icon";

const features = [
  {
    icon: GraduationCap,
    title: "آموزش به زبان ساده",
    text: "مقالات ما بدون اصطلاحات پیچیده نوشته می‌شوند تا هر کسی، در هر سطحی، بتواند یاد بگیرد.",
  },
  {
    icon: Sparkles,
    title: "همیشه به‌روز",
    text: "دنیای تکنولوژی هر روز تغییر می‌کند؛ محتوای تک‌راه هم با آن به‌روز می‌شود.",
  },
  {
    icon: Users,
    title: "کاملاً رایگان",
    text: "همه آموزش‌های تک‌راه رایگان است؛ مأموریت ما دسترسی برابر به دانش دیجیتال است.",
  },
];

export function HomeView() {
  const featured = getFeatured();
  const rest = articles.filter((a) => a.slug !== featured.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* بخش معرفی */}
      <section className="mb-12 text-center" aria-label="معرفی تک‌راه">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-xs font-bold text-primary">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          مرجع آموزش تکنولوژی به زبان فارسی
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold leading-[1.6] sm:text-4xl sm:leading-[1.6]">
          مسیر تو به دنیای{" "}
          <span className="relative text-primary">
            تکنولوژی
          </span>{" "}
          از همین‌جا شروع می‌شود
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base sm:leading-8">
          از هوش مصنوعی و امنیت دیجیتال تا خرید گوشی و یادگیری برنامه‌نویسی؛
          مقالات کاربردی و ساده تک‌راه همراه شماست تا با اطمینان در دنیای دیجیتال قدم بگذارید.
        </p>
      </section>

      {/* مقاله ویژه */}
      <section aria-label="مقاله ویژه">
        <FeaturedCard article={featured} />
      </section>

      {/* جایگاه تبلیغ بالای فهرست */}
      <AdSlot slotKey="home-top" format="horizontal" />

      {/* آخرین مقالات */}
      <section className="mt-6" aria-labelledby="latest-heading">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 id="latest-heading" className="text-2xl font-extrabold">
              آخرین مقالات
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              تازه‌ترین آموزش‌ها و راهنماهای تک‌راه
            </p>
          </div>
        </div>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* دسته‌بندی‌ها */}
      <section className="mt-16" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-extrabold">
          موضوعی که دوست داری را انتخاب کن
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          مقالات تک‌راه در شش دسته اصلی سازمان‌دهی شده‌اند
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#/category/${c.id}`}
              className="group rounded-xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <CategoryIcon id={c.id} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold transition-colors group-hover:text-primary">
                {c.name}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-7 text-muted-foreground">
                {c.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* چرا تک‌راه */}
      <section
        className="mt-16 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:p-10"
        aria-labelledby="why-heading"
      >
        <h2 id="why-heading" className="text-center text-2xl font-extrabold">
          چرا تک‌راه؟
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="text-center sm:text-start">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mx-0">
                <f.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
