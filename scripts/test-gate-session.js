// تست لایو گیت: کوکی امضاشده با secret فعلی می‌سازیم و می‌بینیم سرور کدام مرحله را رندر می‌کند
// استفاده: node scripts/test-gate-session.js
const crypto = require("crypto");

const TOKEN = "8887827849:AAEvYZ6l_rwSwucedP3K7ToIzhGEOkznIbs";
const COOKIE_NAME = "tk_student";
const BASE = "https://takrah.top/student/download";

function signSession(s) {
  const secret = crypto.createHash("sha256").update(`${TOKEN}:student-gate-v1`).digest();
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

async function check(label, session) {
  const cookie = session ? `${COOKIE_NAME}=${signSession(session)}` : "";
  const res = await fetch(BASE, { headers: cookie ? { cookie } : {} });
  const html = await res.text();
  const s1 = html.includes('aria-labelledby="step1-h"');
  const s2 = html.includes('aria-labelledby="step2-h"');
  const s3 = html.includes('aria-labelledby="step3-h"');
  console.log(`${label}: http=${res.status} step1=${s1} step2=${s2} step3=${s3}`);
}

(async () => {
  await check("بدون کوکی      ", null);
  await check("لاگین(تأییدنشده)", { email: "t@example.com", name: "تستر", ts: Date.now() });
  await check("تأییدشده       ", { email: "t@example.com", name: "تستر", tgId: 123, verified: true, verifiedAt: Date.now(), ts: Date.now() });
})();
