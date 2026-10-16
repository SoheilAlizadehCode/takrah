// تست سریع منطق ربات کلینیک (بدون فراخوانی تلگرام)
import {
  DOCTORS,
  SLOTS,
  isPhone,
  normalizePhone,
  slotTaken,
  tehranIso,
  workingDays,
} from "../src/lib/clinic-bot";

console.log("── روزهای کاری آینده (شمسی) ──");
workingDays().forEach((d, i) => console.log(`${i + 1}. ${d.label}  [${d.iso}]`));

console.log("\n── امروز/فردا تهران ──");
console.log("امروز:", tehranIso(0), "| فردا:", tehranIso(1));

console.log("\n── اسلات‌های پر/خالی فردا ──");
const free: string[] = [];
const taken: string[] = [];
SLOTS.forEach((t, i) => (slotTaken(tehranIso(1), i) ? taken : free).push(t));
console.log("آزاد:", free.join(" "));
console.log("پر:", taken.join(" ") || "هیچ");

console.log("\n── اعتبارسنجی موبایل ──");
console.log("09111234567 →", isPhone("09111234567"));
console.log("۰۹۱۱۱۲۳۴۵۶۷ →", isPhone("۰۹۱۱۱۲۳۴۵۶۷"));
console.log("12345 →", isPhone("12345"));
console.log("normalize ۰۹۱۱-۱۱۲ ۳۴۵۶۷ →", normalizePhone("۰۹۱۱-۱۱۲ ۳۴۵۶۷"));

console.log("\n── پزشکان ──");
DOCTORS.forEach((d) => console.log(`${d.name} | ${d.spec} | ${d.days}`));
console.log("\nALL OK");
