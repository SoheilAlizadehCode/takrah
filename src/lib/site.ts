// ─── تنظیمات کلی سایت تک‌راه ───
// برای اتصال گوگل ادسنس، فقط کافیست شناسه ناشر خود را در adsenseClientId قرار دهید
export const siteConfig = {
  name: "تک‌راه",
  latinName: "TakRah",
  tagline: "مسیر تو به دنیای تکنولوژی",
  description:
    "تک‌راه مرجع فارسی‌زبان آموزش تکنولوژی است؛ مقالات ساده و کاربردی درباره هوش مصنوعی، موبایل، امنیت، برنامه‌نویسی و ابزارهای اینترنتی برای کاربران ایرانی.",
  // دامنه واقعی خود را بعد از خرید جایگزین کنید
  url: "https://takrah.vercel.app",
  // شناسه ناشر گوگل ادسنس — مثال: ca-pub-1234567890123456
  // بعد از تایید ادسنس این مقدار را پر کنید تا اسکریپت تبلیغات فعال شود
  adsenseClientId: "",
  email: "info@takrah.ir",
  founded: "۱۴۰۵",
};

export type Route =
  | { name: "home" }
  | { name: "category"; id: string }
  | { name: "article"; slug: string }
  | { name: "page"; id: PageId };

export type PageId = "about" | "contact" | "privacy" | "terms";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "ai",
    name: "هوش مصنوعی",
    description:
      "راهنمای دنیای هوش مصنوعی به زبان ساده؛ از مفاهیم پایه تا ترفندهای استفاده از ابزارهای هوشمند در کار و زندگی روزمره.",
  },
  {
    id: "mobile",
    name: "موبایل",
    description:
      "راهنمای خرید گوشی، ترفندهای کاربردی، مقایسه‌ها و هر آنچه برای استفاده هوشمندانه‌تر از گوشی همراه لازم دارید.",
  },
  {
    id: "security",
    name: "امنیت و حریم خصوصی",
    description:
      "محافظت از حساب‌ها، رمزهای عبور قوی، شناخت کلاهبرداری‌های اینترنتی و نکات حفظ حریم خصوصی در فضای دیجیتال.",
  },
  {
    id: "software",
    name: "آموزش نرم‌افزار",
    description:
      "آموزش گام‌به‌گام نرم‌افزارهای کاربردی مانند اکسل، ورد و ابزارهای اداری برای افزایش بهره‌وری در کار و تحصیل.",
  },
  {
    id: "web-tools",
    name: "اینترنت و ابزارها",
    description:
      "معرفی بهترین ابزارهای آنلاین، سرویس‌های وب و ترفندهای اینترنتی که کارهای روزانه شما را ساده‌تر می‌کنند.",
  },
  {
    id: "programming",
    name: "برنامه‌نویسی",
    description:
      "نقشه راه یادگیری برنامه‌نویسی از صفر، معرفی زبان‌ها و منابع آموزشی رایگان برای شروع مسیر شغلی در دنیای تکنولوژی.",
  },
];

export const getCategory = (id: string): Category =>
  categories.find((c) => c.id === id) ?? categories[0];

// ─── صفحات ثابت ───
export const staticPages: { id: PageId; title: string }[] = [
  { id: "about", title: "درباره تک‌راه" },
  { id: "contact", title: "تماس با ما" },
  { id: "privacy", title: "سیاست حفظ حریم خصوصی" },
  { id: "terms", title: "قوانین و مقررات" },
];
