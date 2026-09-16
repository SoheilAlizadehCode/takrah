# Worklog

---
Task ID: 1
Agent: Main agent (Super Z)
Task: ساخت وب‌سایت فارسی سئوشده «تک‌راه» برای درآمدزایی از گوگل ادسنس

Work Log:
- شفاف‌سازی نیاز کاربر با AskUserQuestion؛ کاربر انتخاب‌ها را به عهده agent گذاشت
- انتخاب‌های نهایی: موضوع آموزش و تکنولوژی، زبان فارسی، وبلاگ محتوایی، ۱۰ مقاله کامل، طراحی مینیمال ماندلا Medium، برند و دامنه جدید
- راه‌اندازی محیط با fullstack-dev skill (init script) در /home/z/my-project
- تولید ۱۱ تصویر کاور با image-generation (اسکریپت: scripts/generate-covers.sh) در public/images/covers/
- ساخت لایه داده: src/lib/site.ts (برند، دسته‌بندی‌ها، Route)، src/lib/blog-types.ts (Block/Article)، src/data/articles-1..4.ts (۱۰ مقاله کامل فارسی هرکدام ۷۰۰-۱۱۰۰ کلمه)، src/data/index.ts (توابع کمکی)
- ساخت کامپوننت‌ها در src/components/blog/: header (استیکی + منوی موبایل)، footer (sticky با mt-auto)، cards، article-view (نوار پیشرفت مطالعه، فهرست مطالب چسبان، breadcrumb، JSON-LD)، home-view، category-view، static-pages (درباره/تماس/حریم خصوصی/قوانین)، search-dialog، ad-slot، category-icon
- بازنویسی src/app/page.tsx به‌صورت SPA با مسیریابی hash (#/article/slug, #/category/id, #/page/id) مطابق محدودیت محیط که فقط route "/" قابل نمایش است
- بازنویسی src/app/layout.tsx: lang=fa dir=rtl، متادیتای کامل (OpenGraph/Twitter/robots)، فونت وزیرمتن از jsdelivr، ThemeProvider، JSON-LD وب‌سایت، تزریق شرطی اسکریپت ادسنس بر اساس siteConfig.adsenseClientId
- بازنویسی globals.css: پالت فیروزه‌ای/کرم (بدون آبی)، فونت فارسی، اسکرول‌بار سفارشی
- فایل‌های عمومی: favicon.svg، logo.svg، robots.txt، sitemap.xml، ads.txt (نمونه)
- رفع خطاها: کوتیشن داخل رشته اکسل، حذف setState در effect (هدر و جستجو)، بازگرداندن ایمپورت useTheme، هشدار aria-describedby دیالوگ
- تایید نهایی: bun run lint بدون خطا؛ تست مرورگر با agent-browser شامل صفحه اصلی، مقاله، دسته‌بندی، جستجو→کلیک نتیجه، دارک مود، موبایل ۳۹۰px، منوی موبایل، فوتر چسبان، جایگاه تبلیغ؛ کنسول بدون خطای واقعی

Stage Summary:
- وب‌سایت «تک‌راه» (takrah.ir) با ۱۰ مقاله کامل فارسی، ۶ دسته‌بندی، جستجو، دارک مود، سئوی فنی کامل و جایگاه‌های ادسنس آماده است
- برای فعال‌سازی ادسنس کاربر فقط باید siteConfig.adsenseClientId را پر کند و ads.txt را به‌روز کند
- تصاویر کاور در public/images/covers/ و اسکریپت تولیدشان در scripts/generate-covers.sh ذخیره است
- محدودیت محیط: فقط مسیر "/" قابل پیش‌نمایش است؛ برای دیپلوی واقعی با سئوی حداکثری پیشنهاد شد ساختار SPA به routeهای واقعی تبدیل شود

---
Task ID: 2
Agent: Main agent (Super Z)
Task: رفع مشکلات پرفورمنس PageSpeed سایت تک‌راه (فونت CDN، LCP، معماری SPA)

Work Log:
- تحلیل گزارش PageSpeed کاربر: رندر-بلاک شدن توسط CSS فونت jsDelivr (۲ ثانیه)، CLS فونت (۰.۱۰۲)، LCP lazy، TBT بالا (۹۵۰ms) به‌خاطر SPA تک‌باندل
- دانلود فونت وزیرمتن Variable (woff2 تک‌فایل ۱۱۱KB) به src/app/fonts/ و سلف‌هاست با next/font/local (CSS فونت inline + preload خودکار، حذف کامل درخواست خارجی)
- بازنویسی layout.tsx: حذف تگ head دستی (خطای هیدریشن whitespace)، انتقال اسکریپت ادسنس به next/script با strategy=afterInteractive، افزودن SiteChrome و Footer به layout مشترک
- تبدیل SPA هش‌دار به مسیرهای واقعی App Router: /article/[slug] و /category/[id] با generateStaticParams + dynamicParams=false، صفحات /about /contact /privacy /terms، not-found.tsx فارسی
- متادیتای اختصاصی هر صفحه: generateMetadata با canonical/OG/Twitter برای هر مقاله و دسته، JSON-LD مقاله + BreadcrumbList در صفحه مقاله
- تبدیل ویوها به Server Component: home-view, category-view, cards, footer, static-pages, ad-slot؛ آیلندهای کلاینت: site-chrome (هدر+جستجو)، reading-progress، contact-page
- جایگزینی همه لینک‌های هش‌دار (#/) با next/link به آدرس‌های واقعی؛ TOC مقاله به لینک بومی مرورگر (بدون JS)
- سایت‌مپ و robots پویا با app/sitemap.ts و app/robots.ts (حذف نسخه‌های static از public) — ۲۱ URL خودکار
- url سایت از env متغیر NEXT_PUBLIC_SITE_URL خوانده می‌شود (پیش‌فرض takrah.vercel.app؛ برای دامنه آینده بدون تغییر کد)
- رفع خطاها: hydration whitespace در head، fetchPriority تکراری با priority
- تایید کامل با agent-browser: صفحه اصلی، مقاله (URL واقعی + تایتل اختصاصی)، TOC anchor scroll، دارک مود، جستجو→کلیک نتیجه→ناوبری، دسته‌بندی، صفحات ثابت، فرم تماس (توست اعتبارسنجی)، 404، منوی موبایل، فوتر چسبان (viewport بلند)، موبایل ۳۹۰px؛ کنسول تازه کاملاً بدون خطا؛ lint بدون خطا

Stage Summary:
- هر صفحه مقاله/دسته حالا HTML استاتیک اختصاصی با متادیتای کامل دارد — سئو و شانس تایید ادسنس به‌طور قابل‌توجه بهتر شد
- گلوگاه‌های پرفورمنس رفع شد: بدون درخواست خارجی فونت، بدون رندر-بلاک، LCP با priority+preload، JS سمت کلاینت به آیلندهای کوچک محدود شد
- برای دیپلوی: push به GitHub → Vercel خودکار دیپلوی می‌کند؛ بعد از خرید دامنه فقط NEXT_PUBLIC_SITE_URL را در Vercel تنظیم کند
