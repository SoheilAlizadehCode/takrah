// Persian RTL resume for ArvanCloud "sales representative" application (takrah.top owner)
// Template B (dark header banner + single column), adapted for RTL Persian with Tahoma.
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign,
} = require("docx");
const fs = require("fs");

// ---------- palette (Template B, tech) ----------
const C = {
  dark: "1B3A57",    // banner background
  accent: "2B7BB9",  // headings / dots
  title: "1A2636",   // strong text
  body: "2C3E50",    // body text
  sec: "6B8599",     // secondary (dates, notes)
  light: "BFD7E8",   // light text on dark banner
  dim: "8FB3CC",     // dots empty state
};

const A = AlignmentType;
const END = A.END || A.LEFT;

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ---------- RTL helpers ----------
function R(text, o = {}) {
  return new TextRun({
    text,
    font: { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma", eastAsia: "Tahoma" },
    rightToLeft: true,
    size: o.size ?? 20,
    sizeComplexScript: o.size ?? 20,
    bold: !!o.bold,
    boldComplexScript: !!o.bold,
    italics: !!o.italics,
    color: o.color ?? C.body,
  });
}

function P(runs, o = {}) {
  return new Paragraph({
    bidirectional: true,
    alignment: o.align,
    spacing: { before: o.before ?? 0, after: o.after ?? 0, line: o.line ?? 320, lineRule: "atLeast" },
    border: o.border,
    indent: o.indent,
    children: runs,
  });
}

// Section heading: Persian (accent, bold) + English (italic, secondary), bottom border
function heading(fa, en, before = 300) {
  return P(
    [
      R(fa + "  ", { size: 25, bold: true, color: C.accent }),
      R(en, { size: 17, color: C.sec, italics: true }),
    ],
    {
      before,
      after: 140,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.accent, space: 4 } },
    }
  );
}

// Bullet line
function bullet(text, after = 70) {
  return P(
    [
      R("•  ", { color: C.accent, bold: true }),
      R(text),
    ],
    { after }
  );
}

// Experience entry header: two-col borderless table (bidiVisual → first cell on the right)
function entryHeader(title, date, before = 60) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: true,
    borders: allNoBorders,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 78, type: WidthType.PERCENTAGE },
            borders: allNoBorders,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [P([R(title, { size: 21, bold: true, color: C.title })], { before, after: 40 })],
          }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: allNoBorders,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [P([R(date, { size: 17, color: C.sec })], { align: END, after: 40 })],
          }),
        ],
      }),
    ],
  });
}

// Skill line: name (bold) + dots + note
function skill(name, filled, total, note) {
  const dots = "●".repeat(filled) + "○".repeat(total - filled);
  return P(
    [
      R(name, { size: 20, bold: true, color: C.title }),
      R("   " + dots + "   ", { size: 13, color: C.accent }),
      R(note, { size: 17, color: C.sec }),
    ],
    { after: 110 }
  );
}

// ---------- banner ----------
const banner = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: allNoBorders,
  rows: [
    new TableRow({
      cantSplit: true,
      height: { value: 2450, rule: "exact" },
      children: [
        new TableCell({
          shading: { fill: C.dark, type: ShadingType.CLEAR },
          borders: allNoBorders,
          margins: { top: 0, bottom: 0, left: 360, right: 360 },
          verticalAlign: VerticalAlign.TOP,
          children: [
            P([R("سهیل علیزاده", { size: 46, bold: true, color: "FFFFFF" })], { before: 360, after: 60, line: 560 }),
            P(
              [R("بازاریاب دیجیتال و تولیدکنندهٔ محتوا  |  مدیر وبلاگ «تک‌راه»", { size: 21, color: C.light })],
              { after: 140, line: 340 }
            ),
            P(
              [R("۰۹۲۲ ۹۰۳ ۳۱۰۲    |    takrah.top    |    t.me/takrahTop    |    \u200E@\u200EtakrahTop    |    【ایمیل】", { size: 17, color: C.light })],
              { line: 300 }
            ),
          ],
        }),
      ],
    }),
  ],
});

