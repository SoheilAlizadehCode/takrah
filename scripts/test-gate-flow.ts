// تست E2E گیت دانلود — برای اجرا: bun scripts/test-gate-flow.ts
// شبیه‌سازی کامل مسیر دانش‌آموز با کد واقعی ربات (عضویت کاربر = سازنده کانال)
const BASE = process.env.BASE ?? "http://localhost:3000";
const NONCE = Math.random().toString(16).slice(2, 10).padEnd(12, "0"); // hex خالص مثل کلاینت
const OWNER_TG_ID = 5289089807; // چت خصوصی کاربر (عضو کانال — سازنده)

async function main() {
  console.log("nonce:", NONCE);

  // ۱) صفحه گیت
  const page = await fetch(`${BASE}/student/download`);
  console.log("page /student/download:", page.status);
  const html = await page.text();
  console.log("  hero title:", html.includes("دانلود فایل‌های آموزشی") ? "OK" : "MISSING!");
  console.log("  stepper:", html.includes("تأیید عضویت") ? "OK" : "MISSING!");

  // ۲) کد معتبر — با همان منطق HMAC سرور (import از سورس)
  const { makeVerifyCode, channelMembership } = await import("../src/lib/student-gate");
  const m = await channelMembership(OWNER_TG_ID);
  console.log("membership of owner:", m);

  const code = makeVerifyCode(NONCE, OWNER_TG_ID);
  console.log("code:", code);

  // ۳) POST /api/student/verify
  const v = await fetch(`${BASE}/api/student/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nonce: NONCE, code }),
  });
  const setCookie = v.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0];
  const vj = await v.json().catch(() => ({}));
  console.log("verify:", v.status, JSON.stringify(vj), "cookie:", cookie ? "SET" : "NONE");

  // ۳-ب) کد خراب باید رد شود
  const vb = await fetch(`${BASE}/api/student/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nonce: NONCE, code: "fake.code.0000" }),
  });
  console.log("verify(bad code):", vb.status, "(expect 401)");

  // ۴) unlock قبل از صبر → 425
  const u0 = await fetch(`${BASE}/api/student/unlock`, {
    method: "POST",
    headers: { Cookie: cookie, "x-gate-t0": String(Date.now()) },
  });
  console.log("unlock(early):", u0.status, JSON.stringify(await u0.json().catch(() => ({}))), "(expect 425)");

  // ۵) صبر ۱۶ ثانیه و unlock واقعی
  console.log("waiting 16s for ad gate…");
  await new Promise((r) => setTimeout(r, 16000));
  const u1 = await fetch(`${BASE}/api/student/unlock`, {
    method: "POST",
    headers: { Cookie: cookie, "x-gate-t0": String(Date.now() - 16000) },
  });
  const u1j = (await u1.json()) as { ok?: boolean; files?: { id: string; url: string; title: string }[] };
  console.log("unlock:", u1.status, "files:", u1j.files?.length);
  for (const f of u1j.files ?? []) console.log("  -", f.id, f.url, f.title.slice(0, 30));

  // ۶) دانلود واقعی کتاب اول + بدون کوکی (باید ۴۰۳ بدهد)
  const first = u1j.files?.[0];
  if (first) {
    const d = await fetch(`${BASE}${first.url}`, { headers: { Cookie: cookie } });
    const buf = Buffer.from(await d.arrayBuffer());
    console.log("download:", d.status, d.headers.get("content-type"), buf.length, "bytes, magic:", buf.subarray(0, 4).toString());
    const dNo = await fetch(`${BASE}${first.url}`);
    console.log("download(no cookie):", dNo.status, "(expect 403)");
  }

  // ۷) بدون سشن → unlock 401
  const u2 = await fetch(`${BASE}/api/student/unlock`, { method: "POST" });
  console.log("unlock(no session):", u2.status, "(expect 401)");
}

main().catch((e) => {
  console.error("TEST FAILED:", e);
  process.exit(1);
});
