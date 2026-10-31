/**
 * باکس CTA پکیج‌های اتوماسیون کلینیک JSDevelop — داده‌های باکس فروش
 *
 * صفحهٔ کامل پکیج‌ها /packages است (PackagesView)؛ این فایل فقط
 * خلاصهٔ تیزری است که انتهای مقاله‌های کسب‌وکاری نمایش داده می‌شود.
 * کلیک‌ها با رویدادهای package_cta_click (رفتن به صفحهٔ پکیج) و
 * package_contact_click (واتساپ) در GA4 ثبت می‌شوند.
 *
 * اگر مقالهٔ جدیدی به لیست اضافه شد فقط همین فایل را ویرایش کن.
 */

/** مقاله‌های هدف باکس پکیج (مقاله‌های کسب‌وکار و درآمد) */
export const PACKAGE_CTA_SLUGS: string[] = [
  "ai-in-sales-guide",
  "ai-chatbot-business",
  "ai-ecommerce-guide",
  "ai-marketing-business",
  "ai-service-business",
  "ai-income-iran",
];

/** چیپ‌های خلاصهٔ پلن‌ها — قیمت‌ها با صفحهٔ /packages هماهنگ نگه داشته شوند */
export const PACKAGE_CTA_PLANS = [
  {
    name: "پایه",
    price: "۱۸ میلیون تومان",
    note: "وب‌سایت کلینیک + فرم رزرو واتساپ",
  },
  {
    name: "استاندارد ⭐",
    price: "۳۵ میلیون تومان",
    note: "+ ۴ میلیون ماهانه — نوبت‌دهی آنلاین و ربات تلگرام",
  },
  {
    name: "VIP",
    price: "۵۵ میلیون تومان",
    note: "+ ۷ میلیون ماهانه — منشی هوش مصنوعی «آوا» ۲۴ ساعته",
  },
];
