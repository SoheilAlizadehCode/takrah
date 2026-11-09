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
  {
    id: "lesson-ipv4-protocol-addressing",
    title: "درس‌نامه: پروتکل اینترنت و آدرس‌دهی IPv4",
    description:
      "درس‌نامهٔ کلاسی شبکه و اینترنت دوازدهم (هنرستان سما) به قلم سبحان علیزاده — از مفهوم پروتکل و گره/میزبان تا ساختار IPv4، پنج کلاس آدرس، Loopback و Broadcast با مثال و تمرین.",
    file: "ipv4-internet-protocol-addressing.pdf",
    downloadName: "takrah-ipv4-protocol-addressing.pdf",
    sizeLabel: "حدود ۶ مگابایت",
    badge: "درس‌نامه",
    group: "book",
  },
  {
    id: "lesson-dhcp-dns-windows-server",
    title: "درس‌نامه: خدمات DHCP و DNS در ویندوز سرور",
    description:
      "درس‌نامهٔ کلاسی به قلم سبحان علیزاده — فرایند DORA، ساخت Scope و رزرو/استثنا، رکوردهای DNS و کار هماهنگ DHCP+DNS با اسکرین‌شات واقعی ویندوز سرور؛ همراه ۳ سؤال تشریحی.",
    file: "dhcp-dns-windows-server.pdf",
    downloadName: "takrah-dhcp-dns-windows-server.pdf",
    sizeLabel: "حدود ۷ مگابایت",
    badge: "درس‌نامه",
    group: "book",
  },
  {
    id: "lesson-subnetting-resource-management",
    title: "درس‌نامه: زیرشبکه‌سازی و مدیریت منابع در ویندوز سرور",
    description:
      "درس‌نامهٔ کلاسی به قلم سبحان علیزاده — Subnetting با قرض‌گرفتن بیت و مثال کامل، کاربران و گروه‌ها، اشتراک‌گذاری و قوانین ترکیب مجوزهای Share و NTFS با جدول‌های مرجع.",
    file: "subnetting-resource-management.pdf",
    downloadName: "takrah-subnetting-resource-management.pdf",
    sizeLabel: "حدود ۷ مگابایت",
    badge: "درس‌نامه",
    group: "book",
  },
  {
    id: "lesson-persona-customer-journey",
    title: "درس‌نامه: پرسونا و نقشه سفر مشتری (کارآفرینی)",
    description:
      "درس‌نامهٔ کلاسی کارآفرینی دوازدهم به قلم سبحان علیزاده — پرسونا چیست، ۴ روش تحقیق، جدول ۸ خانه‌ای پرسونا با نمونهٔ کامل کافه و نقشه سفر ۵ مرحله‌ای مشتری + تکلیف سه‌بخشی.",
    file: "persona-customer-journey.pdf",
    downloadName: "takrah-persona-customer-journey.pdf",
    sizeLabel: "حدود ۷٫۶ مگابایت",
    badge: "درس‌نامه",
    group: "book",
  },
  {
    id: "lesson-network-installation-site-planning",
    title: "درس‌نامه: مسیر و محل نصب تجهیزات شبکه",
    description:
      "درس‌نامهٔ کلاسی شبکه و اینترنت دوازدهم به قلم سبحان علیزاده — ۵ مولفهٔ تعیین‌کننده: نویز EMI/RFI و فاصله‌گذاری از برق، قانون ۱۰۰ متر، چیدمان رک ۱۹ اینچ، خواندن پلان معماری و اصول ایمنی + چک‌لیست بازدید از محل.",
    file: "network-installation-site-planning.pdf",
    downloadName: "takrah-network-installation-site-planning.pdf",
    sizeLabel: "حدود ۶٫۵ مگابایت",
    badge: "درس‌نامه",
    group: "book",
  },
  {
    id: "lesson-wordpress-installation",
    title: "درس‌نامه: نصب و راه‌اندازی وردپرس",
    description:
      "درس‌نامهٔ کلاسی طراحی صفحات وب به قلم سبحان علیزاده — از پیش‌نیازهای PHP و MySQL و ابزارهای لوکال (XAMPP و Local) تا گشت‌وگذار کامل در ۱۰ منوی پیشخوان + پروژهٔ گالری نمونه‌کار با بارم‌بندی.",
    file: "wordpress-installation-guide.pdf",
    downloadName: "takrah-wordpress-installation-guide.pdf",
    sizeLabel: "حدود ۳٫۴ مگابایت",
    badge: "درس‌نامه",
    group: "book",
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
