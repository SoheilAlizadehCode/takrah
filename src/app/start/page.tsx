"use client";
// ─── /start — ویزارد ثبت کلینیک: ۱۴ روز رایگان، بدون کارت بانکی ───
// سه گام: اطلاعات کلینیک → پزشکان و آدرس صفحه → انتخاب پلن
// خروجی: لینک اختصاصی /c/<slug> + کد QR — همین لحظه قابل اشتراک‌گذاری
import { useEffect, useState } from "react";

interface DocRow {
  name: string;
  spec: string;
  days: string;
}

type Plan = "trial" | "basic" | "pro";

const PLANS: { id: Plan; name: string; price: string; desc: string; perks: string[] }[] = [
  {
    id: "trial",
    name: "آزمایشی",
    price: "۱۴ روز رایگان",
    desc: "بدون کارت بانکی — کل امکانات به‌صورت محدود",
    perks: ["وب‌سایت نوبت‌دهی + QR", "۱۵ پرسش‌نامه‌ی دستیار پزشک در ماه", "اعلان تلگرام نوبت‌ها"],
  },
  {
    id: "basic",
    name: "نوبت‌دهی آنلاین",
    price: "۹۹۰ هزار تومان / ماه",
    desc: "برای کلینیک‌هایی که فقط می‌خواهند نوبت بگیرند",
    perks: ["وب‌سایت نوبت‌دهی + QR", "۶۰ پرسش‌نامه در ماه", "اعلان تلگرام + گزارش ماهانه", "بدون هزینه نصب"],
  },
  {
    id: "pro",
    name: "دستیار دکتر",
    price: "۱٬۹۹۰ هزار تومان / ماه",
    desc: "منشی + دستیار پزشک با خلاصه‌ی هوشمند",
    perks: ["همه‌ی امکانات پلن استاندارد", "۲۰۰ پرسش‌نامه + خلاصه‌ی هوش مصنوعی", "وویس خلاصه‌ی بیمار در چت پزشک", "اولویت پشتیبانی"],
  },
];

