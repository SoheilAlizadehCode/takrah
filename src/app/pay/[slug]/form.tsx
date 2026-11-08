"use client";
// ─── فرم انتخاب پلن × دوره → درگاه زرین‌پال ───
import { useState } from "react";

type Plan = "basic" | "pro";
type Months = 1 | 6 | 12;

const PLANS: { id: Plan; name: string; desc: string }[] = [
  { id: "basic", name: "نوبت‌دهی آنلاین", desc: "وب‌سایت نوبت + QR + اعلان تلگرام + ۶۰ پرسش‌نامه در ماه" },
  { id: "pro", name: "دستیار دکتر", desc: "همه‌ی امکانات استاندارد + خلاصه‌ی هوشمند بیمار با وویس + ۲۰۰ پرسش‌نامه" },
];

const MONTHS: { m: Months; label: string }[] = [
  { m: 1, label: "۱ ماهه" },
  { m: 6, label: "۶ ماهه" },
  { m: 12, label: "۱۲ ماهه" },
];

const PRICES: Record<Plan, Record<Months, number>> = {
  basic: { 1: 990_000, 6: 4_950_000, 12: 9_900_000 },
  pro: { 1: 1_990_000, 6: 9_950_000, 12: 19_900_000 },
};

const fa = (n: number) => n.toLocaleString("fa-IR");

export function PayForm({ slug, live }: { slug: string; live: boolean }) {
  const [plan, setPlan] = useState<Plan>("basic");
  const [months, setMonths] = useState<Months>(6);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const amount = PRICES[plan][months];

  async function goPay() {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, plan, months }),
      });
      const j = (await r.json()) as { ok?: boolean; url?: string; err?: string; manual?: boolean };
      if (j.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      if (j.manual) {
        setErr("💳 درگاه آنلاین در حال راه‌اندازی است — درخواست شما ثبت شد و همکاران ما برای فعال‌سازی با شما تماس می‌گیرند.");
      } else {
        setErr(j.err ?? "شروع پرداخت ناموفق بود — دوباره تلاش کنید");
      }
    } catch {
      setErr("خطای شبکه — اتصال اینترنت را بررسی کنید");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pay-card">
      <label className="c-label">۱. انتخاب پلن</label>
      <div style={{ display: "grid", gap: 10 }}>
        {PLANS.map((p) => (
          <div
            key={p.id}
            onClick={() => setPlan(p.id)}
            style={{
              border: plan === p.id ? "2px solid #2d6fb5" : "1.5px solid #d9e6f2",
              borderRadius: 16,
              padding: "14px 16px",
              cursor: "pointer",
              background: plan === p.id ? "#f0f6fd" : "#fff",
            }}
          >
            <b style={{ fontSize: 14 }}>{p.name}</b>
            <div style={{ fontSize: 12, color: "#5b7a99", marginTop: 4 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      <label className="c-label">۲. دوره‌ی اشتراک</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {MONTHS.map((x) => (
          <button
            key={x.m}
            onClick={() => setMonths(x.m)}
            className="c-date"
            style={months === x.m ? { border: "none", background: "linear-gradient(225deg,#1a4a7a,#2d6fb5)", color: "#fff" } : {}}
          >
            <b style={{ fontSize: 12.5 }}>{x.label}</b>
            <small style={months === x.m ? { color: "rgba(255,255,255,.8)" } : {}}>
              {x.m === 6 ? "یک ماه رایگان" : x.m === 12 ? "دو ماه رایگان" : "بدون تخفیف"}
            </small>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 18,
          background: "#f4f8fc",
          border: "1px dashed #b9cfe3",
          borderRadius: 14,
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800 }}>
          مبلغ قابل پرداخت
          <span style={{ fontSize: 11, color: "#5b7a99", fontWeight: 400 }}> (ماهی {fa(PRICES[plan][months] / months)} تومان)</span>
        </div>
        <div style={{ fontSize: 19, fontWeight: 900, color: "#1a4a7a" }}>{fa(amount)} تومان</div>
      </div>

      {err && <div className="c-err">⚠️ {err}</div>}

      <button className="c-cta ok" style={{ marginTop: 16, width: "100%", justifyContent: "center", height: 50 }} disabled={busy} onClick={goPay}>
        {busy ? "در حال اتصال به درگاه…" : live ? "🔒 پرداخت امن با زرین‌پال" : "💳 ثبت درخواست اشتراک"}
      </button>
      {!live && (
        <p style={{ fontSize: 11.5, color: "#5b7a99", textAlign: "center", marginTop: 8 }}>
          درگاه آنلاین به‌زودی فعال می‌شود؛ فعلاً درخواست شما دستی ثبت و فعال‌سازی می‌شود.
        </p>
      )}
    </div>
  );
}
