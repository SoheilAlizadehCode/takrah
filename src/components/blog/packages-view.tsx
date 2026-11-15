"use client";
// ─── صفحهٔ محصول واحد تکنار: «منشی و دستیار هوشمند مطب» ───
// از ۱۴۰۴/۰۸ این صفحه تک‌محصولی است: نوبت‌دهی + منشی AI + دستیار پزشک در یک اشتراک.
// پلن‌ها: آزمایشی (۱۴ روز) / پایه / حرفه‌ای × دورهٔ ۶ ماهه و یکساله —
// دموی تعاملی داخل هر کارت (کامپوننت PlanDemo) و CTA به ویزارد /start.
import Link from "next/link";
import { useState } from "react";
import { TrackedLink } from "@/components/blog/tracked-link";
import { PlanDemo } from "@/components/blog/plan-demo";
import {
  Check,
  Sparkles,
  Star,
  Phone,
  MessageCircle,
  CalendarCheck,
  Bot,
  BellRing,
  BrainCircuit,
  Mic,
  ShieldCheck,
  QrCode,
} from "lucide-react";

const stats = [
  { value: "+۵۱۴", label: "پروژه تحویل‌شده" },
  { value: "+۲۵۶", label: "مشتری راضی" },
  { value: "۲۰۰۹", label: "فعال از سال" },
  { value: "۲۴/۷", label: "پاسخ‌گویی شبانه‌روزی" },
];

const features = [
  {
    icon: CalendarCheck,
    title: "نوبت‌دهی آنلاین + کد QR",
    text: "بیمار بدون تماس تلفنی، از لینک اینستاگرام یا واتساپ خودش روز و ساعت را برمی‌دارد؛ سیستم جلوی رزرو تکراری را می‌گیرد.",
  },
  {
    icon: BellRing,
    title: "اعلان لحظه‌ای تلگرام",
    text: "هر نوبت که ثبت شد، همان لحظه در تلگرام شماست: نام بیمار، روز و ساعت — فقط «تایید» بزنید.",
  },
  {
    icon: Bot,
    title: "منشی شبانهٔ هوشمند «آوا»",
    text: "ساعت ۲ شب هم که بیمار سؤال بپرسد، آوا با دانش کامل مطب شما جواب می‌دهد؛ هیچ تماس یا پیامی از دست نمی‌رود.",
  },
  {
    icon: Mic,
    title: "دستیار پزشک با خلاصهٔ صوتی",
    text: "بیمار قبل از ویزیت پیام صوتی می‌دهد؛ آوا خلاصهٔ ساختاریافته + وویس می‌سازد و قبل از ورود بیمار به تلگرام شما می‌رسد.",
  },
];

type Period = 6 | 12;
type PlanId = "trial" | "basic" | "pro";

const PERIODS: { id: Period; label: string; note: string }[] = [
  { id: 6, label: "۶ ماهه", note: "تخفیف شش‌ماهه" },
  { id: 12, label: "یکساله", note: "دو ماه رایگان" },
];

const fa = (n: number) => n.toLocaleString("fa-IR");

/** قیمت هر پلن به تفکیک دوره — تومان (با src/lib/billing.ts هماهنگ نگه داشته شود) */
const PRICES: Record<Exclude<PlanId, "trial">, Record<Period, number>> = {
  basic: { 6: 15_900_000, 12: 29_000_000 },
  pro: { 6: 31_900_000, 12: 59_000_000 },
};

interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  features: { icon: React.ElementType; text: string }[];
  demoKind: "booking" | "assistant";
  demoHint: string;
  featured?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: "trial",
    name: "آزمایشی",
    tagline: "۱۴ روز کامل، رایگان",
    features: [
      { icon: QrCode, text: "وب‌سایت نوبت‌دهی + کد QR اختصاصی" },
      { icon: BellRing, text: "اعلان تلگرام نوبت‌ها" },
      { icon: Bot, text: "۱۵ پرسش‌نامهٔ دستیار پزشک در ماه" },
      { icon: ShieldCheck, text: "بدون نیاز به کارت بانکی" },
    ],
    demoKind: "booking",
    demoHint: "همین سیستم واقعی — با دادهٔ نمونه",
  },
  {
    id: "basic",
    name: "پایه — نوبت‌دهی آنلاین",
    tagline: "برای مطبی که می‌خواهد هیچ تماسی از دست نرود",
    features: [
      { icon: Check, text: "همهٔ امکانات پلن آزمایشی" },
      { icon: CalendarCheck, text: "نوبت‌دهی نامحدود + رزرو هم‌زمان ممنوع" },
      { icon: Bot, text: "۶۰ پرسش‌نامهٔ دستیار پزشک در ماه" },
      { icon: BellRing, text: "اعلان تلگرام + گزارش ماهانهٔ رشد" },
    ],
    demoKind: "booking",
    demoHint: "نوبت‌دهی کامل + اعلان تلگرام",
  },
  {
    id: "pro",
    name: "حرفه‌ای — دستیار دکتر",
    tagline: "منشی + دستیار پزشک، کاملاً هوشمند",
    features: [
      { icon: Check, text: "همهٔ امکانات پلن پایه" },
      { icon: BrainCircuit, text: "۲۰۰ پرسش‌نامه + خلاصهٔ هوش مصنوعی بیمار" },
      { icon: Mic, text: "وویس خلاصهٔ بیمار در چت تلگرام شما" },
      { icon: ShieldCheck, text: "اولویت پشتیبانی — پاسخ در کمتر از یک ساعت" },
    ],
    demoKind: "assistant",
    demoHint: "دستیار پزشک: پیام صوتی → خلاصهٔ آوا → وویس",
    featured: true,
    badge: "⭐ پیشنهاد ما",
  },
];