const s = {
  wrap: { minHeight: "100vh", background: "#faf7f0", color: "#241d0e", fontFamily: "Vazirmatn, Tahoma, sans-serif", padding: "28px 16px 60px" } as React.CSSProperties,
  box: { maxWidth: 760, margin: "0 auto" } as React.CSSProperties,
  brand: { display: "flex", alignItems: "center", gap: 10, marginBottom: 26, justifyContent: "center" } as React.CSSProperties,
  logo: { width: 44, height: 44, borderRadius: 13, background: "linear-gradient(225deg,#a8821a,#c9a227)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, boxShadow: "0 6px 16px rgba(201,162,39,.4)" } as React.CSSProperties,
  card: { background: "#fff", border: "1px solid #e8dfc8", borderRadius: 22, padding: 26, boxShadow: "0 14px 40px rgba(120,95,20,.09)" } as React.CSSProperties,
  h1: { fontSize: 21, fontWeight: 900, textAlign: "center" as const, margin: "6px 0 4px" },
  sub: { fontSize: 13, color: "#7a6a3d", textAlign: "center" as const, marginBottom: 20 },
  label: { fontSize: 12.5, fontWeight: 800, margin: "16px 0 8px", display: "block", color: "#4a3d15" } as React.CSSProperties,
  input: { width: "100%", border: "1.5px solid #e2d8bc", borderRadius: 13, padding: "11px 14px", fontSize: 13.5, background: "#fffdf7", outline: "none", color: "#241d0e" } as React.CSSProperties,
  btn: { display: "inline-flex", alignItems: "center", gap: 8, height: 48, padding: "0 24px", borderRadius: 14, background: "linear-gradient(270deg,#a8821a,#c9a227)", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 8px 22px rgba(201,162,39,.35)" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 8, height: 48, padding: "0 20px", borderRadius: 14, background: "#fff", color: "#5c4a10", fontWeight: 800, fontSize: 13, border: "1.5px solid #e2d8bc", cursor: "pointer" } as React.CSSProperties,
  steps: { display: "flex", gap: 6, justifyContent: "center", margin: "18px 0", flexWrap: "wrap" as const } as React.CSSProperties,
  step: { fontSize: 11, fontWeight: 800, color: "#9a8a55", background: "#f3ecd8", borderRadius: 999, padding: "6px 13px" } as React.CSSProperties,
  planCard: (on: boolean) => ({ border: on ? "2px solid #c9a227" : "1.5px solid #e2d8bc", borderRadius: 16, padding: 16, background: on ? "#fffbea" : "#fff", cursor: "pointer", textAlign: "right" as const }) as React.CSSProperties,
  err: { background: "rgba(217,83,79,.08)", color: "#b23b37", border: "1px solid rgba(217,83,79,.3)", borderRadius: 12, padding: "10px 14px", fontSize: 12.5, marginTop: 14 } as React.CSSProperties,
};

export default function StartPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [hours, setHours] = useState("شنبه تا پنجشنبه\nصبح ۹ تا ۱۳ — عصر ۱۶ تا ۲۰");
  const [ownerChatId, setOwnerChatId] = useState("");
  const [docs, setDocs] = useState<DocRow[]>([{ name: "", spec: "", days: "شنبه تا پنجشنبه" }]);
  const [slug, setSlug] = useState("");
  const [slugMsg, setSlugMsg] = useState("");
  const [slugOk, setSlugOk] = useState(false);
  const [plan, setPlan] = useState<Plan>("trial");
  const [refCode, setRefCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneSlug, setDoneSlug] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setRefCode(ref);
  }, []);

  function nextFrom1() {
    setErr("");
    if (name.trim().length < 3) return setErr("نام کلینیک را کامل بنویسید");
    if (!/^[\d+\-\s]{9,15}$/.test(phone.trim())) return setErr("شماره تلفن کلینیک معتبر نیست");
    setStep(2);
  }

  async function checkSlug(v: string) {
    const val = v.trim().toLowerCase();
    if (!val) return;
    if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(val)) {
      setSlugMsg("فقط حروف انگلیسی کوچک، عدد و خط تیره (۲ تا ۳۲ نویسه)");
      setSlugOk(false);
      return;
    }
    try {
      const r = await fetch(`/api/tenants/check-slug?slug=${encodeURIComponent(val)}`);
      const j = (await r.json()) as { available?: boolean };
      if (j.available) {
        setSlugMsg(`✅ takrah.top/c/${val} آزاد است`);
        setSlugOk(true);
      } else {
        setSlugMsg("این آدرس قبلاً گرفته شده — دیگری امتحان کنید");
        setSlugOk(false);
      }
    } catch {
      setSlugMsg("بررسی ناموفق — بعداً دوباره امتحان کنید");
      setSlugOk(false);
    }
  }

  function nextFrom2() {
    setErr("");
    if (docs.filter((d) => d.name.trim().length > 1).length === 0) return setErr("حداقل نام یک پزشک را بنویسید");
    setStep(3);
  }

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/tenants/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, phone, address, whatsapp, hours,
          ownerChatId,
          doctors: docs.filter((d) => d.name.trim().length > 1),
          slug: slug.trim().toLowerCase() || undefined,
          plan, refCode: refCode.trim(),
        }),
      });
      const j = (await r.json()) as { ok?: boolean; err?: string; slug?: string };
      if (j.ok && j.slug) setDoneSlug(j.slug);
      else setErr(j.err ?? "ثبت ناموفق بود — دوباره تلاش کنید");
    } catch {
      setErr("خطای شبکه — اتصال اینترنت را بررسی کنید");
    } finally {
      setBusy(false);
    }
  }

  const url = doneSlug ? `${typeof window !== "undefined" ? window.location.origin : "https://takrah.top"}/c/${doneSlug}` : "";

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.brand}>
          <div style={s.logo}>T</div>
          <div style={{ textAlign: "right" }}>
            <b style={{ fontSize: 15, color: "#5c4a10" }}>تکنار</b>
            <div style={{ fontSize: 10.5, color: "#9a8a55" }}>منشی و دستیار هوشمند کلینیک شما</div>
          </div>
        </div>

        <h1 style={s.h1}>
          {doneSlug ? "🎉 کلینیک شما آماده است!" : "کلینیک خود را ۱۴ روز رایگان بسازید"}
        </h1>
        <p style={s.sub}>
          {doneSlug ? "لینک و کد QR اختصاصی‌تان همین حالا فعال است" : "بدون کارت بانکی · بدون نصب · در ۳ دقیقه"}
        </p>

        {!doneSlug && (
          <div style={s.steps}>
            <span style={step === 1 ? { ...s.step, background: "#c9a227", color: "#fff" } : s.step}>۱ · اطلاعات کلینیک</span>
            <span style={step === 2 ? { ...s.step, background: "#c9a227", color: "#fff" } : s.step}>۲ · پزشکان و آدرس صفحه</span>
            <span style={step === 3 ? { ...s.step, background: "#c9a227", color: "#fff" } : s.step}>۳ · انتخاب پلن</span>
          </div>
        )}

        <div style={s.card}>
          {doneSlug ? (
            <>
              <div style={{ textAlign: "center" }}>
                <img src={`/api/tenants/qr?slug=${doneSlug}`} alt="کد QR کلینیک" style={{ width: 170, height: 170 }} />
                <div style={{ fontSize: 14, fontWeight: 900, marginTop: 10, direction: "ltr" }}>{url}</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
                <a style={s.btn} href={`/c/${doneSlug}`}>
                  🔗 دیدن سایت کلینیک من
                </a>
                <button
                  style={s.btnGhost}
                  onClick={() => {
                    navigator.clipboard?.writeText(url).then(() => setCopied(true));
                  }}
                >
                  {copied ? "✅ کپی شد" : "📋 کپی لینک"}
                </button>
                <a style={s.btnGhost} href={`/c/${doneSlug}/intake`}>
                  🩺 دیدن پرسش‌نامه‌ی بیمار
                </a>
              </div>
              <p style={{ fontSize: 12, color: "#7a6a3d", marginTop: 18, lineHeight: 2 }}>
                💡 همین لینک را در اینستاگرام و واتساپ کلینیک بگذارید تا بیمارها مستقیم نوبت بگیرند.
                {ownerChatId ? " خلاصه‌ی بیمارها به تلگرام شما می‌آید." : " اگر چت‌آی‌دی تلگرام ندادید، برای دریافت خلاصه‌ی بیمارها با ما هماهنگ کنید."}
                <br />
                📞 برای فعال‌سازی پلن پرداختی و راه‌اندازی کامل با ما تماس بگیرید.
              </p>
            </>
          ) : step === 1 ? (
            <>
              <label style={s.label}>نام کلینیک *</label>
              <input style={s.input} placeholder="مثلاً کلینیک دندانپزشکی لبخند گیل" value={name} onChange={(e) => setName(e.target.value)} />

              <label style={s.label}>تلفن پذیرش *</label>
              <input style={s.input} placeholder="۰۱۳-۳۲۲۲۴۴۰۰" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />

              <label style={s.label}>آدرس</label>
              <input style={s.input} placeholder="رشت، گلسار، بلوار نماز، مجتمع پزشکان سلامت" value={address} onChange={(e) => setAddress(e.target.value)} />

              <label style={s.label}>واتساپ کلینیک (اختیاری)</label>
              <input style={s.input} placeholder="۰۹۱۱۱۱۱۲۲۳۳" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />

              <label style={s.label}>ساعات کاری</label>
              <textarea style={{ ...s.input, minHeight: 74 }} value={hours} onChange={(e) => setHours(e.target.value)} />

              <label style={s.label}>چت‌آی‌دی تلگرام پزشک/منشی (برای رسیدن نوبت‌ها و خلاصه‌ی بیمارها — اختیاری)</label>
              <input style={s.input} placeholder="مثلاً ۱۲۳۴۵۶۷۸۹ — با /id از ربات تکنار بگیرید" dir="ltr" value={ownerChatId} onChange={(e) => setOwnerChatId(e.target.value)} />

              {err && <div style={s.err}>⚠️ {err}</div>}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button style={s.btn} onClick={nextFrom1}>
                  مرحله‌ی بعد ←
                </button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <label style={s.label}>پزشکان کلینیک</label>
              {docs.map((d, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.4fr auto", gap: 8, marginBottom: 8 }}>
                  <input style={s.input} placeholder="نام پزشک" value={d.name} onChange={(e) => setDocs((a) => a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <input style={s.input} placeholder="تخصص" value={d.spec} onChange={(e) => setDocs((a) => a.map((x, j) => (j === i ? { ...x, spec: e.target.value } : x)))} />
                  <input style={s.input} placeholder="روزهای حضور" value={d.days} onChange={(e) => setDocs((a) => a.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)))} />
                  <button
                    style={{ ...s.btnGhost, height: 44, padding: "0 12px" }}
                    onClick={() => setDocs((a) => (a.length > 1 ? a.filter((_, j) => j !== i) : a))}
                    title="حذف"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {docs.length < 12 && (
                <button style={{ ...s.btnGhost, height: 40 }} onClick={() => setDocs((a) => [...a, { name: "", spec: "", days: "شنبه تا پنجشنبه" }])}>
                  ＋ افزودن پزشک
                </button>
              )}

              <label style={s.label}>آدرس اختصاصی صفحه‌ی کلینیک شما</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12.5, color: "#9a8a55", direction: "ltr", whiteSpace: "nowrap" }}>takrah.top/c/</span>
                <input
                  style={s.input}
                  placeholder="labkhand — یا خالی بگذارید خودکار بسازیم"
                  dir="ltr"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase());
                    setSlugOk(false);
                    setSlugMsg("");
                  }}
                  onBlur={(e) => checkSlug(e.target.value)}
                />
              </div>
              {slugMsg && (
                <div style={{ fontSize: 12, marginTop: 8, color: slugOk ? "#2e7d55" : "#b23b37", fontWeight: 700 }}>{slugMsg}</div>
              )}

              <label style={s.label}>کد بازاریاب (اگر دارید)</label>
              <input style={s.input} placeholder="مثلاً ALI20" dir="ltr" value={refCode} onChange={(e) => setRefCode(e.target.value)} />

              {err && <div style={s.err}>⚠️ {err}</div>}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                <button style={s.btnGhost} onClick={() => setStep(1)}>
                  → مرحله‌ی قبل
                </button>
                <button style={s.btn} onClick={nextFrom2}>
                  مرحله‌ی بعد ←
                </button>
              </div>
            </>
          ) : (
            <>
              {PLANS.map((p) => (
                <div key={p.id} style={{ ...s.planCard(plan === p.id), marginBottom: 12 }} onClick={() => setPlan(p.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <b style={{ fontSize: 14.5 }}>{p.name}</b>
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: "#8a6d00" }}>{p.price}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#7a6a3d", margin: "5px 0 8px" }}>{p.desc}</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {p.perks.map((k) => (
                      <li key={k} style={{ fontSize: 12, color: "#4a3d15", lineHeight: 2 }}>
                        ✅ {k}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {err && <div style={s.err}>⚠️ {err}</div>}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                <button style={s.btnGhost} onClick={() => setStep(2)}>
                  → مرحله‌ی قبل
                </button>
                <button style={s.btn} disabled={busy} onClick={submit}>
                  {busy ? "در حال ساخت کلینیک…" : "🚀 ساخت کلینیک من"}
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: "#9a8a55", textAlign: "center", marginTop: 14, lineHeight: 2 }}>
                ثبت نام یعنی موافقت با شرایط استفاده؛ دوره‌ی آزمایشی ۱۴ روزه است و بعد از آن می‌توانید پلن را تمدید کنید.
              </p>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#b3a26a", marginTop: 18 }}>
          تکنار — نوبت‌دهی آنلاین + منشی هوشمند + دستیار پزشک · takrah.top
        </p>
      </div>
    </div>
  );
}
