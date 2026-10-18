// Takrah Video Script #01 — Persian RTL docx (copywriting scene: no cover, no TOC, line 400)
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Footer, PageNumber, AlignmentType, HeadingLevel, WidthType,
  BorderStyle, ShadingType,
} = require("docx");
const fs = require("fs");

// ---------- Palette (Takrah teal/cream brand) ----------
const P = {
  primary: "0F3D3A", body: "1F2937", secondary: "5B6B68",
  accent: "0D9488", surface: "F0FDFA", grey: "999999",
};

// ---------- Fonts (Persian: Tahoma — universal Arabic-script support) ----------
const F = { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma", eastAsia: "Tahoma" };

// ---------- Borders ----------
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { ...noBorders, insideHorizontal: NB, insideVertical: NB };

// ---------- RTL helpers ----------
function rtl(text, opts = {}) {
  return new TextRun({
    text, rightToLeft: true, font: F, sizeComplexScript: true,
    size: opts.size || 22, bold: opts.bold || false, boldComplexScript: opts.bold || false,
    italics: opts.italics || false, color: opts.color || P.body,
  });
}
// ساخت آرایه‌ی TextRun از قطعات: {t, bold, accent, grey, italic}
function runs(parts, base = {}) {
  return parts.map((p) =>
    rtl(p.t, {
      ...base, ...p,
      bold: p.bold || base.bold,
      color: p.accent ? P.accent : p.grey ? P.grey : p.color || base.color || P.body,
      italics: p.italic || false,
    }),
  );
}
function bodyP(parts, opts = {}) {
  return new Paragraph({
    bidirectional: true, alignment: AlignmentType.JUSTIFIED,
    spacing: { line: opts.line || 400, before: opts.before ?? 80, after: opts.after ?? 120 },
    children: Array.isArray(parts) ? runs(parts) : [rtl(parts, opts)],
  });
}
function labelP(label, parts, opts = {}) { // «گفتار:» + متن
  return new Paragraph({
    bidirectional: true, alignment: AlignmentType.JUSTIFIED,
    spacing: { line: opts.line || 400, after: opts.after ?? 100 },
    indent: { right: opts.indent ?? 280 },
    children: [rtl(label + " ", { bold: true, color: P.accent, size: opts.size || 24 }), ...runs(parts, { size: opts.size || 24 })],
  });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.RIGHT,
    spacing: { before: 400, after: 160, line: 340, lineRule: "atLeast" },
    children: [rtl(text, { size: 30, bold: true, color: P.primary })],
  });
}
function h2seg(text) { // عنوان سگمنت زمان‌بندی
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
    spacing: { before: 300, after: 100, line: 340, lineRule: "atLeast" },
    children: [rtl(text, { size: 25, bold: true, color: P.accent })],
  });
}
function tableRTL(headers, rows, widths) {
  const cell = (text, isHead, w) => new TableCell({
    width: { size: w, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: isHead ? P.primary : "FFFFFF" },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { line: 288 },
      children: [rtl(text, { size: 20, bold: isHead, color: isHead ? "FFFFFF" : P.body })],
    })],
  });
  return new Table({
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
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(t, false, widths[i])) })),
    ],
  });
}
function tipBox(title, parts) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, visuallyRightToLeft: true,
    borders: allNoBorders,
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: P.surface },
        margins: { top: 140, bottom: 140, left: 200, right: 200 },
        borders: { top: NB, bottom: NB, left: NB, right: { style: BorderStyle.SINGLE, size: 24, color: P.accent } },
        children: [
          new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { line: 312, after: 60 }, children: [rtl(title, { bold: true, size: 22, color: P.accent })] }),
          new Paragraph({ bidirectional: true, alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 }, children: runs(parts, { size: 22 }) }),
        ],
      })],
    })],
  });
}

/* ─────────── محتوا ─────────── */

const children = [];

// عنوان (بدون کاور — طبق سین کپی‌رایتینگ)
children.push(
  new Paragraph({
    bidirectional: true, alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60, line: 400 },
    children: [rtl("اسکریپت ویدیوی آموزشی — سری «پایتون از صفر»", { size: 22, color: P.secondary })],
  }),
  new Paragraph({
    bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 80, line: 460, lineRule: "atLeast" },
    children: [rtl("اولین برنامه پایتونت رو در ۵ دقیقه بنویس!", { size: 36, bold: true, color: P.primary })],
  }),
  new Paragraph({
    bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 240, line: 312 },
    children: [rtl("تک‌راه | takrah.top — ویدیوی شماره ۱", { size: 20, color: P.grey })],
  }),
);

