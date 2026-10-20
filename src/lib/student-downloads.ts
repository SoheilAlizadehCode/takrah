// ─── کاتالوگ فایل‌های دانلودی بخش دانش‌آموزی تک‌راه ───
// فایل‌ها در پوشه private-downloads/ (خارج از public) نگهداری می‌شوند و فقط از طریق
// /api/student/file/<id> بعد از عبور از گیت (ورود + عضویت کانال + تبلیغ) سرو می‌شوند؛
// یعنی لینک مستقیم هیچ فایلی از بیرون در دسترس نیست.
//
// برای افزودن فایل جدید:
//   ۱) فایل را در private-downloads/ بگذار  ۲) یک شیء به همین آرایه اضافه کن — همین!

export interface DownloadFile {
  /** شناسه یکتا — در URL دانلود استفاده می‌شود */
  id: string;
  title: string;
  description: string;
  /** نام فایل روی دیسک داخل private-downloads */
  file: string;
  /** نام پیشنهادی فایل هنگام دانلود */
  downloadName: string;
  /** برچسب حجم برای نمایش */
  sizeLabel: string;
  badge?: string;
  group: "book" | "tool";
}

export const studentDownloads: DownloadFile[] = [
  {
    id: "book-network-hardware-212288",
    title: "کتاب درسی: نصب و نگهداری تجهیزات شبکه و سخت‌افزار",
    description:
      "PDF اصلی کتاب کارگاهی پنجم رشته شبکه و نرم‌افزار رایانه (پایه دوازدهم) — هر ۵ پودمان با کارگاه‌ها، شکل‌ها و چک‌لیست ارزشیابی. برای مقاله‌های پودمان‌به‌پودمانش هم صفحه خودش در کتابخانه منتظرته!",
    file: "book-212288-network-hardware.pdf",
    downloadName: "takrah-212288-tajhizat-shabakeh.pdf",
    sizeLabel: "۷ مگابایت",
    badge: "کتاب درسی",
    group: "book",
  },
  {
    id: "book-ecommerce-security-212290",
    title: "کتاب درسی: تجارت الکترونیک و امنیت شبکه",
    description:
      "PDF اصلی کتاب کارگاهی ششم رشته شبکه و نرم‌افزار رایانه (پایه دوازدهم) — از ایجاد کسب‌وکار الکترونیکی و فروشگاه‌ساز تا فایروال میکروتیک و نصب دوربین مداربسته.",
    file: "book-212290-ecommerce-security.pdf",
    downloadName: "takrah-212290-tejarat-electronic-security.pdf",
    sizeLabel: "۱۰٫۴ مگابایت",
    badge: "کتاب درسی",
    group: "book",
  },
  {
    id: "programming-roadmap-students",
    title: "نقشه‌راه برنامه‌نویسی برای دانش‌آموزان شبکه و نرم‌افزار",
    description:
      "هدیه تک‌راه: ۵ مرحله یادگیری از پایتون تا شبکه و پروژه واقعی + منابع رایگان فارسی + برنامه ۹۰ روزه — دقیقاً متناسب با رشته تو.",
    file: "takrah-programming-roadmap.pdf",
    downloadName: "takrah-programming-roadmap.pdf",
    sizeLabel: "کمتر از ۱ مگابایت",
    badge: "هدیه تک‌راه",
    group: "tool",
  },
  {
    id: "weekly-study-planner",
    title: "برنامه‌ریز مطالعه هفتگی (قابل چاپ)",
    description:
      "هدیه تک‌راه: جدول برنامه‌ریزی ۷ روزه برای پودمان‌های کتاب‌ها با ستون پیشرفت + تکنیک مرور اسپیس‌د ریپتیشن؛ چاپش کن و روی میزت بچسبون.",
    file: "takrah-study-planner.pdf",
    downloadName: "takrah-study-planner.pdf",
    sizeLabel: "کمتر از ۱ مگابایت",
    badge: "هدیه تک‌راه",
    group: "tool",
  },
];

export const getStudentDownload = (id: string): DownloadFile | undefined =>
  studentDownloads.find((f) => f.id === id);

/** شکل عمومی فایل برای کلاینت (بدون مسیر فایل سرور) */
export function publicFile(f: DownloadFile) {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    sizeLabel: f.sizeLabel,
    badge: f.badge,
    group: f.group,
    url: `/api/student/file/${f.id}`,
  };
}
