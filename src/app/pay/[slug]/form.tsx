"use client";
// ─── فرم انتخاب پلن × دوره → درگاه زرین‌پال ───
// سه پلن (سایت / سایت+نوبت‌دهی / کامل+آوا) × دو دوره (۶ ماهه / یکساله)
import { useState } from "react";

type Plan = "site" | "booking" | "full";
type Months = 6 | 12;

const PLANS: { id: Plan; name: string; desc: string }[] = [
  { id: "site", name: "سایت مطب", desc: "وب‌سایت اختصاصی + QR + مشخصات پزشک و تماس/واتساپ — بدون نوبت‌دهی" },
  { id: "booking", name: "سایت + نوبت‌دهی", desc: "همه‌ی امکانات سایت + نوبت‌دهی آنلاین ۲۴/۷ + اعلان تلگرام هر نوبت" },
  { id: "full", name: "کامل — دستیار آوا", desc: "همه‌ی امکانات + پرسش‌نامه‌ی بیمار + خلاصه‌ی هوشمند با وویس در تلگرام شما" },
];

const MONTHS: { m: Months; label: string; note: string }[] = [
  { m: 6, label: "۶ ماهه", note: "پرداخت یک‌جا" },
  { m: 12, label: "یکساله", note: "دو ماه رایگان" },
];

const PRICES: Record<Plan, Record<Months, number>> = {
  site: { 6: 9_900_000, 12: 16_900_000 },
  booking: { 6: 15_900_000, 12: 29_900_000 },
  full: { 6: 31_900_000, 12: 59_000_000 },
};

const fa = (n: number) => n.toLocaleString("fa-IR");

/** پلن از query ویزارد می‌آید — سازگار با پلن‌های قدیمی basic/pro */
function parseInitialPlan(v?: string): Plan {
  if (v === "site") return "site";
  if (v === "booking" || v === "basic") return "booking";
  if (v === "full" || v === "pro") return "full";
  return "full";
}

export function PayForm({
  slug,
  live,
  initialPlan,
  initialMonths,
}: {
  slug: string;
  live: boolean;
  initialPlan?: string;
  initialMonths?: number;
}) {
  const [plan, setPlan] = useState<Plan>(parseInitialPlan(initialPlan));
  const [months, setMonths] = useState<Months>(initialMonths === 12 ? 12 : 6);
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {MONTHS.map((x) => (
          <button
            key={x.m}
            onClick={() => setMonths(x.m)}
            className="c-date"
            style={months === x.m ? { border: "none", background: "linear-gradient(225deg,#1a4a7a,#2d6fb5)", color: "#fff" } : {}}
          >
            <b style={{ fontSize: 12.5 }}>{x.label}</b>
            <small style={months === x.m ? { color: "rgba(255,255,255,.8)" } : {}}>{x.note}</small>
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
