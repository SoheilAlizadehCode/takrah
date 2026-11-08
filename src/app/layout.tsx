import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { LangChrome, LangFooter, HtmlLangSetter } from "@/components/blog/lang-chrome";
import { GAPageView } from "@/components/analytics";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// ─── گوگل آنالیتیکس ۴ ───
// شناسه در src/lib/site.ts (gaMeasurementId) نگهداری می‌شود؛
// اگر متغیر محیطی NEXT_PUBLIC_GA_ID در Vercel تنظیم شود بر آن اولویت دارد.
// اگر خالی باشد هیچ اسکریپتی لود نمی‌شود و سرعت سایت حفظ می‌شود.
const gaId = siteConfig.gaMeasurementId ?? "";

// فونت وزیرمتن به‌صورت متغیر (همه وزن‌ها در یک فایل) سلف‌هاست شده است؛
// next/font خودش CSS فونت را inline و فایل را preload می‌کند — بدون درخواست خارجی
const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-vazirmatn",
  fallback: ["Tahoma", "Arial", "sans-serif"],
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "تکنولوژی",
    "آموزش تکنولوژی",
    "هوش مصنوعی",
    "ChatGPT",
    "خرید گوشی",
    "امنیت اینترنت",
    "آموزش اکسل",
    "برنامه‌نویسی",
    "وردپرس",
    "ابزارهای آنلاین",
  ],
  authors: [{ name: `تحریریه ${siteConfig.name}`, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  category: "technology",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/images/covers/og-hero.png",
        width: 1344,
        height: 768,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/images/covers/og-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // ─── تایید مالکیت در Google Search Console ───
  // در سرچ کنسول روش «HTML tag» را انتخاب کنید و مقدار content را
  // در Vercel با نام NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION تنظیم کنید.
  // مثال: اگر کد گوگل این بود <meta name="google-site-verification" content="abc123" />
  // فقط abc123 را در متغیر محیطی قرار دهید.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#161b1c" },
  ],
  width: "device-width",
  initialScale: 1,
};

// داده ساختاریافته WebSite برای گوگل
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: siteConfig.latinName,
  url: siteConfig.url,
  inLanguage: "fa-IR",
  description: siteConfig.description,
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/favicon.svg`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {/* ─── یکتانت (رویدادنگار ناشر) — کد اکانت takrah.top؛ قبل از بقیه اسکریپت‌ها ───
            این اسکریپت برای تأیید سایت و اندازه‌گیری تبلیغات یکتانت لازم است؛
            اسکریپت تبلیغِ هر واحد جداگانه در کامپوننت AdSlot قرار می‌گیرد. */}
        <script
          id="yektanet-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              !function (t, e, n) {
                  t.yektanetAnalyticsObject = n, t[n] = t[n] || function () {
                      t[n].q.push(arguments)
                  }, t[n].q = t[n].q || [];
                  var a = new Date, r = a.getFullYear().toString() + "0" + a.getMonth() + "0" + a.getDate() + "0" + a.getHours(),
                      c = e.getElementsByTagName("script")[0], s = e.createElement("script");
                  s.id = "ua-script-FXwLxZRJ"; s.dataset.analyticsobject = n;
                  s.async = 1; s.type = "text/javascript";
                  s.src = "https://cdn.yektanet.com/rg_woebegone/scripts_v3/FXwLxZRJ/rg.complete.js?v=" + r, c.parentNode.insertBefore(s, c)
              }(window, document, "yektanet");
            `,
          }}
        />
        {/* ─── یکتانت (اسکریپت همسانی) — رسانهٔ native-49155 / کلید q5hLRjbH ───
            این همان «اسکریپت همسانی» پنل است (برای همهٔ صفحات، طبق راهنمای پنل).
            جانمایی «ثابت پایین» را خودکار رندر می‌کند؛ جانمایی «میان‌مطلب تصویری
            تکرارشونده» در کانتینر div با آی‌دی pos-article-display-card-123947
            رندر می‌شود که در article-view.tsx قرار دارد. */}
        <script
          id="yektanet-native-49155"
          dangerouslySetInnerHTML={{
            __html: `
              !function(e,t,n){
                  e.yektanetAnalyticsObject=n,
                  e[n]=e[n]||function(){e[n].q.push(arguments)},
                  e[n].q=e[n].q||[];
                  var a=t.getElementsByTagName("head")[0],
                      r=new Date,
                      c="https://cdn.yektanet.com/superscript-v2/q5hLRjbH/native-49155/yn_pub.js?v="
                          +r.getFullYear().toString()+"0"+r.getMonth()+"0"+r.getDate()+"0"+r.getHours(),
                      s=t.createElement("link");
                  s.rel="preload",
                  s.as="script",
                  s.href=c,
                  a.appendChild(s);
                  var l=t.createElement("script");
                  l.async=!0,
                  l.src=c,
                  a.appendChild(l);
              }(window,document,"yektanet");
            `,
          }}
        />
        {/* ─── گوگل آنالیتیکس ۴ (فقط وقتی NEXT_PUBLIC_GA_ID تنظیم شده باشد) ─── */}
        {gaId ? (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                // فیلتر ترافیک داخلی: اگر مرورگر با ?tk_internal=1 یک بار باز شده باشد،
                // دیگر هیچ داده‌ای به GA ارسال نمی‌شود (بازدیدهای خودِ صاحب سایت).
                var tkInternal = false;
                try { tkInternal = localStorage.getItem('tk_internal') === '1'; } catch (e) {}
                if (!tkInternal) { gtag('config', '${gaId}'); }
              `}
            </Script>
            <GAPageView gaId={gaId} />
          </>
        ) : null}
        {/* اسکریپت گوگل ادسنس — بعد از دریافت شناسه ناشر، در src/lib/site.ts مقدار adsenseClientId را پر کنید */}
        {siteConfig.adsenseClientId ? (
          <Script
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClientId}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <LangChrome />
            <HtmlLangSetter />
            <main className="flex-1" id="main-content">
              {children}
            </main>
            <LangFooter />
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
