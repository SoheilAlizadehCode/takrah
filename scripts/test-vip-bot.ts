// تست سریع منطق ربات VIP (بدون فراخوانی تلگرام)
import {
  SPECS,
  VIP_DOCTORS,
  SLOTS,
  avaAnswer,
  isPhone,
  normalizePhone,
  vipSlotTaken,
  workingDays,
} from "../src/lib/vip-bot";

console.log("── تخصص‌ها و پزشکان ──");
SPECS.forEach((s, i) => {
  const docs = VIP_DOCTORS.filter((d) => d.specIdx === i).map((d) => d.name);
  console.log(`${s.emoji} ${s.name} → ${docs.join(", ")}`);
});

console.log("\n── روزهای کاری آینده (شمسی) ──");
workingDays().forEach((d, i) => console.log(`${i + 1}. ${d.label}  [${d.iso}]`));

console.log("\n── اسلات‌های پر/خالی فردا (VIP) ──");
const free: string[] = [];
const taken: string[] = [];
SLOTS.forEach((t, i) => (vipSlotTaken(workingDays()[0].iso, i) ? taken : free).push(t));
console.log("آزاد:", free.join(" "));
console.log("پر:", taken.join(" ") || "هیچ");

console.log("\n── اعتبارسنجی موبایل ──");
console.log("09111234567 →", isPhone("09111234567"));
console.log("۰۹۱۱۱۲۳۴۵۶۷ →", isPhone("۰۹۱۱۱۲۳۴۵۶۷"));
console.log("12345 →", isPhone("12345"));

console.log("\n── منشی هوشمند «آوا» ──");
const questions = [
  "سلام",
  "قیمت ویزیت دندانپزشکی چنده؟",
  "ساعت کاری جمعه باز هستید؟",
  "آدرس کلینیک کجاست؟",
  "بیمه تکمیلی می‌دهید؟",
  "درد دندان دارم کدام دکتر خوبه؟",
  "بچه‌م تب دارد 😔",
  "میگرن شدید دارم",
  "می‌خوام نوبت بگیرم",
  "نمیدونم والا یه سوال دیگه دارم",
];
for (const q of questions) {
  const a = avaAnswer(q);
  const first = a.text.replace(/<[^>]+>/g, "").split("\n")[0].slice(0, 60);
  console.log(`❓ ${q}\n   💬 ${first}...`);
}

console.log("\n── normalize ──");
console.log("normalize ۰۹۱۱-۱۱۲ ۳۴۵۶۷ →", normalizePhone("۰۹۱۱-۱۱۲ ۳۴۵۶۷"));

console.log("\nALL OK");
