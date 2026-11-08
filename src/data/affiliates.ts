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
  // ── لپ‌تاپ‌های اسنپ‌شاپ (لینک‌های کوتاه افیلیو؛ تست‌شده ۱۴۰۵/۸/۱۲) ──
  // همهٔ محصولات فعلی از اسنپ‌شاپ هستند (دیجی‌کالا این دسته را در پنل نداشت).
  {
    id: "laptop-lenovo-loq-15",
    store: "snappshop",
    title: "لپ‌تاپ لنوو LOQ 15",
    spec: "سری گیمینگ اقتصادی لنوو — انتخاب اول برای تدوین ویدیو و کارهای سنگین",
    url: "https://aflo.ir/QIWK4yV9m9",
  },
  {
    id: "laptop-asus-tuf-gaming",
    store: "snappshop",
    title: "لپ‌تاپ ایسوس TUF Gaming",
    spec: "بدنهٔ مقاوم و خنک‌کاری قوی — مناسب رندر و اجرای مدل‌های محلی AI",
    url: "https://aflo.ir/QFuWJO95Zr",
  },
  {
    id: "laptop-hp-victus-15",
    store: "snappshop",
    title: "لپ‌تاپ اچ‌پی Victus 15",
    spec: "گیمینگ اقتصادی اچ‌پی با گرافیک قدرتمند برای کار خلاقانه",
    url: "https://aflo.ir/QFWDdh5Z3z",
  },
  {
    id: "laptop-lenovo-ideapad-slim-5",
    store: "snappshop",
    title: "لپ‌تاپ لنوو IdeaPad Slim 5",
    spec: "سبک و کم‌مصرف — مناسب شروع یادگیری AI و کارهای روزمره",
    url: "https://aflo.ir/TDZdhGaMRl",
  },
  {
    id: "laptop-asus-vivobook-16",
    store: "snappshop",
    title: "لپ‌تاپ ایسوس VivoBook 16",
    spec: "نمایشگر بزرگ ۱۶ اینچی برای محتوا، چندکار همزمان و راحتی چشم",
    url: "https://aflo.ir/Yfvc6nkcNN",
  },
  {
    id: "laptop-apple-macbook-air",
    store: "snappshop",
    title: "لپ‌تاپ اپل MacBook Air",
    spec: "سبک با باتری طولانی — محبوب فریلنسرها و تولیدکنندگان محتوا",
    url: "https://aflo.ir/Gdx8La3ikM",
  },
];

/**
 * نقشهٔ مقاله → ترتیب نمایش محصول‌ها (با id محصول).
 * کلید = slug مقاله فارسی؛ باکس فقط برای این مقاله‌ها رندر می‌شود.
 *
 * منطق انتخاب:
 *  - ai-video-income / ai-image-generators-comparison → کار سنگین GPU → گیمینگ‌ها
 *  - make-money-with-ai → طیف بودجه کامل (گیمینگ + اقتصادی + مک)
 *  - learn-ai-from-zero → شروع‌کننده‌ها → اقتصادی و سبک
 */
export const PRODUCT_BOX_SLUGS: Record<string, string[]> = {
  "ai-video-income": [
    "laptop-lenovo-loq-15",
    "laptop-asus-tuf-gaming",
    "laptop-hp-victus-15",
    "laptop-apple-macbook-air",
  ],
  "ai-image-generators-comparison": [
    "laptop-lenovo-loq-15",
    "laptop-asus-tuf-gaming",
    "laptop-hp-victus-15",
    "laptop-lenovo-ideapad-slim-5",
  ],
  "make-money-with-ai": [
    "laptop-lenovo-loq-15",
    "laptop-asus-vivobook-16",
    "laptop-lenovo-ideapad-slim-5",
    "laptop-apple-macbook-air",
  ],
  "learn-ai-from-zero": [
    "laptop-lenovo-ideapad-slim-5",
    "laptop-asus-vivobook-16",
    "laptop-apple-macbook-air",
  ],
};