// ۱) مشخصات
children.push(h1("۱) مشخصات ویدیو"));
children.push(tableRTL(
  ["مورد", "توضیح"],
  [
    ["مدت هدف", "۵ دقیقه (حداکثر ۵:۴۵)"],
    ["قالب", "ضبط صفحه + صدای خودت (نمای دوربین اختیاری)"],
    ["ابزار ضبط", "OBS Studio (رایگان) یا Win+G ویندوز؛ میکروفون هدفون کافی است"],
    ["نمایش کد", "راه اول: کامپایلر آنلاین Programiz (بدون نصب و اکانت)؛ راه دوم: نصب از python.org"],
    ["پلتفرم انتشار", "آپارات (اصلی) + یوتیوب؛ برش ۳۰ ثانیه‌ای برای ریلز اینستاگرام"],
    ["مقاله مرتبط", "آموزش پایتون از صفر — takrah.top/article/learn-python-from-zero"],
    ["لینک آپارات", "【بعد از آپلود، لینک ویدیو را اینجا بگذار】"],
  ],
  [28, 72],
));

// ۲) اسکریپت
children.push(h1("۲) اسکریپت کامل — تصویر، گفتار، تدوین"));
children.push(bodyP([
  { t: "راهنما: ", bold: true },
  { t: "متن ستون گفتار را مو به مو بخوان؛ علامت‌های " },
  { t: "[مکث]", grey: true, italic: true },
  { t: " یعنی یک ثانیه سکوت و " },
  { t: "[تأکید]", grey: true, italic: true },
  { t: " یعنی آن جمله را پررنگ‌تر بگو. اگر جمله‌ای برایت غیرطبیعی بود، با کلمات خودت بگو — مهم روانی صداست." },
]));

// سگمنت ۱
children.push(h2seg("سگمنت ۱ | ۰:۰۰ تا ۰:۲۰ — هوک: قول ۵ دقیقه‌ای"));
children.push(labelP("تصویر:", [{ t: "صفحه دسکتاپ؛ ادیتور آنلاین باز است. متن بزرگ روی صفحه: «۵ دقیقه؟!»" }]));
children.push(labelP("گفتار:", [
  { t: "تا ۵ دقیقه دیگه، اولین برنامه‌ی پایتونت رو می‌نویسی و اجراش می‌کنی. " },
  { t: "[مکث]", grey: true, italic: true },
  { t: "نه دوره‌ی چهل ساعته، نه نصب‌های پیچیده. فقط ۵ دقیقه — و تهش یه چیزی داری که واقعاً کار می‌کنه." },
]));
children.push(labelP("تدوین:", [{ t: "زوم روی ادیتور؛ متن «۵ دقیقه؟!» بزرگ و رنگی؛ صدا انرژی بالا.", grey: true, italic: true }], { size: 21 }));

// سگمنت ۲
children.push(h2seg("سگمنت ۲ | ۰:۲۰ تا ۰:۵۰ — پایتون کجاست؟"));
children.push(labelP("تصویر:", [{ t: "لوگوی اینستاگرام و نتفلیکس؛ یک سرچ ساده‌ی «ChatGPT + Python»" }]));
children.push(labelP("گفتار:", [
  { t: "پایتون زبونی‌ه که پشت صحنه‌ی اینستاگرام، نتفلیکس و حتی ChatGPT داره کار می‌کنه. " },
  { t: "[مکث]", grey: true, italic: true },
  { t: "چرا؟ چون شبیه زبان خودمون حرف می‌زنه. برای همینه که راحت‌ترین نقطه‌ی شروع دنیای برنامه‌نویسیه." },
]));

// سگمنت ۳
children.push(h2seg("سگمنت ۳ | ۰:۵۰ تا ۲:۱۰ — راه اول: بدون نصب، همین الان"));
children.push(labelP("تصویر:", [{ t: "باز کردن site: programiz.com → Python Online Compiler" }]));
children.push(labelP("گفتار:", [
  { t: "برو به آدرس programiz.com و «Python Online Compiler» رو باز کن. اکانت هم نمی‌خواد. " },
  { t: "[مکث]", grey: true, italic: true },
  { t: "حالا دقیقاً همین خط رو بنویس: " },
  { t: "print", bold: true, accent: true },
  { t: " و بعد علامت گیومه، «سلام دنیا»، و دوباره گیومه. " },
  { t: "[مکث]", grey: true, italic: true },
  { t: "دکمه‌ی Run رو بزن... " },
  { t: "[مکث ۲ ثانیه]", grey: true, italic: true },
  { t: "دیدی؟ همینه! تبریک می‌گم — تو همین الان رسماً برنامه‌نویسی کردی." },
]));
children.push(labelP("تدوین:", [{ t: "کد تایپ‌شده هایلایت شود؛ فلش روی دکمه Run؛ خروجی با کادر سبز مشخص شود.", grey: true, italic: true }], { size: 21 }));