// ---------- content ----------
const about = P(
  [
    R(
      "مدیر و نویسندهٔ وبلاگ «تک‌راه» (takrah.top)، رسانهٔ تخصصی هوش مصنوعی و کسب درآمد آنلاین با بیش از ۴۶ مقالهٔ بهینه‌شده برای موتورهای جست‌وجو و کانال تلگرام \u200E@\u200EtakrahTop. مخاطبان اصلی این رسانه کاربرانی هستند که قصد راه‌اندازی سایت، خرید هاست و دامنه و ساخت کسب‌وکار آنلاین دارند؛ یعنی دقیقاً بازار هدف خدمات هاستینگ و ابری. با تحلیل ترافیک، سئو و بازاریابی افیلیت کار کرده‌ام و می‌خواهم همین ظرفیت محتوایی و مخاطب را در قالب همکاری با ابرآروان به معرفی و فروش خدمات تبدیل کنم.",
      { size: 20 }
    ),
  ],
  { after: 60, line: 340 }
);

const exp1Header = entryHeader("مدیر و تولیدکنندهٔ محتوا — وبلاگ تک‌راه (takrah.top)", "۱۴۰۵ تاکنون");
const exp1Bullets = [
  "طراحی و اجرای استراتژی محتوای سئومحور در حوزهٔ هوش مصنوعی، ساخت سایت و درآمد آنلاین؛ انتشار بیش از ۴۶ مقالهٔ تخصصی",
  "راه‌اندازی فنی و نگهداری سایت با Next.js؛ مدیریت سئوی تکنیکال شامل نقشهٔ سایت، دادهٔ ساخت‌یافته و بهینه‌سازی سرعت",
  "پایش رفتار مخاطبان با Google Analytics 4 و بهبود محتوا بر اساس دادهٔ واقعی کاربران",
  "راه‌اندازی کمپین‌های بازاریابی افیلیت با صرافی‌های نوبیتکس، والکس و تبدیل و ردیابی دقیق کلیک‌ها و ثبت‌نام‌ها",
  "مدیریت کانال تلگرام takrahTop و تولید محتوای آموزشی برای رشد و نگهداشت جامعهٔ مخاطبان",
].map((t, i, arr) => bullet(t, i === arr.length - 1 ? 40 : 70));

const exp2Header = entryHeader("توسعه و فروش پکیج‌های اتوماسیون کلینیک (JSDevelop)", "۱۴۰۵ تاکنون", 220);
const exp2Bullets = [
  "طراحی سه پلن خدماتی (پایه، استاندارد، VIP) برای اتوماسیون نوبت‌دهی و پذیرش کلینیک‌ها",
  "ساخت صفحهٔ فروش با دموی تعاملی روی takrah.top/packages برای نمایش عملی محصول به مشتری",
  "جذب و پیگیری مشتریان از طریق محتوای آموزشی و ارتباط مستقیم در واتساپ",
].map((t, i, arr) => bullet(t, i === arr.length - 1 ? 40 : 70));

const skills = [
  skill("تولید محتوا و سئو", 5, 5, "۴۶ مقالهٔ سئوشده در حوزهٔ AI و درآمد آنلاین"),
  skill("تحلیل داده با Google Analytics 4", 4, 5, "ردیابی رویدادها و پایش ترافیک"),
  skill("بازاریابی افیلیت و پرفورمنس", 4, 5, "همکاری فعال با ۳ صرافی ایرانی"),
  skill("بازاریابی تلگرام", 4, 5, "مدیریت کانال takrahTop"),
  skill("توسعهٔ وب (Next.js / TypeScript)", 3, 5, "ساخت و نگهداری takrah.top"),
  skill("آشنایی فنی با خدمات ابری و هاستینگ", 3, 5, "هاست، دامنه، CDN"),
];

const education = P(
  [
    R("【مدرک و رشتهٔ تحصیلی】", { size: 20, bold: true, color: C.title }),
    R("   |   【نام دانشگاه یا مؤسسه】", { size: 20, color: C.body }),
  ],
  { after: 40 }
);

// ---------- document ----------
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma" }, size: 20, color: C.body },
        paragraph: { spacing: { line: 320 } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 620, bottom: 560, left: 900, right: 900 },
        },
      },
      children: [
        banner,

        heading("دربارهٔ من", "About Me", 260),
        about,

        heading("تجربه‌های کاری", "Work Experience"),
        exp1Header,
        ...exp1Bullets,
        exp2Header,
        ...exp2Bullets,

        heading("مهارت‌های کلیدی", "Core Skills"),
        ...skills,

        heading("تحصیلات", "Education", 260),
        education,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/resume-arvancloud.docx", buf);
  console.log("written: /home/z/my-project/download/resume-arvancloud.docx");
});
