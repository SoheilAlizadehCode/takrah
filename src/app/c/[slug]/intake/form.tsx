"use client";
// ─── فرم پرسش‌نامه‌ی بیمار (کلاینت) — ارسال به /api/tenants/<slug>/intake ───
import { useState } from "react";

interface Doc {
  id: string;
  name: string;
  spec: string;
}

interface Result {
  ok: boolean;
  err?: string;
  summary?: string;
  urgency?: "low" | "mid" | "high";
  audioUrl?: string;
}

const URGENCY_LABEL: Record<string, string> = {
  low: "🟢 وضعیت عادی",
  mid: "🟡 نیاز به توجه",
  high: "🔴 فوری — زودتر مراجعه کنید",
};

export function IntakeForm({ slug, doctors, clinicName }: { slug: string; doctors: Doc[]; clinicName: string }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [complaint, setComplaint] = useState("");
  const [history, setHistory] = useState("");
  const [meds, setMeds] = useState("");
  const [allergies, setAllergies] = useState("");
  const [pain, setPain] = useState(3);
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);

  async function submit() {
    setErr("");
    if (name.trim().length < 2) return setErr("نام خود را بنویسید");
    if (complaint.trim().length < 5) return setErr("شرح شکایت را کمی بیشتر بنویسید");
    setBusy(true);
    try {
      const r = await fetch(`/api/tenants/${slug}/intake`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, age, phone, doctorId, complaint, history, meds, allergies, pain, extra }),
      });
      const j = (await r.json()) as Result;
      if (j.ok) setRes(j);
      else setErr(j.err ?? "ارسال ناموفق بود — دوباره تلاش کنید");
    } catch {
      setErr("خطای شبکه — اتصال اینترنت را بررسی کنید");
    } finally {
      setBusy(false);
    }
  }

  if (res?.ok) {
    return (
      <div className="c-form-card">
        <div className="c-okbox">
          <div className="big">✅ پرسش‌نامه‌ی شما ارسال شد</div>
          <p>خلاصه‌ی وضعیت‌تان هم‌اکنون برای پزشک {clinicName} در تلگرام رفت.</p>
        </div>
        {res.urgency && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span className={`c-urg ${res.urgency}`}>{URGENCY_LABEL[res.urgency]}</span>
          </div>
        )}
        <div className="c-summary">{res.summary}</div>
        {res.audioUrl && (
          <audio className="c-audio" controls src={res.audioUrl} />
        )}
        <p className="c-note">
          🔒 این خلاصه فقط برای پزشک معالج ارسال می‌شود و در هیچ جای دیگری منتشر نمی‌گردد.
        </p>
        <a className="c-cta ghost" style={{ marginTop: 16 }} href={`/c/${slug}`}>
          🗓 رزرو نوبت ویزیت
        </a>
      </div>
    );
  }

  return (
    <div className="c-form-card">
      <div className="c-row">
        <div>
          <label className="c-label">نام و نام خانوادگی *</label>
          <input className="c-in" placeholder="مثلاً سارا محمدی" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="c-label">سن</label>
          <input className="c-in" placeholder="مثلاً ۳۴" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
      </div>
      <div className="c-row" style={{ marginTop: 12 }}>
        <div>
          <label className="c-label">شماره تماس</label>
          <input className="c-in" placeholder="۰۹…" dir="ltr" style={{ textAlign: "right" }} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="c-label">پزشک مورد نظر</label>
          <select className="c-in" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="c-label">شکایت اصلی — چه چیزی نگران‌تان می‌کند؟ *</label>
      <textarea className="c-in" placeholder="مثلاً: از سه روز پیش دندان عقل پایین چپ درد شدید دارد، شب‌ها بدتر می‌شود…" value={complaint} onChange={(e) => setComplaint(e.target.value)} />

      <label className="c-label">سابقه‌ی بیماری (دیابت، فشار خون، عمل قبلی…)</label>
      <textarea className="c-in" placeholder="اگر سابقه‌ای ندارید، همین‌جا بنویسید «ندارد»" value={history} onChange={(e) => setHistory(e.target.value)} />

      <label className="c-label">داروهایی که مصرف می‌کنید</label>
      <textarea className="c-in" placeholder="مثلاً: متفورمین ۵۰۰ — روزی دو بار" value={meds} onChange={(e) => setMeds(e.target.value)} />

      <label className="c-label">حساسیت دارویی یا غذایی</label>
      <input className="c-in" placeholder="مثلاً پنی‌سیلین — اگر ندارید خالی بگذارید" value={allergies} onChange={(e) => setAllergies(e.target.value)} />

      <label className="c-label" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        شدت درد یا آزار
        <span className="c-pain-val">{pain.toLocaleString("fa-IR")}</span>
        <small style={{ color: "var(--mut)", fontWeight: 400 }}>(۰ = هیچ · ۱۰ = شدیدترین)</small>
      </label>
      <input className="c-range" type="range" min={0} max={10} step={1} value={pain} onChange={(e) => setPain(Number(e.target.value))} />

      <label className="c-label">نکته‌ای دیگر که پزشک باید بداند</label>
      <textarea className="c-in" placeholder="اختیاری" value={extra} onChange={(e) => setExtra(e.target.value)} />

      {err && <div className="c-err">⚠️ {err}</div>}

      <button className="c-cta ok" style={{ marginTop: 18, width: "100%", justifyContent: "center", height: 50 }} disabled={busy} onClick={submit}>
        {busy ? "در حال آماده‌سازی خلاصه و ارسال به پزشک…" : "🩺 ارسال به پزشک"}
      </button>
      <p className="c-note">
        🔒 اطلاعات شما فقط برای پزشک معالج این کلینیک ارسال و تا ۳۰ روز نگهداری می‌شود. اگر درد فوری یا شدید دارید، همین حالا با پذیرش تماس بگیرید.
      </p>
    </div>
  );
}
