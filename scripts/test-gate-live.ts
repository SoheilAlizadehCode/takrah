// تست E2E لایو گیت دانلود روی https://takrah.top
const SITE = "https://takrah.top";
const NONCE = require("crypto").randomBytes(6).toString("hex");
const OWNER_TG_ID = 5289089807;

async function main() {
  console.log("nonce:", NONCE);
  const { makeVerifyCode } = await import("../src/lib/student-gate");
  const code = makeVerifyCode(NONCE, OWNER_TG_ID);
  console.log("code:", code);

  const v = await fetch(`${SITE}/api/student/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nonce: NONCE, code }),
  });
  const cookie = (v.headers.get("set-cookie") ?? "").split(";")[0];
  console.log("verify:", v.status, "cookie:", cookie ? "SET" : "NONE");

  const u0 = await fetch(`${SITE}/api/student/unlock`, {
    method: "POST",
    headers: { Cookie: cookie, "x-gate-t0": String(Date.now()) },
  });
  console.log("unlock(early):", u0.status, "(expect 425)");

  console.log("waiting 16s…");
  await new Promise((r) => setTimeout(r, 16000));

  const u1 = await fetch(`${SITE}/api/student/unlock`, {
    method: "POST",
    headers: { Cookie: cookie, "x-gate-t0": String(Date.now() - 16000) },
  });
  const u1j = await u1.json();
  console.log("unlock:", u1.status, "files:", u1j.files?.length);

  const first = u1j.files?.[0];
  if (first) {
    const d = await fetch(`${SITE}${first.url}`, { headers: { Cookie: cookie } });
    const buf = Buffer.from(await d.arrayBuffer());
    console.log("download:", d.status, d.headers.get("content-type"), buf.length, "bytes, magic:", buf.subarray(0, 4).toString());
  }
}
main().catch((e) => { console.error("FAILED:", e); process.exit(1); });