export function PackagesView() {
  const [period, setPeriod] = useState<Period>(6);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      {/* ─── هیرو ─── */}
      <section className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          تک‌محصول تکنار — منشی و دستیار هوشمند مطب
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
          منشی و دستیار هوشمند برای مطب خصوصی شما
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
          نوبت‌دهی آنلاین، منشی شبانهٔ هوش مصنوعی و دستیار پزشک — همه در یک اشتراک ساده.
          <b className="text-foreground"> ۱۴ روز رایگان امتحان کنید، بدون نیاز به کارت بانکی</b>؛ بدون نصب،
          بدون سورس‌کد، فقط لینک و کد QR.
        </p>

        {/* آمار */}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-muted/30 px-3 py-4">
              <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── چطور کار می‌کند ─── */}
      <section className="mt-14" aria-label="امکانات محصول">
        <h2 className="text-center text-xl font-extrabold">یک اشتراک، چهار کار واقعی</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <article key={f.title} className="rounded-2xl border border-border/60 bg-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <f.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {f.title}
              </h3>
              <p className="mt-2.5 text-[0.83rem] leading-7 text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── پلن‌ها ─── */}
      <section className="mt-14" aria-label="پلن‌ها و قیمت‌ها">
        <h2 className="text-center text-xl font-extrabold">پلن خود را انتخاب کنید</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-7 text-muted-foreground">
          با هر پلنی که شروع کنید، ۱۴ روز کامل رایگان است؛ بعد از آن دورهٔ انتخابی‌تان فعال می‌شود.
        </p>

        {/* کلید دوره */}
        <div className="mt-6 flex justify-center">
          <div className="flex rounded-2xl border border-border/70 bg-muted/40 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`rounded-xl px-5 py-2 text-sm font-extrabold transition-all ${
                  period === p.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
                <span className={`ms-1.5 text-[10px] font-bold ${period === p.id ? "text-white/80" : "text-muted-foreground/70"}`}>
                  {p.note}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-3">
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
                <h3 className="text-lg font-extrabold">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
              </header>

              {/* قیمت */}
              <div className="mt-5">
                {plan.id === "trial" ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold tracking-tight">رایگان</span>
                    <span className="text-xs font-medium text-muted-foreground">۱۴ روز — بدون کارت بانکی</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold tracking-tight">{fa(PRICES[plan.id][period])}</span>
                      <span className="text-xs font-medium text-muted-foreground">تومان / {period === 6 ? "۶ ماه" : "سال"}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      معادل ماهی {fa(Math.round(PRICES[plan.id][period] / period))} تومان
                      {period === 12 ? " — دو ماه رایگان" : " — شش‌ماهه با تخفیف"}
                    </p>
                  </div>
                )}
              </div>

              <ul className="mt-5 space-y-3 border-t border-border/60 pt-5">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm leading-6">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                      <f.icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-foreground/90">{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* دموی تعاملی داخل کارت */}
              <PlanDemo kind={plan.demoKind} />

              <div className="mt-6">
                <TrackedLink
                  href="/start"
                  event="plan_start_click"
                  params={{ plan: plan.id, period: String(period) }}
                  useExternal={false}
                  className={`group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-transform active:scale-[0.98] ${
                    plan.featured
                      ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      : "border border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  {plan.id === "trial" ? "شروع رایگان ۱۴ روزه" : "۱۴ روز رایگان شروع کن"}
                </TrackedLink>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  دمو: {plan.demoHint}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* نکته انتخاب پلن */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
          <Star className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p>
            <b className="text-foreground">کدام پلن برای مطب شما؟</b> برای شروع، «آزمایشی» بدون هیچ هزینه‌ای
            محصول را در دست شما می‌گذارد؛ اگر فقط نوبت‌دهی می‌خواهید، «پایه» کامل است؛ و اگر می‌خواهید قبل از
            ورود بیمار، خلاصهٔ پرونده‌اش با وویس در تلگرام‌تان باشد، «حرفه‌ای» همان «منشی + دستیار دکتر» است —
            با هزینهٔ یک‌چهارم یک منشی واقعی.
          </p>
        </div>
      </section>

      {/* ─── پرسش‌های پرتکرار ─── */}
      <section className="mt-14" aria-label="پرسش‌های پرتکرار">
        <h2 className="text-center text-xl font-extrabold">پرسش‌های پرتکرار</h2>
        <div className="mx-auto mt-6 max-w-3xl space-y-3">
          {[
            {
              q: "بعد از پرداخت چه اتفاقی می‌افتد؟",
              a: "فعال‌سازی کاملاً خودکار است: همان لحظه که پرداخت زرین‌پال تأیید شود، اشتراک شما فعال می‌شود و لینک و کد QR مطب‌تان کار می‌کند. هیچ تماس و پیگیری دستی لازم نیست.",
            },
            {
              q: "نصب یا سورس‌کد لازم است؟",
              a: "نه. تکنار یک سرویس کامل (SaaS) است: فقط لینک اختصاصی takrah.top/c/نام‌شما و یک کد QR می‌گیرید؛ بقیه‌اش با ما. هیچ سورس‌کدی تحویل یا نصب روی سیستم شما نمی‌شود.",
            },
            {
              q: "اطلاعات بیمارها کجا نگه‌داری می‌شود؟",
              a: "روی زیرساخت ابری امن (Upstash) با کلید اختصاصی هر مطب؛ فقط سیستم خودتان به داده‌های مطب‌تان دسترسی دارد و دستیار پزشک، پیام‌ها را ناشناس برای هوش مصنوعی خلاصه می‌کند.",
            },
            {
              q: "می‌توانم بعداً پلن را عوض کنم یا لغو کنم؟",
              a: "بله؛ در پایان هر دوره آزادید پلن را ارتقا دهید، به دورهٔ دیگر بروید یا تمدید نکنید — بدون جریمه. روزهای باقی‌ماندهٔ اشتراک فعال هم هنگام ارتقا از بین نمی‌رود.",
            },
          ].map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border/60 bg-card p-4 open:shadow-sm">
              <summary className="cursor-pointer list-none text-sm font-extrabold marker:hidden">
                <span className="ms-1 text-emerald-600 dark:text-emerald-400">›</span> {f.q}
              </summary>
              <p className="mt-2.5 text-[0.83rem] leading-7 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── نوار تماس ─── */}
      <section className="mt-10 overflow-hidden rounded-3xl border border-emerald-600/25 bg-gradient-to-l from-emerald-600/10 via-transparent to-emerald-600/10 p-6 text-center sm:p-8">
        <h2 className="text-lg font-extrabold">سؤالی دارید؟ همین حالا بپرسید</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
          تیم تکنار (JSDevelop — فعال از ۲۰۰۹) برای انتخاب پلن یا راه‌اندازی مطب‌تان کنارتان است؛
          اما خرید و فعال‌سازی کاملاً خودکار است و نیازی به تماس نیست.
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
        </div>
      </section>

      {/* لینک بازگشت */}
      <div className="mt-10 text-center">
        <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          ← بازگشت به صفحه اصلی تک‌راه
        </Link>
      </div>
    </main>
  );
}
