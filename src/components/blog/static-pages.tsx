"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2.5 text-lg font-extrabold">
        <span className="h-5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        {title}
      </h2>
      <div className="space-y-4 text-[0.97rem] leading-[2.1] text-foreground/85">{children}</div>
    </section>
  );
}

function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-9">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-8 text-muted-foreground">{subtitle}</p>
      </header>
      <div className="space-y-9">{children}</div>
    </div>
  );
}

// ─── درباره ما ───
function AboutPage() {
  return (
    <PageShell
      title="درباره تک‌راه"
      subtitle="ما باور داریم دسترسی به آموزش باکیفیت تکنولوژی باید برای همه ساده، قابل فهم و رایگان باشد."
    >
      <Section title="داستان ما">
        <p>
          تک‌راه در سال {siteConfig.founded} با یک هدف ساده متولد شد: پر کردن شکاف میان
          تکنولوژی پیش‌رونده و کاربران فارسی‌زبانی که به منابع آموزشی معتبر و به زبان خودشان
          نیاز دارند. ما دیدیم که بسیاری از آموزش‌های موجود یا بسیار فنی و گیج‌کننده‌اند یا
          عمق کافی ندارند؛ پس تصمیم گرفتیم مسیر سومی بسازیم: محتوای دقیق و کاملی که با زبان
          ساده نوشته شده باشد.
        </p>
        <p>
          نام «تک‌راه» از این ایده گرفته شده که تکنولوژی یک مسیر است، نه یک دیوار. هر مقاله
          ما یک قدم در این مسیر است؛ از اولین قدم‌هایی که مفاهیم پایه را توضیح می‌دهند تا
          راهنماهای پیشرفته‌ای که مهارت‌های تخصصی می‌سازند. خواننده ما می‌تواند از هر نقطه‌ای
          وارد شود و با خیال راحت جلو برود.
        </p>
      </Section>
      <Section title="چه چیزی منتشر می‌کنیم؟">
        <p>
          محتوای تک‌راه در شش دسته اصلی سازمان‌دهی شده است: هوش مصنوعی، موبایل، امنیت و حریم
          خصوصی، آموزش نرم‌افزار، اینترنت و ابزارها، و برنامه‌نویسی. برای هر موضوع، پیش از
          انتشار، تحقیق کامل انجام می‌دهیم، اطلاعات را از منابع معتبر راستی‌آزمایی می‌کنیم و
          متن را از نظر دقت فنی و روانی زبان بازبینی می‌کنیم. مقالات ما به‌طور دوره‌ای
          به‌روزرسانی می‌شوند تا با تغییرات دنیای واقعی همگام بمانند.
        </p>
      </Section>
      <Section title="اصول تحریریه ما">
        <p>
          سه اصل، ستون فقرات کار تحریریه تک‌راه است. صداقت: هیچ ادعایی بدون پشتوانه نمی‌نویسیم
          و در صورت اشتباه، اصلاح را شفاف اعلام می‌کنیم. سادگی: پیچیدگی نشانه دانش نیست؛ هنر
          ما ساده‌کردنِ درست است. استقلال: توصیه‌های ما بر اساس منفعت خواننده است، نه منافع
          تبلیغ‌کنندگان؛ تبلیغات نمایش‌داده‌شده در سایت همیشه از محتوای تحریریه تفکیک شده‌اند.
        </p>
      </Section>
      <Section title="با ما همراه باشید">
        <p>
          اگر پیشنهادی برای موضوع بعدی دارید، در یکی از مقالات خطایی دیدید یا فقط می‌خواهید
          سلام کنید، از صفحه تماس با ما خوشحال می‌شویم بشنویم. تک‌راه برای شما ساخته شده و با
          بازخورد شما بهتر می‌شود.
        </p>
      </Section>
    </PageShell>
  );
}

// ─── تماس با ما ───
function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً همه فیلدها را کامل کنید.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "پیام شما ثبت شد",
      description: "کار تیم تک‌راه در اولین فرصت با شما تماس می‌گیرد. متشکریم!",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <PageShell
      title="تماس با ما"
      subtitle="سؤالی دارید، پیشنهاد موضوعی هست یا می‌خواهید همکاری کنید؟ خوشحال می‌شویم بشنویم."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <a
          href={`mailto:${siteConfig.email}`}
          className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold">ایمیل</span>
            <span className="mt-1 block text-sm text-muted-foreground transition-colors group-hover:text-primary">
              {siteConfig.email}
            </span>
          </span>
        </a>
        <div className="flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold">پاسخ‌دهی</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              معمولاً حداکثر تا ۴۸ ساعت کاری پاسخ می‌دهیم
            </span>
          </span>
        </div>
      </div>

      <Section title="فرم پیام">
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="فرم تماس">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-sm font-medium">
                نام شما
              </label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً سارا محمدی"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-sm font-medium">
                ایمیل شما
              </label>
              <Input
                id="contact-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 text-start"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="contact-message" className="text-sm font-medium">
              پیام شما
            </label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="هر چه در دل دارید بنویسید…"
              rows={6}
              className="min-h-28"
            />
          </div>
          <Button type="submit" className="h-11 gap-2 px-6">
            <Send className="h-4 w-4" aria-hidden="true" />
            ارسال پیام
          </Button>
        </form>
      </Section>

      <Section title="گزارش خطا در محتوا">
        <p>
          دقت، اعتبار ماست. اگر اشکالی در یکی از مقالات دیدید — از غلط تایپی تا نکته فنی —
          لطفاً با عنوان مقاله و توضیح مشکل به ما خبر دهید. با نام خودتان از شما تشکر خواهیم
          کرد و متن را سریع اصلاح می‌کنیم.
        </p>
      </Section>
    </PageShell>
  );
}

