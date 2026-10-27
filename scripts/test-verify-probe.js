// پراب لایو verify — تشخیص اینکه تولید با چه سکرتی امضا می‌کند
// سناریو ۱: کد معتبر برای nonceA + body nonceA → انتظار: telegram_error (502) یعنی مسیر امضا OK
// سناریو ۲: کد معتبر برای nonceA + body nonceB (متفاوت) → انتظار: bad_code (401) = رفتار stale فعلی
const crypto = require("crypto");

const TOKEN = "8887827849:AAEvYZ6l_rwSwucedP3K7ToIzhGEOkznIbs";
const secret = crypto.createHash("sha256").update(`${TOKEN}:student-gate-v1`).digest();
const hmacHex = (d) => crypto.createHmac("sha256", secret).update(d).digest("hex");

function makeCode(nonce, tgId) {
  return `${nonce}.${tgId}.${hmacHex(`${nonce}.${tgId}`).slice(0, 16)}`;
}

async function probe(label, nonce, code) {
  const res = await fetch("https://takrah.top/api/student/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nonce, code }),
  });
  const j = await res.json().catch(() => ({}));
  console.log(`${label}: HTTP ${res.status} →`, JSON.stringify(j));
  return { status: res.status, reason: j.reason };
}

(async () => {
  const nonceA = "aaaaaaaa1111bbbb";
  const nonceB = "cccccccc2222dddd";
  const tgId = 987654321; // کاربر جعلی — عضو نیست و احتمالاً id نامعتبر است
  const codeA = makeCode(nonceA, tgId);
  // کل پیام ربات — برای تست استخراج کد از متن خام
  const wrapped =
    "✅ عضویتت در کانال تک‌راه تأیید شد!\n\nکد تأیید را کپی کن و در سایت وارد کن:\n" +
    codeA +
    "\n\n(روی کد بزن تا کپی شود)";
  console.log("codeA:", codeA);

  const r1 = await probe("سناریو۱ (کد خام + nonce درست)", nonceA, codeA);
  const r2 = await probe("سناریو۲ (کد nonceA + body nonceB = stale)", nonceB, codeA);
  const r3 = await probe("سناریو۳ (کل پیام ربات paste شده)", nonceA, wrapped);

  // تفسیر
  if (r1.reason === "telegram_error" || r1.reason === "not_member") {
    console.log("\n✅ سکرت امضای تولید با محلی یکی است (توکن جدید لایو است).");
  } else if (r1.reason === "bad_code") {
    console.log("\n❌ تولید کد را رد کرد → سکرت/منطق تولید با محلی فرق دارد (دیپلوی کهنه؟)");
  }
  console.log(
    r2.reason === "stale_code"
      ? "✅ فیکس stale لایو است (کد قدیمی = پیام «مال تلاش قبلی»)"
      : r2.reason === "bad_code"
        ? "ℹ️ هنوز دیپلوی جدید نرفته (stale = bad_code عمومی)"
        : `ℹ️ رفتار stale: ${r2.reason}`,
  );
  console.log(
    r3.reason === "telegram_error" || r3.reason === "not_member"
      ? "✅ استخراج کد از کل پیام لایو است"
      : `❌ استخراج از کل پیام کار نکرد: ${r3.reason}`,
  );
})();
