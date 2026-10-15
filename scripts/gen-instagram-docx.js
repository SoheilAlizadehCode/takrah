// Takrah Instagram Launch Kit — Persian RTL docx (R1 cover recipe adapted for RTL)
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, PageNumber, NumberFormat, AlignmentType, HeadingLevel,
  WidthType, BorderStyle, ShadingType, SectionType, TableOfContents,
  PageBreak, TableLayoutType,
} = require("docx");
const fs = require("fs");

// ---------- Palette (Takrah teal/cream brand) ----------
const P = {
  primary: "0F3D3A", body: "1F2937", secondary: "5B6B68",
  accent: "0D9488", surface: "F0FDFA",
  coverBg: "0E3B38", coverTitle: "FFF7ED", coverSub: "CBE5E1",
  coverMeta: "D9ECE9", coverFooter: "9FBBB6",
};

// ---------- Fonts (Persian: Tahoma — universal Arabic-script support) ----------
const F = { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma", eastAsia: "Tahoma" };

// ---------- Borders ----------
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ---------- RTL helpers ----------
function rtl(text, opts = {}) {
  return new TextRun({
    text, rightToLeft: true, font: F, sizeComplexScript: true,
    size: opts.size || 24, bold: opts.bold || false, boldComplexScript: opts.bold || false,
    italics: opts.italics || false, color: opts.color || P.body,
  });
}
function bodyP(text, opts = {}) {
  return new Paragraph({
    bidirectional: true, alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: opts.after ?? 120 },
    children: [rtl(text, opts)],
  });
}
function itemP(text, opts = {}) { // list item with hanging Persian numeral included in text
  return new Paragraph({
    bidirectional: true, alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    indent: { right: opts.indent ?? 280 },
    children: [rtl(text, opts)],
  });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.RIGHT,
    spacing: { before: 360, after: 160, line: 340, lineRule: "atLeast" },
    children: [rtl(text, { size: 32, bold: true, color: P.primary })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
    spacing: { before: 260, after: 120, line: 312 },
    children: [rtl(text, { size: 28, bold: true, color: P.primary })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3, bidirectional: true, alignment: AlignmentType.RIGHT,
    spacing: { before: 200, after: 100, line: 312 },
    children: [rtl(text, { size: 24, bold: true, color: P.accent })],
  });
}
function tipBox(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, visuallyRightToLeft: true,
    borders: { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: P.surface },
        margins: { top: 140, bottom: 140, left: 200, right: 200 },
        borders: { top: NB, bottom: NB, right: { style: BorderStyle.SINGLE, size: 24, color: P.accent }, left: NB },
        children: [
          new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { line: 312, after: 60 }, children: [rtl(title, { bold: true, size: 22, color: P.accent })] }),
          new Paragraph({ bidirectional: true, alignment: AlignmentType.JUSTIFIED, spacing: { line: 312 }, children: [rtl(text, { size: 22 })] }),
        ],
      })],
    })],
  });
}
function tableRTL(title, headers, rows, widths) {
  const cell = (text, isHead, w) => new TableCell({
    width: { size: w, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: isHead ? P.primary : "FFFFFF" },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { line: 288 },
      children: [rtl(text, { size: 20, bold: isHead, color: isHead ? "FFFFFF" : P.body })],
    })],
  });
  return [
    new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT, keepNext: true,
      spacing: { before: 160, after: 80, line: 312 },
      children: [rtl(title, { bold: true, size: 22, color: P.secondary })],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE }, visuallyRightToLeft: true,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: P.primary },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: P.primary },
        left: NB, right: NB,
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D6E4E0" },
        insideVertical: NB,
      },
      rows: [
        new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((t, i) => cell(t, true, widths[i])) }),
        ...rows.map((r, ri) => new TableRow({
          cantSplit: true,
          children: r.map((t, i) => {
            const c = cell(t, false, widths[i]);
            return c;
          }),
        })),
      ],
    }),
  ];
}

// ---------- Cover (R1 adapted for RTL) ----------
function calcTitleLayoutFa(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 12; // Persian glyphs are ~0.55em
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  const split = (t, cpl) => {
    if (t.length <= cpl) return [t];
    const words = t.split(" ");
    const lines = []; let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length <= cpl) cur = (cur + " " + w).trim();
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
      const last = lines.pop(); lines[lines.length - 1] += " " + last;
    }
    return lines;
  };
  let pt = preferredPt, lines;
  while (pt >= minPt) {
    lines = split(title, charsPerLine(pt));
    if (lines.length <= 3) break;
    pt -= 2;
  }
  return { titlePt: pt, titleLines: lines };
}
function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838 } = params;
  const SAFETY = 1200;
  const usable = pageHeight - SAFETY;
  const titleH = titleLineCount * (titlePt * 23 + 200);
  const subH = hasSubtitle ? (12 * 23 + 600) : 0;
  const engH = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaH = metaLineCount * (10 * 23 + 100);
  const content = titleH + subH + engH + metaH + fixedHeight + 3 * 300;
  const rem = Math.max(usable - content, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(rem * 0.45), rawBottom = Math.floor(rem * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, bottomSpacing };
}
function buildCoverR1RTL(config) {
  const padR = 1200, padL = 800;
  const availableWidth = 11906 - padR - padL - 300;
  const { titlePt, titleLines } = calcTitleLayoutFa(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentRight = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  children.push(new Paragraph({
    bidirectional: true, alignment: AlignmentType.RIGHT,
    indent: { right: padR, left: padL }, spacing: { after: 500 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
    children: [new TextRun({ text: config.englishLabel.split("").join(" "), size: 18, color: P.accent, font: F, characterSpacing: 40 })],
  }));
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT,
      indent: { right: padR, left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [rtl(titleLines[i], { size: titleSize, bold: true, color: P.coverTitle })],
    }));
  }
  children.push(new Paragraph({
    bidirectional: true, alignment: AlignmentType.RIGHT,
    indent: { right: padR, left: padL }, spacing: { after: 800, line: 312 },
    children: [rtl(config.subtitle, { size: 24, color: P.coverSub })],
  }));
  for (const line of config.metaLines) {
    children.push(new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT,
      indent: { right: padR + 200, left: padL }, spacing: { after: 80, line: 312 },
      border: { right: accentRight },
      children: [rtl(line, { size: 24, color: P.coverMeta })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    bidirectional: true, alignment: AlignmentType.RIGHT,
    indent: { right: padR, left: padL },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      rtl(config.footerRight, { size: 16, color: P.coverFooter }),
      new TextRun({ text: "                                   ", font: F }),
      new TextRun({ text: config.footerLeft, size: 16, color: P.coverFooter, font: F }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.coverBg }, borders: noBorders,
        children,
      })],
    })],
  })];
}