// ─── سیاست حفظ حریم خصوصی ───
function PrivacyPage() {
  return (
    <PageShell
      title="سیاست حفظ حریم خصوصی"
      subtitle="حریم خصوصی شما برای ما مهم است. این صفحه توضیح می‌دهد چه اطلاعاتی جمع‌آوری می‌شود و چگونه از آن استفاده می‌کنیم."
    >
      <Section title="اطلاعاتی که جمع‌آوری می‌کنیم">
        <p>
          هنگام بازدید از تک‌راه، اطلاعات فنی استانداردی مانند نوع مرورگر، دستگاه، صفحات
          بازدیدشده و مدت ماندن به‌صورت ناشناس و تجمیعی ثبت می‌شود. این اطلاعات به ما کمک
          می‌کند بفهمیم کدام محتوا مفیدتر است و سایت را بهبود دهیم. اگر از فرم تماس استفاده
          کنید، تنها اطلاعاتی که خودتان وارد می‌کنید (نام، ایمیل و متن پیام) برای پاسخ‌دهی
          ذخیره می‌شود و هرگز به اشخاص ثالث فروخته نمی‌شود.
        </p>
      </Section>
      <Section title="کوکی‌ها (Cookies)">
        <p>
          تک‌راه مانند اکثر وب‌سایت‌ها از کوکی استفاده می‌کند. کوکی فایل کوچکی است که مرورگر
          شما ذخیره می‌کند و به بهبود تجربه بازدید (مثل حفظ تنظیمات ظاهری) کمک می‌کند. شما
          می‌توانید از تنظیمات مرورگر خود کوکی‌ها را محدود یا حذف کنید؛ البته ممکن است بخشی از
          امکانات سایت در آن صورت درست کار نکند.
        </p>
      </Section>
      <Section title="تبلیغات گوگل و کوکی‌های اشخاص ثالث">
        <p>
          این سایت ممکن است از سرویس تبلیغات گوگل (Google AdSense) برای نمایش تبلیغات استفاده
          کند. گوگل به‌عنوان ارائه‌دهنده شخص ثالث، از کوکی‌هایی مانند کوکی DoubleClick DART
          برای نمایش تبلیغات متناسب با بازدیدهای شما از این سایت و دیگر سایت‌های اینترنتی
          استفاده می‌کند. کاربران می‌توانند با مراجعه به صفحه تنظیمات تبلیغات گوگل، دریافت
          تبلیغات شخصی‌سازی‌شده را غیرفعال کنند. ما هیچ کنترلی بر کوکی‌های این ارائه‌دهندگان
          نداریم و جزئیات بیشتر در سیاست‌های حریم خصوصی گوگل در دسترس است.
        </p>
      </Section>
      <Section title="لینک‌های سایت‌های دیگر">
        <p>
          مقالات تک‌راه ممکن است به سایت‌های دیگر لینک بدهند. ما محتوای و سیاست‌های حریم خصوصی
          سایت‌های بیرونی را کنترل نمی‌کنیم و مسئولیتی در قبال آنها نداریم؛ پیشنهاد می‌کنیم
          قبل از اشتراک‌گذاری اطلاعات شخصی در هر سایتی، سیاست حریم خصوصی آن را مطالعه کنید.
        </p>
      </Section>
      <Section title="امنیت اطلاعات">
        <p>
          ما با اقدامات فنی و مدیریتی معقول از اطلاعات در اختیار خود محافظت می‌کنیم. با این
          حال، هیچ روش انتقال داده در اینترنت صددرصد امن نیست و نمی‌توانیم امنیت مطلق را تضمین
          کنیم؛ بنابراین از ارسال اطلاعات بسیار حساس (مانند اطلاعات بانکی) در فرم‌های سایت
          خودداری کنید.
        </p>
      </Section>
      <Section title="حریم خصوصی کودکان">
        <p>
          تک‌راه برای مخاطبان عمومی و سنین بالای ۱۳ سال طراحی شده و آگاهانه اطلاعاتی از کودکان
          جمع‌آوری نمی‌کند. اگر والد یا سرپرستی هستید و فکر می‌کنید کودک شما اطلاعات شخصی در
          اختیار ما گذاشته است، با ما تماس بگیرید تا سریع حذف شود.
        </p>
      </Section>
      <Section title="تغییرات این سیاست و ارتباط با ما">
        <p>
          این سیاست ممکن است به‌روزرسانی شود؛ تاریخ آخرین بازنگری در همین صفحه مشخص است و
          تغییرات مهم از طریق خود سایت اطلاع‌رسانی خواهد شد. برای هر سؤالی درباره این سیاست
          یا درخواست حذف اطلاعات خود، از طریق ایمیل {siteConfig.email} با ما در ارتباط باشید.
        </p>
      </Section>
    </PageShell>
  );
}

