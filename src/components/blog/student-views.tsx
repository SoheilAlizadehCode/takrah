import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Library,
  ArrowLeft,
  Layers,
  FileText,
  Trophy,
} from "lucide-react";
import type { StudentBook } from "@/lib/student";
import { studentBooks } from "@/lib/student";
import { hrefs } from "@/lib/site";
import { getByCategory, getBookArticles } from "@/data";
import { ArticleCard } from "./cards";
import { toFaDigits } from "@/lib/format";

/** کارت یک کتاب درسی در کتابخانه دانش‌آموزی */
function BookCard({ book, articleCount }: { book: StudentBook; articleCount: number }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={hrefs.studentBook(book.slug)} className="block">
        <div className="relative aspect-[16/9]">
          <Image
            src={book.cover}
            alt={`کاور کتاب درسی: ${book.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
              {book.grade}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
              شناسه کتاب {book.code}
            </span>
          </div>
          <h2 className="text-xl font-extrabold leading-9 transition-colors group-hover:text-primary">
            {book.title}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">{book.tagline}</p>
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {toFaDigits(articleCount)} مقاله (هر پودمان یک مقاله)
            </span>
            <span className="flex items-center gap-1 font-bold text-primary">
              ورود به کتاب
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/** صفحه کتابخانه دانش‌آموزی: معرفی کتاب‌ها + همه مقاله‌های دانش‌آموزی */
export function StudentHomeView() {
  const all = getByCategory("student");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* سربرگ بخش */}
      <header className="mb-12 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
          کتابخانه دانش‌آموزی تک‌راه
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground sm:text-[0.95rem]">
          کتاب‌های درسی رشته شبکه و نرم‌افزار رایانه (پایه دوازدهم، فنی و حرفه‌ای) را
          پودمان‌به‌پودمان به مقاله‌های ساده و جذاب تبدیل کرده‌ایم؛ با مثال‌های واقعی،
          نکات کارگاهی و چک‌لیست ارزشیابی — تا هم درس را بفهمی و هم امتحانت را خوب بدهی.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Library className="h-4 w-4 text-primary" aria-hidden="true" />
            {toFaDigits(studentBooks.length)} کتاب درسی
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            {toFaDigits(all.length)} مقاله پودمان‌به‌پودمان
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
            نمره قبولی هر پودمان: حداقل ۱۲
          </span>
        </div>
      </header>

      {/* کتاب‌ها */}
      <section aria-labelledby="books-heading" className="mb-14">
        <h2
          id="books-heading"
          className="mb-6 flex items-center gap-2 text-xl font-extrabold"
        >
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          کتاب‌های درسی
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {studentBooks.map((book) => (
            <BookCard
              key={book.slug}
              book={book}
              articleCount={getBookArticles(book.slug).length}
            />
          ))}
        </div>
      </section>

      {/* همه مقاله‌های دانش‌آموزی */}
      <section aria-labelledby="student-articles-heading">
        <h2
          id="student-articles-heading"
          className="mb-6 flex items-center gap-2 text-xl font-extrabold"
        >
          <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
          همه مقاله‌های دانش‌آموزی
        </h2>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** صفحه اختصاصی هر کتاب: معرفی کتاب + مقاله‌های پودمان‌های آن */
export function StudentBookView({ book }: { book: StudentBook }) {
  const list = getBookArticles(book.slug);
  const others = studentBooks.filter((b) => b.slug !== book.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* سربرگ کتاب */}
      <header className="grid gap-8 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
        <div>
          <nav aria-label="مسیر صفحه" className="mb-4 text-xs text-muted-foreground sm:text-sm">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href={hrefs.studentHome} className="transition-colors hover:text-primary">
                  کتابخانه دانش‌آموزی
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground/80">{book.shortTitle}</li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
              {book.grade}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
              {book.field}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
              شناسه کتاب {book.code}
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold leading-[1.7] sm:text-3xl">
            {book.title}
          </h1>
          <p className="mt-3 text-sm leading-8 text-muted-foreground sm:text-[0.95rem]">
            {book.description}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {toFaDigits(list.length)} مقاله — هر پودمان یک مقاله کامل با نکات کارگاهی و ارزشیابی
          </p>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60">
          <Image
            src={book.cover}
            alt={`کاور کتاب درسی: ${book.title}`}
            fill
            priority
            sizes="340px"
            className="object-cover"
          />
        </div>
      </header>

      {/* مقاله‌های پودمان‌ها */}
      <section aria-labelledby="podman-heading" className="mt-12">
        <h2 id="podman-heading" className="mb-6 text-xl font-extrabold">
          مقاله‌های پودمان‌های این کتاب
        </h2>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* کتاب دیگر */}
      {others.length > 0 && (
        <section
          aria-labelledby="other-books-heading"
          className="mt-14 border-t border-border/60 pt-10"
        >
          <h2 id="other-books-heading" className="mb-6 text-xl font-extrabold">
            کتاب‌های دیگر کتابخانه
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {others.map((b) => (
              <BookCard key={b.slug} book={b} articleCount={getBookArticles(b.slug).length} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
