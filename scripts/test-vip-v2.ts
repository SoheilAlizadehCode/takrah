// ─── تست نسخه ۲ ربات VIP: آوا با حافظه، اینتنت‌ها، گزارش، یادآوری ───
// اجرا: bun scripts/test-vip-v2.ts
import { avaAnswer, normalizeFa, reminderCallText, vipReminderText } from "../src/lib/vip-bot";
import { buildReport, reportText } from "../src/lib/reports";
import { buildAvaSystemPrompt, aiAvailable } from "../src/lib/ai";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra?: string) {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}${extra ? " — " + extra : ""}`);
  }
}

console.log("── ۱) نرمال‌سازی فارسی ──");
check("ي عربی → ی", normalizeFa("دنيا").includes("نیا"));
check("نیم‌فاصله حذف", !normalizeFa("بی‌خوابی").includes("\u200C"));
check("ك عربی → ک", normalizeFa("كلیك").includes("کلیک"));

console.log("── ۲) آوا با حافظه — سوال دنباله‌دار ──");
const a1 = avaAnswer("قیمت ترمیم دندون چنده؟");
check("قیمت دندان → تخصص دندانپزشکی", a1.meta?.specIdx === 0, `got ${a1.meta?.specIdx}`);
check("پاسخ قیمت شامل ۸۰۰ هزار", a1.text.includes("۸۰۰"));

const a2 = avaAnswer("و ساعتش؟", { lastSpecIdx: 0, lastDoctorIdx: 0 });
check("دنباله «ساعتش» → روزهای دکتر از حافظه", a2.text.includes("رادمهر"), a2.text.slice(0, 60));

const a3 = avaAnswer("دکتر صمدی کیه؟");
check("معرفی پزشک با اسم", a3.text.includes("صمدی") && a3.meta?.doctorIdx === 1);

const a4 = avaAnswer("پارکینگ دارید؟");
check("پارکینگ", a4.text.includes("پارکینگ"));

const a5 = avaAnswer("ناشتا بیام؟");
check("آمادگی مراجعه", a5.text.includes("ناشتا"));

const a6 = avaAnswer("میخوام نوبتم رو کنسل کنم");
check("لغو/کنسل", a6.text.includes("جابجایی") || a6.text.includes("جابجا"));

const a7 = avaAnswer("سونوگرافی انجام میدید؟");
check("آزمایش/سونوگرافی", a7.text.includes("تصویربرداری") || a7.text.includes("سونوگرافی"));

const a8 = avaAnswer("سلام");
check("سلام", a8.text.includes("خوش آمدید"));

const a9 = avaAnswer("ممنون از راهنماییت");
check("تشکر", a9.text.includes("خواهش"));

const a10 = avaAnswer("دفترچه بیمه ایران قبول می‌کنید؟");
check("بیمه", a10.text.includes("بیمه"));

const a11 = avaAnswer("فاکتور رسمی میدید؟");
check("فاکتور/گواهی", a11.text.includes("فاکتور"));

const a12 = avaAnswer("سردرد و میگرن دارم");
check("علامت → مغز و اعصاب", a12.meta?.specIdx === 5);

const a13 = avaAnswer("متشکرم", { lastDoctorIdx: 2, lastSpecIdx: 2, lastTopic: "قلب" });
check("تشکر بدون تداخل با حافظه", a13.text.includes("خواهش"));

const a14 = avaAnswer("سوال کاملا عجیب و بی ربط در مورد فضا");
check("fallback صادقانه", a14.text.includes("مشاوره رایگان"));

console.log("── ۳) یادآوری و تماس ──");
const fakeBooking = {
  id: "TEST",
  chatId: 1,
  userName: "تست",
  phone: "09111112233",
  specIdx: 0,
  doctorIdx: 0,
  dayIso: "2026-10-19",
  dayLabel: "یکشنبه ۲۷ مهر",
  time: "۰۹:۰۰",
  createdAt: Date.now(),
};
const callText = reminderCallText(fakeBooking as never);
check("متن تماس بدون HTML", !callText.includes("<"));
check("متن تماس شامل ساعت", callText.includes("۰۹:۰۰"));
check("متن یادآوری شامل آدرس", vipReminderText(fakeBooking as never).includes("گلسار"));

console.log("── ۴) گزارش مدیر ──");
const rep = await buildReport();
check("گزارش ساخته شد", rep.totals.bookings >= 0);
const rt = reportText(rep);
check("متن گزارش شامل تیتر", rt.includes("گزارش عملکرد"));
check("متن گزارش شامل ذخیره‌سازی", rt.includes("ذخیره‌سازی"));

console.log("── ۵) پرامپت هوش مصنوعی ──");
const sys = buildAvaSystemPrompt({
  name: "کلینیک سلامت",
  address: "رشت",
  phone: "013",
  hours: "۹ تا ۲۰",
  specs: [{ emoji: "🦷", name: "دندانپزشکی" }],
  doctors: [{ name: "دکتر رادمهر", spec: "دندانپزشکی", days: "شنبه تا سه‌شنبه" }],
});
check("پرامپت شامل آوا", sys.includes("آوا"));
check("پرامپت شامل قواعد", sys.includes("قواعد طلایی"));
check("وضعیت LLM گزارش می‌شود (boolean)", typeof aiAvailable() === "boolean");

console.log(`\n═══ نتیجه: ${pass} موفق، ${fail} ناموفق ═══`);
if (fail > 0) process.exit(1);