// سگمنت ۴
children.push(h2seg("سگمنت ۴ | ۲:۱۰ تا ۳:۳۰ — راه دوم: نصب واقعی پایتون"));
children.push(labelP("تصویر:", [{ t: "python.org → Downloads → صفحه نصب با تیک Add to PATH" }]));
children.push(labelP("گفتار:", [
  { t: "اگه جدی شروع کردی، پایتون رو واقعاً نصب کن. برو به python.org، آخرین نسخه رو دانلود کن. موقع نصب، " },
  { t: "حتماً تیک «Add Python to PATH» رو بزن", bold: true, accent: true },
  { t: " — " },
  { t: "[تأکید]", grey: true, italic: true },
  { t: "نود درصد مشکلات تازه‌کارها از همینه! بعد از نصب، برنامه‌ی IDLE رو باز کن و همون «سلام دنیا» رو اونجا هم اجرا کن. از این به بعد، هر چی می‌نویسی روی کامپیوتر خودته." },
]));

// سگمنت ۵
children.push(h2seg("سگمنت ۵ | ۳:۳۰ تا ۴:۲۰ — برنامه‌ای که باهات حرف می‌زنه"));
children.push(labelP("تصویر:", [{ t: "کد دو خطی input و print در ادیتور؛ اجرا و تایپ اسم" }]));
children.push(labelP("گفتار:", [
  { t: "حالا یه قدم جلوتر بریم. این دو خط رو بنویس: اول اسمِ کاربر رو بپرس، بعد بهش سلام کن. " },
  { t: "[مکث]", grey: true, italic: true },
  { t: "اجرا کن... اسمت رو بنویس... " },
  { t: "[مکث ۲ ثانیه]", grey: true, italic: true },
  { t: "ببین! برنامته الان با خودت صمیمی شد. " },
  { t: "[لبخند]", grey: true, italic: true },
  { t: "این تازه اول راهه — تو مقاله‌ی سایت، همین برنامه رو با تمرین‌های بیشتر جلو می‌بری." },
]));
children.push(labelP("تدوین:", [{ t: "هر دو خط کد را تایپ‌شده نشان بده؛ خروجی گفتگو با پس‌زمینه‌ی متفاوت.", grey: true, italic: true }], { size: 21 }));

// سگمنت ۶
children.push(h2seg("سگمنت ۶ | ۴:۲۰ تا ۵:۰۰ — دعوت پایانی (CTA)"));
children.push(labelP("تصویر:", [{ t: "صفحه پایانی: آدرس مقاله + لوگوی تک‌راه + دکمه‌ی کانال" }]));
children.push(labelP("گفتار:", [
  { t: "قدم‌به‌قدمِ کامل با تمرین و مثال‌های بیشتر، توی مقاله‌ی «آموزش پایتون از صفر» توی سایت تک‌راهه — لینکش زیر ویدیوئه. " },
  { t: "[مکث]", grey: true, italic: true },
  { t: "هر هفته یه ویدیوی جدید از همین سری می‌ذارم؛ کانال @takrahTop رو عضو شو که از دستت نره، و اگه جایی گیر کردی، ربات تک‌راه جوابت رو پیدا می‌کنه. " },
  { t: "[لبخند]", grey: true, italic: true },
  { t: "حالا برو اولین برنامت رو بنویس — منتظرتم!" },
]));
children.push(labelP("تدوین:", [{ t: "متن takrah.top/article/learn-python-from-zero روی صفحه؛ دکمه‌ی اشتراک انیمیشنی.", grey: true, italic: true }], { size: 21 }));

// نکته ریلز
children.push(tipBox("نکته: از همین ویدیو، ریلز اینستاگرام بساز", [
  { t: "برش ۰:۰۰ تا ۰:۲۰ (هوک) + ۳:۳۰ تا ۴:۲۰ (برنامه‌ی صمیمی) = یک ریلز ۳۰ ثانیه‌ای کاملاً مستقل. کپشن و هشتگش از پکیج اینستاگرام تک‌راه (فایل takrah-instagram-launch-kit.docx) آماده است." },
]));