// ---------- Posts data (12 posts) ----------
const POSTS = [
  { n: 1, format: "ریلز", title: "تک‌راه چیه و چرا باید بشناسی؟", goal: "معرفی برند و تثبیت جایگاه",
    scenario: [
      "قاب ۱ (۰ تا ۳ ثانیه — قلاب): متن بزرگ روی صفحه: «اگه می‌خوای با هوش مصنوعی پول دربیاری، ۵ ثانیه وایسا». تو با انرژی جلوی دوربین یا فقط متن متحرک با موسیقی ترند.",
      "قاب ۲ (۳ تا ۱۰ ثانیه): سه شات سریع از صفحه‌ی مقاله‌ها در سایت تک‌راه با زوم روی تیترها: درآمد با AI، امنیت، آموزش پایتون.",
      "قاب ۳ (۱۰ تا ۲۰ ثانیه): متن: «هر هفته مقاله‌های کامل و رایگان + خلاصه‌شون اینجا». لوگو در مرکز با افکت ظاهر شدن.",
      "قاب ۴ (پایان): «فالو کن تا بقیه‌ی مسیر رو با هم بریم» + فلش به دکمه‌ی فالو.",
    ],
    caption: "سلام تک‌راهی‌ها! اینجا قراره زبان ساده درباره‌ی هوش مصنوعی و راه‌های درآمدش حرف بزنیم؛ بدون پیچوندن، بدون وعده‌ی الکی. هر مقاله‌ی کامل سایت، اینجا خلاصه‌ی کاربردی می‌شه. اولین قدم؟ فالو کن و تو کامنت بنویس دنبال چی هستی: درآمد، آموزش، یا امنیت 👇",
    hashtags: "#تک_راه #هوش_مصنوعی #درآمد_اینترنتی #ai #تعقیب_کن" },
  { n: 2, format: "ریلز", title: "۳ ابزار هوش مصنوعی رایگان که کارت رو نصف می‌کنن", goal: "ارزش فوری و سیو گرفتن",
    scenario: [
      "قاب ۱ (قلاب): «۳ تا ابزار رایگان که به قول اسمشون عمل می‌کنن — شماره ۳ رو از دست نده».",
      "قاب ۲: اسکرین‌رکورد سریع از ChatGPT در حال نوشتن متن — زیرنویس: «نوشتن هر متنی در چند ثانیه».",
      "قاب ۳: اسکرین‌رکورد از Canva — «طراحی پست و رزومه بدون طراحی بلد بودن».",
      "قاب ۴: اسکرین‌رکورد از یکی از ابزارهای تصویرساز — «عکس و لوگو فقط با توضیح متنی».",
      "قاب ۵: «لیست کامل ۱۰+ ابزار رایگان تو مقاله‌ی سایت هست — لینک بیو».",
    ],
    caption: "این سه‌تا رو سیو کن، چون هر روز بهشون نیاز پیدا می‌کنی! ChatGPT برای متن، Canva برای طراحی و ابزارهای تصویرساز برای عکس. لیست کامل‌تر با معرفی هر ابزار و لینک مستقیم، تو مقاله‌ی ابزارهای رایگان هوش مصنوعی سایت هست (لینک بیو). کدومشون رو تا حالا امتحان کردی؟ 🤖",
    hashtags: "#ابزار_رایگان #هوش_مصنوعی #chatgpt #canva #ترفند" },
  { n: 3, format: "کاروسل", title: "۵ راه درآمد با هوش مصنوعی برای ایرانی‌ها", goal: "سیو و اشتراک‌گذاری بالا",
    scenario: [
      "اسلاید ۱ (کاور): «۵ راه واقعی درآمد با AI در ایران — اسلایدها رو سیو کن» + طراحی برند با رنگ فیروزه‌ای.",
      "اسلاید ۲: فریلنسری با AI — «با ابزارهای AI سریع‌تر تحویل بده، بیشتر سفارش بگیر».",
      "اسلاید ۳: تولید محتوا برای کسب‌وکارها — «پست، کپشن و ویدیو بفروش؛ مشتری همه‌جا هست».",
      "اسلاید ۴: فروش محصول دیجیتال — «یه بار بساز، هزار بار بفروش».",
      "اسلاید ۵: افیلیت مارکتینگ — «لینک معرفی بذار، از هر فروش کمیسیون بگیر».",
      "اسلاید ۶: خدمات AI به مغازه‌ها — «لوگو و منوی دیجیتال برای رستوران محلت».",
      "اسلاید ۷ (پایان): «هر کدوم تو سایت تک‌راه یه مقاله‌ی کامل داره — لینک بیو. کدوم برات جذاب‌تره؟ کامنت کن».",
    ],
    caption: "دیگه این جمله رو نشنیدم که «هوش مصنوعی برای ما ایرانی‌ها به درد نمی‌خوره»! این ۵ راه همشون با تومان و بدون نیاز به پی‌پال قابل اجرا هستن. اسلایدها رو سیو کن و بگو کدوم مسیر رو می‌خوای ازش شروع کنی؛ اگه کامنت کنی، راهنمایی‌ت می‌کنم از کدوم مقاله شروع کنی 🚀",
    hashtags: "#درآمد_اینترنتی #هوش_مصنوعی #فریلنسری #کار_آنلاین #درآمد_دلاری" },
  { n: 4, format: "ریلز", title: "پرامپت حرفه‌ای در ۳۰ ثانیه — فرمول ۴ بخشی", goal: "آموزش سریع قابل استفاده",
    scenario: [
      "قاب ۱ (قلاب): «چرا جواب ChatGPTِ تو ضعیفه و جواب بقیه عالیه؟ مشکل پرامپتته».",
      "قاب ۲: روی صفحه بنویس فرمول: «نقش + هدف + جزئیات + فرمت» — هر بخش با یه رنگ.",
      "قاب ۳: مثال بد: «یه متن درباره‌ی فروش بنویس» — با ضربدر قرمز.",
      "قاب ۴: مثال خوب: «تو یه کپی‌رایتر فروش هستی. برای یه کافه‌ی خانوادگی، ۳ کپشن اینستاگرامی صمیمی با دعوت به اقدام بنویس» — با تیک سبز و جواب نمونه.",
      "قاب ۵: «فرمول کامل با مثال‌های بیشتر تو مقاله‌ی مهندسی پرامپت سایت هست — لینک بیو».",
    ],
    caption: "فرق یه کاربر معمولی با یه حرفه‌ای، فقط فرمول پرامپتشه! نقش بده، هدف بگو، جزئیات تعیین کن و فرمت جواب رو مشخص کن. این فرمول رو یک‌بار حفظ کن، دیگه هیچ‌وقت جواب‌های آبکی نمی‌گیری. مقاله‌ی کامل مهندسی پرامپت با ده‌ها مثال آماده تو سایت هست (لینک بیو) ✍️",
    hashtags: "#پرامپت #chatgpt #هوش_مصنوعی #آموزش_چت_جی_پی_تی #ترفند_هوش_مصنوعی" },
  { n: 5, format: "کاروسل", title: "ChatGPT بهتره یا Gemini؟ مقایسه‌ی صادقانه", goal: "کامنت و بحث (تعامل)",
    scenario: [
      "اسلاید ۱ (کاور): «ChatGPT یا Gemini؟ جواب از خودت می‌پرسه: برای چه کاری؟»",
      "اسلاید ۲: نقاط قوت ChatGPT — نوشتن خلاق، حافظه‌ی مکالمه، افزونه‌ها.",
      "اسلاید ۳: نقاط قوت Gemini — اتصال به گوگل، جستجوی زنده، رایگان بودن بخش بزرگی از امکانات.",
      "اسلاید ۴: جدول مقایسه‌ی ساده برای ۵ کاربرد: متن، کد، عکس، جستجو، ترجمه.",
      "اسلاید ۵: Claude هم یادت نره — پادشاه متن‌های طولانی و کدنویسی.",
      "اسلاید ۶ (پایان): «جواب نهایی: ترکیب کن! مقایسه‌ی کامل با جدول تو سایت هست. تو کدوم رو بیشتر استفاده می‌کنی؟ 👇»",
    ],
    caption: "این بحث تو کامنت‌ها همیشه داغه! راستش رو بخوای؟ هیچ‌کدوم «بهترین مطلق» نیست؛ هر کدوم برای کاری می‌درخشن. تو اسلایدها گفتم کی برنده‌ست، ولی نظر خودت چیه؟ ChatGPT یا Gemini؟ برام بنویس با دلیل 👇 مقاله‌ی کامل مقایسه با جدول کاربردها هم تو سایت هست (لینک بیو).",
    hashtags: "#chatgpt #gemini #هوش_مصنوعی #مقایسه #claude" },
  { n: 6, format: "ریلز", title: "وایب کدینگ — بدون یه خط کد، اپ بساز!", goal: "هیجان و اشتراک‌گذاری",
    scenario: [
      "قاب ۱ (قلاب): «این اپلیکیشن رو من با زبان انگلیسیِ ساده ساختم، نه کدنویسی!»",
      "قاب ۲: اسکرین‌رکورد از تایپ یک جمله در ابزار وایب کدینگ: «یه سایت رزرو نوبت آرایشگاهی بساز».",
      "قاب ۳: نمای سریع از ساخته شدن صفحه‌ها و دکمه‌ها به صورت زنده — با موسیقی ترند.",
      "قاب ۴: «به این می‌گن وایب کدینگ؛ ترند بزرگ ۲۰۲۶».",
      "قاب ۵: «۶ تا ابزارش + آموزش قدم‌به‌قدم تو مقاله‌ی کامل سایت هست — لینک بیو».",
    ],
    caption: "وایب کدینگ یعنی به‌جای کدنویسی، توضیح می‌دی چی می‌خوای و هوش مصنوعی می‌سازه! برای شروع شگفت‌انگیز هم کافیه یه ایده داشته باشی. تو مقاله‌ی کامل سایت، ۶ ابزار برتر و آموزش ۷ مرحله‌ای ساخت اولین اپ رو گذاشتم (لینک بیو). اگه می‌تونستی هر اپی بسازی، چی می‌ساختی؟ بگو تا راهنماییت کنم 💡",
    hashtags: "#وایب_کدینگ #برنامه_نویسی #هوش_مصنوعی #ساخت_اپ #بدون_کد" },
  { n: 7, format: "کاروسل", title: "چک‌لیست امنیت: رمز عبورت به این ۵ تا نزنه", goal: "اعتمادسازی و سیو",
    scenario: [
      "اسلاید ۱ (کاور): «اکانت تو ارزش چند میلیونه؟ این ۵ قانون رو جدی بگیر».",
      "اسلاید ۲: رمز هر اکانت جدا باشه — «یکی برای همه = کلید اصلی زندگی‌ت برای همه».",
      "اسلاید ۳: طول حداقل ۱۲ کاراکتر با حروف بزرگ و کوچیک، عدد و علامت.",
      "اسلاید ۴: ورود دو مرحله‌ای (2FA) رو همین امروز برای همه‌ی اکانت‌های مهمت فعال کن.",
      "اسلاید ۵: هرگز رمز رو تو پیام، چت یا عکس نفرست؛ مدیر هیچ‌سایتی رمز نمی‌پرسه.",
      "اسلاید ۶ (پایان): «راهنمای کامل ساخت رمز امن تو سایت هست. این پست رو برای خانواده‌ت بفرست — واقعاً لازمش دارن».",
    ],
    caption: "۹۰٪ هک‌ها از یه رمز ساده شروع می‌شن، نه از هکرهای خفن! این ۵ قانون رو همین امروز اجرا کن و این پست رو برای کسایی بفرست که دوستشون داری 😊 چک‌لیست کامل با مثال و ابزارهای پیشنهادی تو مقاله‌ی رمز عبور امن سایت هست (لینک بیو).",
    hashtags: "#امنیت #رمز_عبور #هک #حریم_خصوصی #امنیت_دیجیتال" },
  { n: 8, format: "ریلز", title: "با هوش مصنوعی موسیقی بساز و بفروش!", goal: "شگفتی و کلیک به بیو",
    scenario: [
      "قاب ۱ (قلاب): «این موزیک رو یه انسان ساخت؟ نه — یه جمله‌ی متنی!» + پخش نمونه‌ی موسیقی ساخته‌شده.",
      "قاب ۲: اسکرین‌رکورد از نوشتن پرامپت در Suno: «یه آروم ملایم برای پادکست با پیانو».",
      "قاب ۳: پخش خروجی + متن: «کمتر از یه دقیقه».",
      "قاب ۴: «۵ راه درآمدش: موزیک پس‌زمینه برای ویدیوکارا، پادکست، جینگل مغازه‌ها و...».",
      "قاب ۵: «راهنمای کامل + ترفند پرامپت‌نویسی موزیک تو سایت هست — لینک بیو».",
    ],
    caption: "صنعت موسیقی داره عوض می‌شه و این فرصت توئه! با Suno و ابزارهای مشابه، حتی بدون بلد بودن ساز و نت، موسیقی حرفه‌ای تولید می‌شه. تو مقاله‌ی کامل سایت ۵ مسیر درآمد + فرمول پرامپت‌نویسی موزیک رو آموزش دادم (لینک بیو). کدوم سبک رو اول امتحان می‌کنی؟ 🎵",
    hashtags: "#موسیقی_هوش_مصنوعی #suno #درآمد_اینترنتی #پادکست #تولید_محتوا" },
  { n: 9, format: "کاروسل", title: "دایپ‌فیک: با این ۵ نشونه از کلاهبرداری جان سالم به در ببر", goal: "حساسیت عمومی و اشتراک ویژه",
    scenario: [
      "اسلاید ۱ (کاور): «صدای مامانت رو تو واتساپ می‌شنوی که پول می‌خواد... واقعیه؟» — متن تکان‌دهنده برای جلب توجه.",
      "اسلاید ۲: نشونه‌ی ۱ — پلک زدن غیرطبیعی و چشم‌های شیشه‌ای تو ویدیو.",
      "اسلاید ۳: نشونه‌ی ۲ و ۳ — سایه‌ی ناهماهنگ با نور و لبه‌ی اطراف صورت که می‌لرزه.",
      "اسلاید ۴: نشونه‌ی ۴ — صدا: مکث‌های عجیب، لحن یکنواخت، تنفس نامرئی.",
      "اسلاید ۵: نشونه‌ی ۵ — درخواست فوری پول یا اطلاعات؛ قانون ۱۰ ثانیه: همیشه صبر کن و مستقیم تماس بگیر.",
      "اسلاید ۶ (پایان): «راهنمای کامل با لیست ابزارهای تشخیص تو سایت هست. اینو حتماً برای پدر و مادرت بفرست».",
    ],
    caption: "کلاهبرداری با صدای آشناها واقعیت شده و متأسفانه قربونی‌ها بیشتر آدمای مسن هستن! این ۵ نشونه رو یاد بگیر و حتماً این پست رو برای خانواده بفرست — یه اشتراک ساده می‌تونه جلوی یه فاجعه رو بگیره. راهنمای کامل تشخیص دایپ‌فیک با ابزارهای رایگان تو سایت هست (لینک بیو) 🛡️",
    hashtags: "#دایپ_فیک #کلاهبرداری #امنیت #هوش_مصنوعی #آگاهی" },
  { n: 10, format: "ریلز", title: "فریلنسری با AI: از صفر تا اولین سفارش", goal: "انگیزه و کلیک به سایت",
    scenario: [
      "قاب ۱ (قلاب): «می‌گن بازار فریلنسری اشباعه. اشتباه می‌کنن — اونی که AI بلده، تو بازار دیگه‌ای رقابت می‌کنه».",
      "قاب ۲: «۳ مهارت داغ: تولید محتوا، طراحی با AI، ساخت چت‌بات» — هر کدوم با یه نمونه‌ی سریع.",
      "قاب ۳: اسکرین‌رکورد از یکی از پلتفرم‌های فریلنسری ایرانی و قیمت سفارش‌ها.",
      "قاب ۴: «ترفند: با نمونه‌کار رایگان برای ۳ آشنا شروع کن — پرتفولیو تو یه هفته آماده‌ست».",
      "قاب ۵: «نقشه‌ی کامل قدم‌به‌قدم تو مقاله‌ی فریلنسری با AI سایت هست — لینک بیو».",
    ],
    caption: "فریلنسری با هوش مصنوعی یعنی ۱۰ برابر سریع‌تر تحویل بدهی و همین یعنی درآمد بیشتر در وقت کمتر! توی مقاله‌ی کاملش، لیست سفارش‌های داغ، قیمت‌گذاری و نقشه‌ی رسیدن به اولین مشتری رو گذاشتم (لینک بیو). سوالت رو بنویس؛ به همه جواب می‌دم 💪",
    hashtags: "#فریلنسری #درآمد_اینترنتی #هوش_مصنوعی #کار_دورکاری #مشاوره_شغلی" },
  { n: 11, format: "کاروسل", title: "افیلیت مارکتینگ: کمیسیون مادام‌العمر از معرفی", goal: "آموزش تخصصی و سیو",
    scenario: [
      "اسلاید ۱ (کاور): «یه بار معرفی کن، سال‌ها کمیسیون بگیر — افیلیت مارکتینگ چیه؟»",
      "اسلاید ۲: سازوکار: لینک معرفی ← کلیک ← خرید یا ثبت‌نام ← کمیسیون برات.",
      "اسلاید ۳: برنامه‌های ایرانی: صرافی‌های کریپتو (کمیسیون مادام‌العمر از معاملات)، هاستینگ، فروشگاه‌های قالب.",
      "اسلاید ۴: چرا به فالوور میلیونی نیاز نداری: «۵۰۰ مخاطب دقیق + اعتماد = درآمد».",
      "اسلاید ۵: ۴ اشتباه کشنده: اسپم لینک، معرفی چیز امتحان‌نشده، بی‌شفافیتی، تسلیم شدن زود.",
      "اسلاید ۶ (پایان): «نقشه‌ی ۳۰ روزه تا اولین کمیسیون تو مقاله‌ی کامل سایت هست. شفاف باش، محتوا بساز، صبر کن».",
    ],
    caption: "افیلیت مارکتینگ تنها مدل درآمدیه که با صفر تومان سرمایه شروع می‌شه و به اعتماد متکیه، نه فالوور میلیونی! اسلایدها رو سیو کن و نقشه‌ی ۳۰ روزه‌ی کاملش رو تو مقاله‌ی سایت بخون (لینک بیو). سوال: تا حالا از هیچ محصولی کمیسیون گرفتی؟ 💸",
    hashtags: "#افیلیت_مارکتینگ #درآمد_اینترنتی #بازاریابی #کمیسیون #لینک_معرفی" },
  { n: 12, format: "ریلز", title: "نقشه‌ی ۳۰ روزه‌ی یادگیری پایتون از صفر", goal: "جذب علاقه‌مندان برنامه‌نویسی",
    scenario: [
      "قاب ۱ (قلاب): «۳۰ روز دیگه می‌تونی به رزومه‌ت بنویسی: برنامه‌نویس پایتون. نقشه‌ش رو ببین».",
      "قاب ۲: هفته‌ی ۱: نصب و اولین برنامه + مفاهیم پایه — «همون امشب اولین کدت رو می‌نویسی».",
      "قاب ۳: هفته‌ی ۲ و ۳: تمرین روزانه‌ی ۲۰ دقیقه‌ای با پروژه‌های کوچیک واقعی.",
      "قاب ۴: هفته‌ی ۴: اولین پروژه‌ی واقعی — «یه ابزار کوچیک که خودت هر روز استفاده می‌کنی».",
      "قاب ۵: «نقشه‌ی کامل ۳۰ روزه با جزئیات هر روز تو مقاله‌ی سایت هست — لینک بیو. سیو کن و شروع کن!».",
    ],
    caption: "پایتون محبوب‌ترین زبان دنیای هوش مصنوعیه و یادگیریش از فکرت ساده‌تره! نقشه‌ی ۳۰ روزه رو طوری چیدم که هر روز فقط ۲۰ دقیقه وقت بذاری و آخر ماه یه پروژه‌ی واقعی داشته باشی. سیو کن، روز اول رو شروع کن و تو کامنت‌ها پیشرفتت رو بگو — دنبالش می‌کنم! 🐍 (نقشه‌ی کامل: لینک بیو)",
    hashtags: "#پایتون #برنامه_نویسی #آموزش_پایتون #یادگیری_برنامه_نویسی #هوش_مصنوعی" },
];


