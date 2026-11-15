// تست منطق پلن‌ها در یک پروسهٔ واحد (حافظه) — بدون نیاز به Upstash
import {
  createTenant,
  getTenant,
  normalizePlan,
  PLAN_INTAKE_LIMIT,
} from "../src/lib/tenants";
import { kvSet } from "../src/lib/kv";

async function main() {
  let fail = 0;
  const ok = (cond: boolean, label: string) => {
    console.log(`${cond ? "PASS" : "FAIL"} — ${label}`);
    if (!cond) fail++;
  };

  // ۱) نرمال‌سازی پلن‌های قدیمی
  ok(normalizePlan("basic") === "booking", "normalize basic → booking");
  ok(normalizePlan("pro") === "full", "normalize pro → full");
  ok(normalizePlan("trial") === "booking", "normalize trial → booking");
  ok(normalizePlan("site") === "site", "normalize site → site");

  // ۲) ساخت مستأجر با هر سه پلن — وضعیت pending، بدون تریال
  for (const [i, plan] of ["site", "booking", "full"].entries()) {
    const r = await createTenant({
      name: `تست ${plan}`,
      phone: "0133222440" + i,
      plan: plan as never,
      slug: `t-${plan}`,
      doctors: [{ name: "دکتر تست" }],
    });
    ok(r.ok, `create ${plan}`);
    if (r.ok) {
      ok(r.tenant.status === "pending", `status pending (${plan})`);
      ok(r.tenant.trialEnds === 0, `no trial clock (${plan})`);
      ok(r.tenant.plan === plan, `plan stored (${plan})`);
    }
  }

  // ۳) سهمیه دستیار: فقط full
  ok(PLAN_INTAKE_LIMIT.site === 0 && PLAN_INTAKE_LIMIT.booking === 0 && PLAN_INTAKE_LIMIT.full === 200, "intake quota site/booking/full");

  // ۴) مستأجر قدیمی (plan pro + status trial) → خواندن نرمال شود
  await kvSet("t:legacy:x:config", JSON.stringify({
    slug: "legacy:x", name: "مطب قدیمی", tagline: "", address: "—", phone: "01332224409",
    whatsapp: "", hours: "", doctors: [{ id: "d1", name: "دکتر قدیمی", spec: "عمومی", days: "شنبه" }],
    slots: ["09:00"], plan: "pro", status: "trial", createdAt: Date.now(),
    trialEnds: Date.now() + 86400_000, ownerChatId: "", refCode: "", type: "matb", paidUntil: 0,
  }));
  await kvSet("t:index", JSON.stringify(["t-site", "t-booking", "t-full", "legacy:x"]));
  const legacy = await getTenant("legacy:x");
  ok(legacy?.plan === "full", "legacy pro → full on read");
  ok(legacy?.status === "pending", "legacy trial → pending on read");

  // ۵) pending قدیمی‌تر از ۷ روز → expired خودکار
  await kvSet("t:oldp:x:config", JSON.stringify({
    slug: "oldp:x", name: "مطب پرداخت‌نشده", tagline: "", address: "—", phone: "01332224408",
    whatsapp: "", hours: "", doctors: [{ id: "d1", name: "دکتر قدیمی", spec: "عمومی", days: "شنبه" }],
    slots: ["09:00"], plan: "booking", status: "pending", createdAt: Date.now() - 8 * 86400_000,
    trialEnds: 0, ownerChatId: "", refCode: "", type: "matb", paidUntil: 0,
  }));
  await kvSet("t:index", JSON.stringify(["t-site", "t-booking", "t-full", "legacy:x", "oldp:x"]));
  const oldP = await getTenant("oldp:x");
  ok(oldP?.status === "expired", "pending > 7 days → expired");

  console.log(fail === 0 ? "ALL PASS ✅" : `FAILURES: ${fail} ❌`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
