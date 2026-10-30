import Link from "next/link";
import { TrackedLink } from "@/components/blog/tracked-link";
import {
  Check,
  Sparkles,
  Star,
  ExternalLink,
  Phone,
  MessageCircle,
  Globe,
  CalendarCheck,
  Bot,
  BellRing,
  MonitorSmartphone,
  Instagram,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { siteConfig } from "@/lib/site";

const stats = [
  { value: "+۵۱۴", label: "پروژه تحویل‌شده" },
  { value: "+۲۵۶", label: "مشتری راضی" },
  { value: "۲۰۰۹", label: "فعال از سال" },
  { value: "۲۴/۷", label: "پشتیبانی و اتوماسیون" },
];

interface Plan {
  id: number;
  name: string;
  tagline: string;
  price: string;
  monthly?: string;
  monthlyNote?: string;
  features: { icon: React.ElementType; text: string }[];
  demoLabel: string;
  featured?: boolean;
  badge?: string;
  demoHint: string;
}

const plans: Plan[] = [
  {
    id: 1,
    name: "پکیج پایه",
    tagline: "شروع حضور دیجیتال کلینیک",
    price: "۱۸٬۰۰۰٬۰۰۰",
    features: [
      { icon: Globe, text: "وب‌سایت اختصاصی کلینیک با پروفایل پزشکان" },
      { icon: MonitorSmartphone, text: "فرم رزرو هوشمند متصل به واتساپ منشی" },
      { icon: Phone, text: "نقشه، ساعات کاری و اطلاعات تماس" },
      { icon: ShieldCheck, text: "سئو پایه و نمایش در گوگل" },
    ],
    demoLabel: "دموی زنده پکیج پایه",
    demoHint: "فرم رزرو → واتساپ منشی",
  },
  {
    id: 2,
    name: "پکیج استاندارد",
    tagline: "اتوماسیون کامل نوبت‌دهی",
    price: "۳۵٬۰۰۰٬۰۰۰",
    monthly: "+ ۴٬۰۰۰٬۰۰۰ تومان ماهانه",
    monthlyNote: "(هاست، پشتیبانی و ربات)",
    features: [
      { icon: CalendarCheck, text: "نوبت‌دهی آنلاین واقعی با تقویم شمسی" },
      { icon: MonitorSmartphone, text: "پنل مدیریت نوبت‌ها برای منشی" },
      { icon: Bot, text: "ربات تلگرام یادآوری نوبت به بیمار" },
      { icon: BellRing, text: "جلوگیری هوشمند از رزرو تکراری" },
    ],
    demoLabel: "دموی زنده پکیج استاندارد",
    demoHint: "نوبت‌دهی + ربات تلگرام",
    featured: true,
    badge: "⭐ پیشنهاد ما",
  },
  {
    id: 3,
    name: "پکیج VIP",
    tagline: "ماشین فروش کامل بیمار",
    price: "۵۵٬۰۰۰٬۰۰۰",
    monthly: "+ ۷٬۰۰۰٬۰۰۰ تومان ماهانه",
    monthlyNote: "(هاست، ربات‌ها و منشی هوشمند)",
    features: [
      { icon: Check, text: "همه امکانات پکیج استاندارد" },
      { icon: BrainCircuit, text: "«آوا» — منشی هوش مصنوعی ۲۴ ساعته" },
      { icon: Instagram, text: "ربات دایرکت اینستاگرام — فالوور را بیمار کنید" },
      { icon: BarChart3, text: "داشبورد KPI و گزارش هفتگی رشد" },
    ],
    demoLabel: "دموی زنده پکیج VIP",
    demoHint: "منشی AI + اینستاگرام + داشبورد",
  },
];

export function PackagesView() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      {/* ─── هیرو ─── */}
      <section className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          خدمات اتوماسیون JSDevelop — فعال از ۲۰۰۹
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
          پکیج‌های اتوماسیون کلینیک
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
          سه پلن واقعی با <b className="text-foreground">دموی زنده و تعاملی</b> — کلیک کنید و
          دقیقاً مثل یک بیمار واقعی نوبت بگیرید؛ از فرم ساده واتساپ تا منشی هوش مصنوعی که هر
          ساعت شبانه‌روز پاسخ می‌دهد.
        </p>

        {/* آمار */}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/60 bg-muted/30 px-3 py-4"
            >
              <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── کارت‌های پلن ─── */}
      <section className="mt-12" aria-label="لیست پکیج‌ها">
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border p-6 transition-shadow hover:shadow-lg ${
                plan.featured
                  ? "border-emerald-600/50 bg-gradient-to-b from-emerald-600/[0.07] to-transparent shadow-md ring-1 ring-emerald-600/20 lg:-translate-y-2 dark:border-emerald-400/40 dark:ring-emerald-400/20"
                  : "border-border/60 bg-card"
              }`}
            >
              {plan.badge ? (
                <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white shadow-sm rtl:translate-x-1/2 dark:bg-emerald-500">
                  {plan.badge}
                </span>
              ) : null}

              <header>
                <h2 className="text-lg font-extrabold">{plan.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
              </header>

              <div className="mt-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">تومان</span>
                </div>
                {plan.monthly ? (
                  <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {plan.monthly}{" "}
                    <span className="text-muted-foreground">{plan.monthlyNote}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">بدون هزینه ماهانه</p>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-3 border-t border-border/60 pt-5">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm leading-6">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                      <f.icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-foreground/90">{f.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <TrackedLink
                  href={`/demos/plan${plan.id}.html`}
                  event="package_demo_click"
                  params={{ plan: `plan${plan.id}` }}
                  className={`group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-transform active:scale-[0.98] ${
                    plan.featured
                      ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      : "border border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {plan.demoLabel}
                </TrackedLink>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  دمو شامل: {plan.demoHint}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* نکته انتخاب پلن */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
          <Star className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p>
            <b className="text-foreground">کدام پکیج برای کلینیک شما مناسب است؟</b> اگر تازه
            شروع کرده‌اید، «پایه» برای حضور دیجیتال کافی است؛ اگر می‌خواهید هیچ بیماری نوبتش
            را فراموش نکند، «استاندارد» بهترین انتخاب است؛ و اگر می‌خواهید اینستاگرام و
            هوش مصنوعی برایتان بیمار جذب کنند، «VIP» کامل‌ترین تجربه است.
          </p>
        </div>
      </section>

      {/* ─── نوار تماس ─── */}
      <section className="mt-10 overflow-hidden rounded-3xl border border-emerald-600/25 bg-gradient-to-l from-emerald-600/10 via-transparent to-emerald-600/10 p-6 text-center sm:p-8">
        <h2 className="text-lg font-extrabold">برای مشاوره رایگان و سفارش پکیج</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
          تیم JSDevelop از سال ۲۰۰۹ در حوزه اتوماسیون کسب‌وکار فعالیت می‌کند. همین حالا تماس
          بگیرید تا دموی اختصاصی کسب‌وکار خودتان را ببینید.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <TrackedLink
            href="tel:+989229033102"
            event="package_contact_click"
            params={{ method: "call" }}
            useExternal={false}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            ۰۹۲۲ ۹۰۳ ۳۱۰۲
          </TrackedLink>
          <TrackedLink
            href="https://wa.me/989229033102"
            event="package_contact_click"
            params={{ method: "whatsapp" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-bold transition-colors hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            گفتگو در واتساپ
          </TrackedLink>
          <TrackedLink
            href="https://jsdevelop.ir"
            event="package_contact_click"
            params={{ method: "jsdevelop" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-bold transition-colors hover:bg-muted"
          >
            <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            jsdevelop.ir
          </TrackedLink>
        </div>
      </section>

      {/* لینک بازگشت */}
      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← بازگشت به صفحه اصلی تک‌راه
        </Link>
      </div>
    </main>
  );
}
