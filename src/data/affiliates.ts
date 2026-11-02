/**
 * لینک‌های افیلیت تک‌راه — منبع واحد حقیقت
 *
 * همهٔ لینک‌های معرف اینجا هستند؛ اگر فردا لینکی عوض شد فقط همین فایل
 * ویرایش می‌شود. نمایش در سایت از طریق کامپوننت AffiliateBox انجام
 * می‌شود که هر کلیک را با رویداد affiliate_click در GA4 ثبت می‌کند
 * (پارامتر partner = کدام صرافی، article = کدام مقاله).
 *
 * نکات:
 *  - لینک‌ها لینک دعوت شخصی صاحب سایت‌اند و برای کاربر هزینهٔ اضافه ندارند.
 *  - اگر برنامهٔ افیلیت جدیدی اضافه شد (مثلاً دیجی‌کالا)، یک آیتم به
 *    همین لیست + تعیین جایگاه در AFFILIATE_BOX_SLUGS کافی است.
 */

export type AffiliatePartner = {
  id: "nobitex" | "wallex" | "tabdeal" | string;
  /** نام نمایشی صرافی */
  name: string;
  /** لینک دعوت شخصی */
  url: string;
  /** کد دعوت (اگر صرافی هم کد و هم لینک بدهد) */
  code?: string;
  /** مزیت کاربرِ دعوت‌شده — همان چیزی که صرافی رسماً اعلام کرده */
  perk: string;
};

export const AFFILIATE_EXCHANGES: AffiliatePartner[] = [
  {
    id: "nobitex",
    name: "نوبیتکس",
    url: "https://nobitex.ir/signup/?refcode=F4D02B4",
    perk: "۳۰٪ تخفیف دائمی کارمزد معاملات",
  },
  {
    id: "wallex",
    name: "والکس",
    url: "https://wallex.ir/signup?ref=abgsyvu",
    perk: "هدیهٔ حداقل ۱۲٫۵٪ از کارمزد معاملات",
  },
  {
    id: "tabdeal",
    name: "تبدیل",
    url: "https://tabdeal.org/auth/register-req?refcode=9smaa8",
    code: "9smaa8",
    perk: "۱۰٪ تخفیف کارمزد معاملات",
  },
];

/**
 * مقاله‌هایی که باکس افیلیت صرافی‌ها در انتهای بدنه‌شان نمایش داده می‌شود.
 *  - best-iranian-crypto-exchanges → مقایسهٔ صرافی‌ها (اینتنت سرچ بالا)
 *  - affiliate-marketing-guide     → آموزش افیلیت (نمونهٔ عملی)
 */
export const AFFILIATE_BOX_SLUGS: string[] = [
  "best-iranian-crypto-exchanges",
  "affiliate-marketing-guide",
];

/* ------------------------------------------------------------------ */
/* افیلیو (پلتفرم افیلیت ایرانی) — دیجی‌کالا و اسنپ‌شاپ، کمیسیون تومانی */
/* ------------------------------------------------------------------ */

export type AffiliateStore = "digikala" | "snappshop";

/** نام نمایشی و متن دکمهٔ هر فروشگاه */
export const AFFILIATE_STORES: Record<AffiliateStore, { name: string; cta: string }> = {
  digikala: { name: "دیجی‌کالا", cta: "مشاهدهٔ قیمت در دیجی‌کالا" },
  snappshop: { name: "اسنپ‌شاپ", cta: "مشاهدهٔ قیمت در اسنپ‌شاپ" },
};

/**
 * محصول‌های افیلیت — لینک کوتاه (aflo.ir/…) از پنل افیلیو ساخته می‌شود
 * (پنل → کارت فروشگاه → «افیلیت لینک‌ها» → پیست‌کردن URL محصول).
 * هر کلیک با affiliate_click ثبت می‌شود: partner = فروشگاه، item = همین id.
 * قیمت‌ها نمایشی‌اند و باید هر چند هفته دستی آپدیت شوند.
 */
export type AffiliateProduct = {
  /** شناسهٔ یکتا — در GA4 به‌عنوان item ثبت می‌شود، مثلا laptop-lenovo-loq-15 */
  id: string;
  store: AffiliateStore;
  /** نام نمایشی محصول */
  title: string;
  /** یک خط مشخصهٔ کلیدی برای مقایسه */
  spec?: string;
  /** قیمت نمایشی (اختیاری) */
  price?: string;
  /** لینک کوتاه افیلیو — از پنل ناشر */
  url: string;
};

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // لینک‌ها از پنل افیلیو ساخته می‌شوند و اینجا اضافه می‌شوند.
  // نمونهٔ ساختار:
  // {
  //   id: "laptop-lenovo-loq-15-rtx4060",
  //   store: "digikala",
  //   title: "لپ‌تاپ لنوو LOQ 15 — RTX 4060",
  //   spec: "Core i5-12450HX | 16GB | SSD 512GB | 144Hz",
  //   url: "https://aflo.ir/xxxx",
  // },
];

/**
 * نقشهٔ مقاله → ترتیب نمایش محصول‌ها (با id محصول).
 * کلید = slug مقاله فارسی؛ باکس فقط برای این مقاله‌ها رندر می‌شود.
 */
export const PRODUCT_BOX_SLUGS: Record<string, string[]> = {};