// ---------- Body content ----------
function buildBody() {
  const c = [];
  // ===== 1 =====
  c.push(h1("۱. استراتژی و هدف‌گذاری ۹۰ روز اول"));
  c.push(bodyP("اینستاگرام برای مخاطب فارسی‌زبان، پرترافیک‌ترین شبکه‌ی اجتماعی ایران است و دقیقاً همان جایی است که مخاطب تک‌راه — جوان، علاقه‌مند به فناوری و مشتاق درآمد اینترنتی — ساعت‌ها وقت می‌گذراند. تجربه‌ی صفحات موفق فارسی نشان می‌دهد ترافیک اینستاگرام سریع‌تر از گوگل جواب می‌دهد: در حالی که سئو سه تا شش ماه زمان می‌برد، یک ریلز موفق می‌تواند در یک هفته صدها بازدید سایت بسازد. برای همین این پکیج، اولین و فوری‌ترین کانال رشد مخاطب تک‌راه است."));
  c.push(bodyP("هدف ۹۰ روز اول را روی کیفیت می‌گذاریم، نه عدد فالوور: نتیجه‌ی موفق یعنی اولین ۱۰۰۰ فالوورِ هدفمند که پست‌ها را ذخیره می‌کنند، در کامنت‌ها سوال می‌پرسند و از لینک بیو وارد سایت و کانال تلگرام می‌شوند. سیو (Save) و اشتراک‌گذاری (Share) مهم‌ترین سیگنال‌های الگوریتم اینستاگرام هستند و دقیقاً همان رفتارهایی‌اند که بعداً به بازدید سایت و درآمد تبدیل می‌شوند. فالووری که فقط از روی کنجکاوی می‌آید و می‌رود، نه به الگوریتم کمک می‌کند نه به کسب‌وکار."));
  c.push(bodyP("قانون طلایی محتوای پیج: ۷۰ درصد آموزش خالص (ریلز و کاروسل کاربردی)، ۲۰ درصد داستان و پشت‌صحنه‌ی مسیر تک‌راه (رشد سایت، درس‌های واقعی) و ۱۰ درصد دعوت مستقیم به اقدام (مطالعه‌ی مقاله، عضویت در کانال). این نسبت، هم اعتماد می‌سازد و هم از بوی تبلیغ جلوگیری می‌کند؛ پیج‌ای که فقط تبلیغ می‌کند، فالوور نگه نمی‌دارد."));
  c.push(tipBox("معیار موفقیت هر پست", "بعد از هر پست سه عدد را نگاه کن: تعداد سیو، تعداد اشتراک‌گذاری و بازدید پروفایل. اگر سیو بالا بود، آن موضوع را با فرمت‌های تازه تکرار کن. اگر سیو پایین بود، قلاب را بازنویسی کن و دوباره با فرمتی جدید امتحانش کن — نه اینکه کل موضوع را رها کنی."));

  // ===== 2 =====
  c.push(h1("۲. هویت پیج: اسم، بیو و هایلایت‌ها"));
  c.push(bodyP("هویت پیج، اولین چیزی است که هم الگوریتم می‌بیند هم مخاطب. اسم کاربری (یوزرنیم) باید با برند تک‌راه یکدست باشد تا جستجوی برند در اینستاگرام هم به همین پیج برسد. سه گزینه به ترتیب اولویت پیشنهاد می‌شود؛ اگر گزینه‌ی اول آزاد نبود، برو سراغ بعدی:"));
  c.push(itemP("۱) takrah.top — نام نمایشی: «تک‌راه | هوش مصنوعی و درآمد». بهترین گزینه چون دقیقاً برند سایت است و جستجوی «تک راه» مستقیم این پیج را می‌آورد."));
  c.push(itemP("۲) takrah_ai — نام نمایشی: «تک‌راه | AI و درآمد». اگر نسخه‌ی اول آزاد نبود یا کوتاهی مهم بود."));
  c.push(itemP("۳) takrah.top.ir — نام نمایشی: «تک‌راه». گزینه‌ی احتیاطی با پسوند دامنه‌ی ایرانی."));
  c.push(bodyP("بیو فقط چهار خط دارد و هر خط یک کار می‌کند: خط اول هویت، خط دوم وعده‌ی ارزش، خط سوم سند اعتماد و خط چهارم دعوت به اقدام. این متن دقیق پیشنهاد می‌شود:"));
  c.push(tipBox("بیوی پیشنهادی (کپی کن)", "تک‌راه | هوش مصنوعی و درآمد / هر روز یه ترفند AI که پول‌سازه 🤖 / آموزش‌های کامل و رایگان در سایت / لینک مقاله‌های کامل 👇 (به همراه takrah.top)"));
  c.push(bodyP("هایلایت‌ها (استوری‌های ذخیره‌شده) ویترین پیج هستند و پنج کاور با پس‌زمینه‌ی فیروزه‌ای و آیکون ساده برایش تعریف کن: «شروع از اینجا» (پست معرفی + راهنمای پیج)، «درآمد با AI» (کاروسل‌های درآمدی)، «ابزارها» (معرفی ابزارهای هوش مصنوعی)، «امنیت» (پست‌های امنیتی مثل رمز و دایپ‌فیک) و «نقشه‌ها» (برنامه‌های ۳۰ روزه). هر هفته استوری‌های پربازدید را داخل هایلایت مرتبط ذخیره کن تا بازدیدکننده‌ی جدید در کمتر از یک دقیقه بفهمد این پیج چه ارزشی برایش دارد."));
  c.push(bodyP("تنظیمات فنی را هم همین روز اول انجام بده: اکانت را به حالت Business (حرفه‌ای) ببر تا آمار بازدید و تعامل را ببینی، دکمه‌ی «مشاهده‌ی لینک» را با آدرس takrah.top تنظیم کن و دسته‌بندی را روی «آموزش» یا «وب‌سایت آموزشی» بگذار. اگر قصد تبلیغات پولی بعداً را داری، همین حالا پیج را به اکانت متا (Meta Business) وصل کن تا رتارگتینگ آینده ساده شود."));

  // ===== 3 =====
  c.push(h1("۳. سه ستون محتوایی پیج"));
  c.push(bodyP("پیج‌ای که موضوعش روزی فرق می‌کند، رشد نمی‌کند. محتوای تک‌راه روی سه ستون ثابت می‌چرخد که هر کدام نقش مشخصی در قیف رشد دارند و ساختار تولید را هم ساده می‌کنند: هر هفته دقیقاً می‌دانی چند ریلز، چند کاروسل و چند استوری لازم داری."));
  c.push(itemP("ستون ۱ — ریلز آموزش سریع (۱۰ تا ۳۰ ثانیه): یکی از دغدغه‌های مخاطب را با قلاب قوی شروع کن و در چند ثانیه جواب بده. این‌ها موتور کشف (Discovery) پیج‌اند و به غیرفالوورها می‌رسند. فرمول ثابت: قلابِ متن‌محور در ۳ ثانیه اول، ۲ تا ۳ نکته‌ی سریع، و دعوت به سیو یا لینک بیو."));
  c.push(itemP("ستون ۲ — کاروسل آموزشی (۵ تا ۷ اسلاید): عمق دادن به همان موضوع ریلزها با طراحی یکدست فیروزه‌ای و کرم (هم‌رنگ سایت). کاروسل‌ها پادشاه سیو هستند و مخاطب را به بازگشت به پیج تشویق می‌کنند. اسلاید اول فقط یک وعده‌ی بزرگ دارد و اسلاید آخر همیشه دعوت به مقاله‌ی کامل سایت است."));
  c.push(itemP("ستون ۳ — استوری و پشت‌صحنه (روزانه): مسیر رشد تک‌راه را شفاف روایت کن: آمار سایت، درس‌های واقعی، نظرسنجی بین دو موضوع، و بازنشر ریلز و کاروسل. استوری به دیده‌شدن پیج در تب استوری کمک می‌کند و پرسش‌وپاسخ روزانه، نرخ تعامل را بالا می‌برد. این ستون کم‌هزینه‌ترین و انسانی‌ترین چهره‌ی پیج است."));
  c.push(bodyP("این سه ستون با هم یک چرخه‌ی کامل می‌سازند: ریلز مخاطب تازه را می‌آورد، کاروسل او را متخصص‌تر و وابسته‌تر می‌کند، استوری رابطه را روزانه زنده نگه می‌دارد و همه در نهایت به یک مقاله‌ی سایت ختم می‌شوند که در آن مسیر درآمد و سئو ادامه پیدا می‌کند."));

  // ===== 4 =====
  c.push(h1("۴. برنامه‌ی ۱۲ پست اول (سه هفته)"));
  c.push(bodyP("دوازده پست اول، ستون فقرات پیج را می‌سازند و همگی به مقاله‌های موجود سایت وصل‌اند تا بازدیدکننده همیشه مسیر ادامه داشته باشد. ترتیب پست‌ها عمدی است: از معرفی برند شروع می‌شود، سراغ ارزش فوری می‌رود، بعد موضوع‌های داغ را پوشش می‌دهد و در پایان با موضوع‌های عمیق‌تر (افیلیت و پایتون) علاقه‌مندان جدی را نگه می‌دارد. جدول زیر نقشه‌ی کلی است و سناریوی کامل هر پست در بخش بعد آمده:"));
  c.push(...tableRTL("جدول ۱ — نقشه‌ی ۱۲ پست اول",
    ["پست", "هفته", "فرمت", "موضوع", "هدف اصلی"],
    [
      ["۱", "۱", "ریلز", "معرفی تک‌راه", "تثبیت برند"],
      ["۲", "۱", "ریلز", "۳ ابزار AI رایگان", "ارزش فوری و سیو"],
      ["۳", "۱", "کاروسل", "۵ راه درآمد با AI در ایران", "سیو و اشتراک"],
      ["۴", "۲", "ریلز", "فرمول پرامپت ۴ بخشی", "آموزش کاربردی"],
      ["۵", "۲", "کاروسل", "مقایسه‌ی ChatGPT و Gemini", "تعامل و بحث"],
      ["۶", "۲", "ریلز", "وایب کدینگ بدون کدنویسی", "هیجان و اشتراک"],
      ["۷", "۲", "کاروسل", "چک‌لیست رمز عبور امن", "اعتماد و اشتراک خانوادگی"],
      ["۸", "۳", "ریلز", "موسیقی با هوش مصنوعی", "شگفتی و کلیک"],
      ["۹", "۳", "کاروسل", "۵ نشونه‌ی تشخیص دایپ‌فیک", "اشتراک عمومی"],
      ["۱۰", "۳", "ریلز", "فریلنسری با AI از صفر", "کلیک به مقاله"],
      ["۱۱", "۳", "کاروسل", "افیلیت مارکتینگ", "آموزش تخصصی"],
      ["۱۲", "۳", "ریلز", "نقشه‌ی ۳۰ روزه‌ی پایتون", "جذب برنامه‌نویس‌ها"],
    ],
    [8, 8, 14, 42, 28]));
  c.push(bodyP("بعد از این سه هفته، همین ریتم ادامه پیدا می‌کند: چهار ریلز و دو کاروسل در هفته به‌علاوه‌ی استوری روزانه. موضوع هر پست جدید را از مقاله‌های تازه‌ی سایت انتخاب کن تا پیج همیشه آینه‌ی سایت باشد؛ این هم محتوای تازه می‌دهد هم برای مقاله‌ها بازدید می‌سازد."));

  // ===== 5 =====
  c.push(h1("۵. سناریو و کپشن کامل ۱۲ پست"));
  c.push(bodyP("برای هر پست، سناریوی قاب‌به‌قاب (برای ریلزها) یا اسلایدبه‌اسلاید (برای کاروسل‌ها) به‌همراه کپشن کامل و هشتگ‌ها آماده است. فقط کافی است متن‌ها را در ابزار طراحی و ادیتور بگذاری و فیلم‌برداری/اسکرین‌رکورد کنی. کپشن‌ها با قلاب شروع می‌شوند چون اینستاگرام فقط دو خط اول را نمایش می‌دهد."));
  for (const p of POSTS) {
    c.push(h2(`پست ${p.n} — ${p.title} (${p.format})`));
    c.push(bodyP(`هدف: ${p.goal}`, { size: 22, color: P.secondary }));
    c.push(bodyP(p.format === "ریلز" ? "سناریوی قاب‌به‌قاب:" : "طرح اسلایدبه‌اسلاید:", { bold: true, size: 22, color: P.accent }));
    for (const s of p.scenario) c.push(itemP(s, { size: 22 }));
    c.push(bodyP("کپشن پیشنهادی:", { bold: true, size: 22, color: P.accent }));
    c.push(bodyP(p.caption, { size: 22 }));
    c.push(bodyP(p.hashtags, { size: 20, color: P.secondary }));
  }

  // ===== 6 =====
  c.push(h1("۶. تقویم هفتگی و ساعات طلایی انتشار"));
  c.push(bodyP("انتظام، مهم‌تر از تعداد است: بهتر است هفته‌ای ۶ پستِ مرتب داشته باشی تا دو هفته‌ی پرشور و بعد سکوت. جدول زیر ریتم پیشنهادی هفته‌ی ایرانی است که جمعه را برای استراحت و جمع‌بندی هفتگی آزاد گذاشته است. این تقویم را در تقویم گوشی بذار یا با ابزارهای زمان‌بندی اینستاگرام خودکارش کن:"));
  c.push(...tableRTL("جدول ۲ — تقویم هفتگی انتشار",
    ["روز", "محتوای روز", "ساعت پیشنهادی"],
    [
      ["شنبه", "ریلز آموزشی ستون ۱", "۱۲ ظهر تا ۲ بعدازظهر"],
      ["یکشنبه", "استوری تعاملی (نظرسنجی یا سوال)", "۹ تا ۱۱ شب"],
      ["دوشنبه", "کاروسل آموزشی ستون ۲", "۹ تا ۱۱ شب"],
      ["سه‌شنبه", "استوری: بازنشر ریلز + پاسخ به کامنت‌ها", "۸ تا ۱۰ شب"],
      ["چهارشنبه", "ریلز آموزشی ستون ۱", "۱۲ ظهر تا ۲ بعدازظهر"],
      ["پنجشنبه", "کاروسل یا ریلز دوم + استوری جمع‌بندی", "۹ تا ۱۱ شب"],
      ["جمعه", "استراحت یا استوری سبک پشت‌صحنه", "اختیاری"],
    ],
    [16, 52, 32]));
  c.push(bodyP("ساعت‌های بالا نقطه‌ی شروع خوبی برای مخاطب ایرانی هستند، اما بعد از دو هفته آمار واقعی پیج را ببین: در بخش Insights اکانت حرفه‌ای، ساعتی که فالوورهای تو بیشترین فعال بودن را دارند نشانی می‌شود؛ تقویم را با همان داده‌ی واقعی اصلاح کن. یک نکته‌ی دیگر: پست‌های سیوپذیر (کاروسل‌ها) را نزدیک شب بگذار، چون کاربر شب موقع آرامش سیو و مطالعه می‌کند؛ ریلزهای طناب‌دار صبح و ظهر هم خوب عمل می‌کنند."));

  // ===== 7 =====
  c.push(h1("۷. هشتگ‌ها، تعامل و آنالیز هفتگی"));
  c.push(bodyP("هشتگ، جاده‌ی کشف پیج است و ترکیب درستش مهم‌تر از تعدادش. برای هر پست ۱۰ تا ۱۵ هشتگ با سه لایه بگذار: ۳ تا ۴ هشتگ بزرگ عمومی (بالای یک میلیون پست مثل #هوش_مصنوعی و #درآمد_اینترنتی) برای ریچ گسترده، ۵ تا ۶ هشتگ متوسط تخصصی مثل #فریلنسری_ایرانی و #آموزش_پایتون که رقابت معقول دارند، و ۳ تا ۴ هشتگ برند مثل #تک_راه که مرجع آرشیو پیج خودت می‌شود. هشتگ‌های انگلیسی مثل #ai و #chatgpt را هم فراموش نکن؛ مخاطب فارسی‌زبان ساکن خارج از کشور با همین‌ها به تو می‌رسد."));
  c.push(bodyP("تعامل، سوخت الگوریتم است و قانونش ساده است: در یک ساعت اول بعد از هر پست به همه‌ی کامنت‌ها جواب بده؛ الگوریتم این واکنش سریع را جدی می‌گیرد. روزی ۱۵ تا ۲۰ دقیقه هم روی پیج‌های مرتبط (پیج‌های فناوری، درآمد و آموزش زبان) وقت بگذار و کامنت‌های واقعی و مفید بنویس؛ این روش قدیمی هنوز بهترین راه آوردن فالوور هدفمند است. هرگز کامنت نخر و فالوور فیک نگیر — این اعداد نابودکننده‌ی ریچ واقعی‌اند چون الگوریتم پیج را به مخاطب اشتباه پیشنهاد می‌دهد."));
  c.push(...tableRTL("جدول ۳ — معیارهای هفتگی که باید چک کنی",
    ["معیار", "کجا ببینم", "هدف هفته‌ی هشتم"],
    [
      ["نرخ تعامل (تعامل ÷ بازدید)", "Insights هر پست", "حداقل ۴ درصد"],
      ["تعداد سیو", "Insights هر پست", "۵۰ به بالا برای کاروسل‌ها"],
      ["بازدید پروفایل", "Insights اکانت", "روند صعودی هفته‌به‌هفته"],
      ["کلیک لینک بیو", "Insights اکانت", "۳۰ به بالا در هفته"],
      ["رشد فالوور واقعی", "Insights اکانت", "۵۰ تا ۱۵۰ فالوور تازه"],
    ],
    [30, 34, 36]));
  c.push(bodyP("یک بار در هفته (پیشنهاد: جمعه) این جدول را پر کن و سه سوال بپرس: کدام پست بیشترین سیو را گرفت؟ کدام قلاب بیشترین بازدید غیرفالوور را آورد؟ کدام موضوع کم‌فروغ ماند؟ جواب‌ها برنامه‌ی هفته‌ی بعدت می‌شود. این جلسه‌ی پنج‌دقیقه‌ای، فرق پیج‌ای که رشد می‌کند با پیج‌ای که فقط پست می‌گذارد است."));

  // ===== 8 =====
  c.push(h1("۸. قیف تبدیل فالوور به بازدید سایت"));
  c.push(bodyP("فالوور، خودش درآمد نیست؛ تبدیلِ فالوور به بازدیدکننده‌ی سایت است که مقاله‌ها را می‌خواند، مشترک کانال می‌شود و در بلندمدت مسیر درآمدی تک‌راه را می‌سازد. قیف پیشنهادی چهار لایه دارد و همه‌ی لایه‌ها از همین هفته‌ی اول باید فعال باشند:"));
  c.push(itemP("لایه‌ی ۱ — لینک بیو: آدرس takrah.top همیشه اولین لینک است. اگر بعداً چند لینک لازم شد، از سرویس‌های لینک‌باکس استفاده کن اما لینک اصلی سایت هرگز از بیو حذف نشود."));
  c.push(itemP("لایه‌ی ۲ — دعوت در کپشن: همه‌ی کپشن‌های این پکیج با عبارت «لینک بیو» تمام شده‌اند. این ثبات، عادت می‌سازد: مخاطب می‌داند ادامه‌ی مطلب کجاست."));
  c.push(itemP("لایه‌ی ۳ — استوری لینک‌دار: برای هر مقاله‌ی جدید سایت، استوری با برچسب لینک بگذار. استوریِ لینک‌دار سریع‌ترین راهبرد کلیک است و بازدیدهای همانی می‌سازد که گوگل دوستش دارد."));
  c.push(itemP("لایه‌ی ۴ — پل کانال تلگرام: در استوری‌ها و هایلایت «شروع از اینجا»، عضویت در کانال @takrahTop را هم پیشنهاد بده؛ کانال، پشتیبان پیج است: هر جا الگوریتم اینستاگرام کم‌کاری کرد، کانال مستقیم و بدون واسطه پیام می‌رساند."));
  c.push(bodyP("در ۹۰ روز اول، سرعت رشد را با اعداد قیف بسنج نه با فالوور: هفته‌ای چند نفر از اینستاگرام وارد سایت شده‌اند؟ چند نفر در کانال عضو شدند؟ اگر عدد‌ها بالا می‌روند ولی فالوور کند رشد می‌کند، نگران نباش — این یعنی مخاطبِ کم اما باکیفیت داری که دقیقاً همان چیزی است که درآمد افیلیت و محصولات آینده‌ی تک‌راه به آن وابسته است. این پکیج نقطه‌ی شروع است؛ با داده‌های واقعی ۹۰ روز، نسخه‌ی بعدی را با هم بازطراحی می‌کنیم."));
  return c;
}

