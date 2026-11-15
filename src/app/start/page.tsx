"use client";
// ─── /start — ویزارد ثبت مطب/کلینیک: پلن را انتخاب کن، پرداخت کن، فعال شود ───
// سه گام: اطلاعات مطب (دکتر/کلینیک) → پزشکان و آدرس صفحه → انتخاب پلن و دوره
// خروجی: لینک اختصاصی /c/<slug> + کد QR — سپس پرداخت ۶ ماهه/یکساله
import { useEffect, useState } from "react";

interface DocRow {
  name: string;
  spec: string;
  days: string;
}

type Plan = "site" | "booking" | "full";
type Kind = "matb" | "clinic";

const PLAN_NAMES: Record<Plan, string> = {
  site: "سایت مطب",
  booking: "سایت + نوبت‌دهی",
  full: "کامل — دستیار آوا",
};

const PLANS: { id: Plan; name: string; desc: string; perks: string[]; prices: Record<6 | 12, string> }[] = [
  {
    id: "site",
    name: "سایت مطب",
    desc: "حضور آنلاین حرفه‌ای — بدون نوبت‌دهی",
    prices: { 6: "۹٬۹۰۰٬۰۰۰ تومان", 12: "۱۶٬۹۰۰٬۰۰۰ تومان" },
    perks: ["وب‌سایت اختصاصی مطب + کد QR", "مشخصات پزشک، خدمات و ساعات کاری", "دکمهٔ تماس و واتساپ برای بیمار", "لینک اختصاصی takrah.top/c/نام‌شما"],
  },
  {
    id: "booking",
    name: "سایت + نوبت‌دهی آنلاین",
    desc: "برای مطبی که می‌خواهد هیچ تماسی از دست نرود",
    prices: { 6: "۱۵٬۹۰۰٬۰۰۰ تومان", 12: "۲۹٬۹۰۰٬۰۰۰ تومان" },
    perks: ["همهٔ امکانات پلن «سایت مطب»", "نوبت‌دهی آنلاین ۲۴/۷ + جلوگیری از رزرو تکراری", "اعلان لحظه‌ای تلگرام برای هر نوبت", "پرداخت آنلاین ۶ ماهه / یکساله"],
  },
  {
    id: "full",
    name: "کامل — با دستیار هوشمند «آوا»",
    desc: "منشی شبانهٔ هوشمند + دستیار پزشک با خلاصهٔ صوتی",
    prices: { 6: "۳۱٬۹۰۰٬۰۰۰ تومان", 12: "۵۹٬۰۰۰٬۰۰۰ تومان" },
    perks: ["همهٔ امکانات پلن «سایت + نوبت‌دهی»", "پرسش‌نامهٔ هوشمند بیمار — ۲۰۰ در ماه", "خلاصهٔ هوش مصنوعی + وویس در تلگرام شما", "اولویت پشتیبانی — پاسخ در کمتر از یک ساعت"],
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
  const [kind, setKind] = useState<Kind>("matb");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [hours, setHours] = useState("شنبه تا پنجشنبه\nصبح ۹ تا ۱۳ — عصر ۱۶ تا ۲۰");
  const [ownerChatId, setOwnerChatId] = useState("");
  const [docs, setDocs] = useState<DocRow[]>([{ name: "", spec: "", days: "شنبه تا پنجشنبه" }]);
  const [slug, setSlug] = useState("");
  const [slugMsg, setSlugMsg] = useState("");
  const [slugOk, setSlugOk] = useState(false);
  const [plan, setPlan] = useState<Plan>("full");
  const [period, setPeriod] = useState<6 | 12>(6);
  const [refCode, setRefCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneSlug, setDoneSlug] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ref = q.get("ref");
    if (ref) setRefCode(ref);
    // پیش‌انتخاب پلن و نوع مجموعه از لینک صفحهٔ پلن‌ها (/start?plan=full&type=clinic)
    const qp = q.get("plan");
    if (qp === "site" || qp === "booking" || qp === "full") setPlan(qp);
    const qt = q.get("type");
    if (qt === "clinic" || qt === "matb") setKind(qt);
  }, []);

  function nextFrom1() {
    setErr("");
    if (name.trim().length < 3) return setErr(kind === "matb" ? "نام مطب را کامل بنویسید (مثلاً مطب دکتر سارا محمدی)" : "نام کلینیک را کامل بنویسید");
    if (!/^[\d+\-\s]{9,15}$/.test(phone.trim())) return setErr("شماره تلفن معتبر نیست");
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
          type: kind,
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
            <div style={{ fontSize: 10.5, color: "#9a8a55" }}>منشی و دستیار هوشمند مطب شما</div>
          </div>
        </div>

        <h1 style={s.h1}>
          {doneSlug ? "🎉 مطب شما آماده است!" : "مطب خود را در ۳ دقیقه بسازید"}
        </h1>
        <p style={s.sub}>
          {doneSlug
            ? "لینک و کد QR اختصاصی‌تان همین حالا فعال است"
            : "وب‌سایت + نوبت‌دهی + دستیار هوشمند — پلن را انتخاب کنید، پرداخت کنید، همان لحظه فعال شود"}
        </p>

        {!doneSlug && (
          <div style={s.steps}>
            <span style={step === 1 ? { ...s.step, background: "#c9a227", color: "#fff" } : s.step}>۱ · اطلاعات مطب</span>
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
                <a style={{ ...s.btn, width: "100%", justifyContent: "center" }} href={`/pay/${doneSlug}?new=1&plan=${plan}&months=${period}`}>
                  💳 پرداخت و فعال‌سازی اشتراک {PLAN_NAMES[plan]}
                </a>
              </div>
              <p style={{ fontSize: 12, color: "#7a6a3d", marginTop: 18, lineHeight: 2 }}>
                💡 همین لینک را در اینستاگرام و واتساپ مطب بگذارید تا بیمارها مستقیم نوبت بگیرند.
                {ownerChatId ? " خلاصه‌ی بیمارها به تلگرام شما می‌آید." : " اگر چت‌آی‌دی تلگرام ندادید، برای دریافت خلاصه‌ی بیمارها با ما هماهنگ کنید."}
                <br />
                💳 اشتراک فعلاً در حالت پیش‌نمایش است — با پرداختِ پلن «{PLAN_NAMES[plan]}» فعال‌سازی قطعی می‌شود.
              </p>
            </>
          ) : step === 1 ? (
            <>
              <label style={s.label}>نوع مجموعه — پلن‌ها برای هر دو فعال است</label>
              <div style={{ display: "flex", gap: 10 }}>
                {(["matb", "clinic"] as Kind[]).map((k) => (
                  <div
                    key={k}
                    onClick={() => setKind(k)}
                    style={{
                      flex: 1,
                      border: kind === k ? "2px solid #c9a227" : "1.5px solid #e2d8bc",
                      borderRadius: 16,
                      padding: "13px 16px",
                      cursor: "pointer",
                      background: kind === k ? "#fffbea" : "#fff",
                    }}
                  >
                    <b style={{ fontSize: 13.5 }}>{k === "matb" ? "🩺 مطب خصوصی" : "🏥 کلینیک چندپزشکه"}</b>
                    <div style={{ fontSize: 11.5, color: "#7a6a3d", marginTop: 3 }}>
                      {k === "matb" ? "یک پزشک — رایج‌ترین حالت (پیش‌فرض)" : "چند پزشک و تخصص"}
                    </div>
                  </div>
                ))}
              </div>

              <label style={s.label}>{kind === "matb" ? "نام مطب *" : "نام کلینیک *"}</label>
              <input style={s.input} placeholder={kind === "matb" ? "مثلاً مطب دکتر سارا محمدی — دندانپزشکی" : "مثلاً کلینیک دندانپزشکی لبخند گیل"} value={name} onChange={(e) => setName(e.target.value)} />

              <label style={s.label}>تلفن پذیرش *</label>
              <input style={s.input} placeholder="۰۱۳-۳۲۲۲۴۴۰۰" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />

              <label style={s.label}>{kind === "matb" ? "آدرس مطب" : "آدرس کلینیک"}</label>
              <input style={s.input} placeholder="رشت، گلسار، بلوار نماز، مجتمع پزشکان سلامت" value={address} onChange={(e) => setAddress(e.target.value)} />

              <label style={s.label}>واتساپ (اختیاری)</label>
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
              <label style={s.label}>پزشک‌ها {kind === "matb" ? "— برای مطب معمولاً همان یک پزشک کافی است" : "کلینیک"}</label>
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

              <label style={s.label}>آدرس اختصاصی صفحه‌ی مطب شما</label>
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
              <div style={{ fontSize: 12.5, color: "#7a6a3d", textAlign: "center", marginBottom: 12 }}>
                دوره‌ی پرداخت (برای پلن‌های پولی):
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
                  {([6, 12] as const).map((m) => (
                    <div
                      key={m}
                      onClick={() => setPeriod(m)}
                      style={{
                        border: period === m ? "2px solid #c9a227" : "1.5px solid #e2d8bc",
                        borderRadius: 12,
                        padding: "7px 18px",
                        cursor: "pointer",
                        background: period === m ? "#fffbea" : "#fff",
                        fontWeight: 800,
                        fontSize: 12.5,
                      }}
                    >
                      {m === 6 ? "۶ ماهه" : "یکساله — دو ماه رایگان"}
                    </div>
                  ))}
                </div>
              </div>
              {PLANS.map((p) => (
                <div key={p.id} style={{ ...s.planCard(plan === p.id), marginBottom: 12 }} onClick={() => setPlan(p.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <b style={{ fontSize: 14.5 }}>{p.name}</b>
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: "#8a6d00" }}>{p.prices[period]}</span>
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
                ثبت‌نام یعنی موافقت با شرایط استفاده؛ بعد از ثبت، پلن و دوره را پرداخت کنید تا اشتراک قطعی شود — ارتقا و تمدید همیشه آزاد است.
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