// ۳) چک‌لیست ضبط
children.push(h1("۳) چک‌لیست قبل و حین ضبط"));
children.push(tableRTL(
  ["مرحله", "اقدام"],
  [
    ["صدا", "۳۰ ثانیه تست ضبط کن و بشنو؛ صدای فن و اکو نباشد؛ میکروفون ۱۵ سانتی‌متر از دهان"],
    ["نور", "رو به پنجره یا لامپ؛ پشت به نور نباش (اگر دوربین داری)"],
    ["صفحه", "رزولوشن ۱۰۸۰p در OBS؛ بستن تب‌های شخصی؛ حالت پرواز گوشی"],
    ["ادیتور", "فونت کد را بزرگ کن (Ctrl و +) تا در ویدیو خوانا باشد"],
    ["تمرین", "اسکریپت را دو بار بلند بخوان؛ نگران لکنت نباش، برش می‌دهیم"],
    ["ضبط", "سگمنت‌به‌سگمنت ضبط کن؛ هر اشتباه، ۵ ثانیه سکوت و از اول همان سگمنت"],
    ["خروجی", "MP4، ۱۰۸۰p؛ نام فایل: takrah-python-01-first-program.mp4"],
  ],
  [18, 82],
));

// ۴) توضیحات آپارات/یوتیوب
children.push(h1("۴) متن توضیحات آپارات و یوتیوب"));
children.push(bodyP([
  { t: "تا ۵ دقیقه دیگه اولین برنامه‌ی پایتونت رو می‌نویسی و اجرا می‌کنی — بدون نصب، بدون اکانت، بدون سردرگمی. " },
  { t: "در این ویدیو: ", bold: true },
  { t: "اجرای آنلاین با Programiz، نصب اصولی از python.org (با ترفند Add to PATH) و ساخت برنامه‌ای که اسمت رو می‌پرسه و بهت سلام می‌کنه." },
]));
children.push(bodyP([
  { t: "مقاله‌ی کامل این آموزش با تمرین‌های بیشتر: ", bold: true },
  { t: "https://takrah.top/article/learn-python-from-zero" },
]));
children.push(bodyP([
  { t: "ربات تلگرام تک‌راه برای جستجوی مقاله‌ها: ", bold: true },
  { t: "https://t.me/TakrahTop_bot — کانال: @takrahTop" },
]));
children.push(labelP("تگ‌ها:", [{ t: "پایتون، آموزش پایتون، برنامه نویسی، پایتون از صفر، هوش مصنوعی، تک راه، یادگیری برنامه نویسی" }], { size: 21 }));

// ۵) تامبنیل
children.push(h1("۵) تامبنیل پیشنهادی"));
children.push(bodyP([
  { t: "پس‌زمینه: کد پررنگ «print(\u201cسلام دنیا\u201d)» با پس‌زمینه‌ی تیره‌ی سبز-آبی برند. متن بزرگ سفید (فونت وزیرمتن ضخیم): «اولین برنامه‌ات در ۵ دقیقه». نشانه‌ی کوچک تک‌راه گوشه‌ی پایین. " },
  { t: "اگر بخواهی، فایل تامبنیل را هم برایت می‌سازم — فقط بگو.", bold: true },
]));

// ۶) سه ویدیوی بعدی
children.push(h1("۶) سه ویدیوی بعدی این سری"));
children.push(tableRTL(
  ["ویدیو", "هسته‌ی محتوایی", "مقاله‌ی مرتبط"],
  [
    ["گزارش اکسلت رو پایتون یک‌کلیکه‌ش کن", "اتوماسیون کار تکراری؛ نمونه‌ی واقعی گزارش هفتگی", "python-automation-income"],
    ["پایتون، پل ورود به هوش مصنوعی", "از print تا اولین مدل ساده؛ نقشه‌ی مسیر AI", "python-for-ai-guide"],
    ["سایتت رو امشب راه بنداز", "وردپرس گام‌به‌گام؛ دومین محتوای محبوب کانال", "build-website-with-wordpress"],
  ],
  [30, 40, 30],
));
children.push(tipBox("اولویت‌بندی چرا؟", [
  { t: "دیتای بازدید کانال نشان داد آموزش عملیِ قدم‌به‌قدم بیشترین جذابیت را دارد (ساخت سایت ۶۵ و نقشه‌راه ۶۰ ویو). پس هر ویدیو باید «یک نتیجه‌ی ملموس» تحویل بدهد، نه معرفی و گفتگوی کلی." },
]));

/* ─────────── سند ─────────── */
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: F, size: 22, color: P.body },
        paragraph: { spacing: { line: 360 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1300, bottom: 1300, left: 1500, right: 1500 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.secondary, font: F })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/takrah-video-script-01.docx", buf);
  console.log("OK: takrah-video-script-01.docx", buf.length, "bytes");
});