// ---------- Footers ----------
function pageFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, font: F, color: "888888" })],
    })],
  });
}
function docHeader() {
  return new Header({
    children: [new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "D6E4E0", space: 4 } },
      children: [rtl("پکیج شروع اینستاگرام تک‌راه", { size: 16, color: "9FBBB6" })],
    })],
  });
}

// ---------- Assembly ----------
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: F, size: 24, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: { run: { font: F, size: 32, bold: true, color: P.primary }, paragraph: { spacing: { before: 360, after: 160, line: 340 } } },
      heading2: { run: { font: F, size: 28, bold: true, color: P.primary }, paragraph: { spacing: { before: 260, after: 120, line: 312 } } },
      heading3: { run: { font: F, size: 24, bold: true, color: P.accent }, paragraph: { spacing: { before: 200, after: 100, line: 312 } } },
    },
  },
  sections: [
    { // Section 1: Cover — margin 0, no footer
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR1RTL({
        englishLabel: "TAKRAH INSTAGRAM LAUNCH KIT",
        title: "پکیج شروع اینستاگرام تک‌راه",
        subtitle: "استراتژی رشد، هویت پیج، برنامه‌ی ۱۲ پست اول با سناریو و کپشن کامل",
        metaLines: [
          "موضوع: راه‌اندازی پیج اینستاگرام تک‌راه",
          "هدف: اولین ۱۰۰۰ فالوور هدفمند و بازدید سایت",
          "دوره: سه هفته‌ی اول + ریتم پایدار بعدی",
          "تهیه‌شده: مهر ۱۴۰۵",
        ],
        footerRight: "تک‌راه • هوش مصنوعی و درآمد",
        footerLeft: "takrah.top",
      }),
    },
    { // Section 2: TOC — Roman numerals
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      footers: { default: pageFooter() },
      children: [
        new Paragraph({
          bidirectional: true, alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360, line: 340 },
          children: [rtl("فهرست مطالب", { bold: true, size: 32, color: P.primary })],
        }),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({
          bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { before: 200, line: 312 },
          children: [rtl("توجه: این فهرست با کد فیلد ساخته شده است. برای به‌روزرسانی شماره صفحه‌ها بعد از باز کردن فایل، روی فهرست راست‌کلیک کن و گزینه‌ی Update Field را انتخاب کن.", { italics: true, size: 18, color: "888888" })],
        }),
        // NOTE: no PageBreak here — Section 3 uses SectionType.NEXT_PAGE which already breaks the page
      ],
    },
    { // Section 3: Body — Arabic numerals from 1
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: { default: docHeader() },
      footers: { default: pageFooter() },
      children: buildBody(),
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/takrah-instagram-launch-kit.docx", buf);
  console.log("OK — docx written:", buf.length, "bytes");
});