// ─── قوانین و مقررات ───
function TermsPage() {
  return (
    <PageShell
      title="قوانین و مقررات استفاده"
      subtitle="با استفاده از تک‌راه، این قوانین را می‌پذیرید. لطفاً با دقت بخوانید."
    >
      <Section title="پذیرش شرایط">
        <p>
          با ورود به سایت تک‌راه و استفاده از محتوای آن، شما تأیید می‌کنید که این قوانین را
          خوانده‌اید و می‌پذیرید. اگر با هر بخشی از این شرایط موافق نیستید، لطفاً از استفاده از
          سایت خودداری کنید. ما می‌توانیم این قوانین را در هر زمان به‌روزرسانی کنیم؛ نسخه
          جدید از لحظه انتشار در همین صفحه معتبر است.
        </p>
      </Section>
      <Section title="مالکیت محتوا و استفاده مجاز">
        <p>
          تمام محتوای منتشرشده در تک‌راه — شامل مقالات، متن‌ها، تصاویر و طراحی — متعلق به
          تک‌راه است و تحت حمایت قوانین کپی‌رایت قرار دارد. شما آزادید برای استفاده شخصی از
          محتوا مطالعه کنید، آن را به اشتراک بگذارید و به مقالات لینک بدهید؛ با این شرط که
          منبع (تک‌راه و آدرس صفحه) ذکر شود. کپی‌برداری کامل بدون ذکر منبع، بازنشر مقالات به
          نام خود یا استفاده تجاری بدون اجازه کتبی، مجاز نیست.
        </p>
      </Section>
      <Section title="ماهیت اطلاعاتی محتوا">
        <p>
          محتوای تک‌راه صرفاً جنبه آموزشی و اطلاع‌رسانی دارد و جایگزین مشاوره حرفه‌ای (پزشکی،
          مالی، حقوقی و…) نیست. ما برای دقت محتوا تلاش می‌کنیم اما هیچ تضمینی برای کامل و
          به‌روز بودن دائمی آن نمی‌دهیم؛ تصمیم‌های شما بر اساس اطلاعات سایت، مسئولیت خودتان
          است. توصیه‌های فنی ما را همیشه با شرایط واقعی خود و منابع رسمی تطبیق دهید.
        </p>
      </Section>
      <Section title="تبلیغات و لینک‌های شخص ثالث">
        <p>
          این سایت ممکن است تبلیغات ارائه‌دهندگان شخص ثالث (از جمله گوگل) و لینک‌های خارجی
          نمایش دهد. ما مسئولیت محتوا، کیفیت و اعتبار محصولات یا خدمات تبلیغ‌کنندگان و
          سایت‌های لینک‌شده را بر عهده نمی‌گیریم و هرگونه معامله شما با آنها مستقل از ما انجام
          می‌شود.
        </p>
      </Section>
      <Section title="محدودیت مسئولیت">
        <p>
          تک‌راه و تیم آن، در حداکثر مجاز قانون، مسئولیتی بابت خسارات مستقیم یا غیرمستقیم
          ناشی از استفاده یا عدم امکان استفاده از سایت و محتوای آن — از جمله از دست رفتن
          داده یا ضرر مالی — ندارند. سایت «همان‌گونه که هست» ارائه می‌شود و بدون تضمین
          بی‌وقفه بودن دسترسی است.
        </p>
      </Section>
      <Section title="قوانین حاکم و ارتباط">
        <p>
          این قوانین تابع قوانین جمهوری اسلامی ایران است و هر اختلافی از طریق مراجع قانونی
          ذی‌صلاح رسیدگی می‌شود. برای سؤالات درباره این مقررات می‌توانید از طریق ایمیل{" "}
          {siteConfig.email} با ما در تماس باشید.
        </p>
      </Section>
    </PageShell>
  );
}

export function StaticPageView({ pageId }: { pageId: string }) {
  switch (pageId) {
    case "about":
      return <AboutPage />;
    case "contact":
      return <ContactPage />;
    case "privacy":
      return <PrivacyPage />;
    case "terms":
      return <TermsPage />;
    default:
      return (
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">صفحه پیدا نشد</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            صفحه موردنظر وجود ندارد. از منوی بالا مسیر خود را انتخاب کنید.
          </p>
        </div>
      );
  }
}
