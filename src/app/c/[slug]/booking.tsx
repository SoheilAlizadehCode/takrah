"use client";
// ─── ویجت رزرو نوبت — انتخاب پزشک، روز و ساعت + ثبت اطلاعات بیمار ───
import { useEffect, useMemo, useState } from "react";

interface Doc {
  id: string;
  name: string;
  spec: string;
  days: string;
}

interface Day {
  iso: string;
  w: string;
  d: string;
}

const fmt = new Intl.DateTimeFormat("fa-IR", { weekday: "long" });
const fmtD = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" });

export function BookingWidget({ slug, slots, doctors }: { slug: string; slots: string[]; doctors: Doc[] }) {
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState<Day[]>([]);
  const [date, setDate] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [slot, setSlot] = useState("");
  const [booked, setBooked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState("");

  useEffect(() => {
    const list: Day[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(Date.now() + i * 86400_000);
      list.push({ iso: d.toISOString().slice(0, 10), w: fmt.format(d), d: fmtD.format(d) });
    }
    setDays(list);
    setDate(list[0].iso);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!date) return;
    setBooked([]);
    setErr("");
    fetch(`/api/tenants/${slug}/bookings?date=${date}`)
      .then((r) => r.json())
      .then((j: { booked?: string[] }) => setBooked(j.booked ?? []))
      .catch(() => setBooked([]));
  }, [slug, date]);

  const dates = useMemo(() => days, [days]);

  async function submit() {
    setErr("");
    if (!slot) return setErr("یک ساعت را انتخاب کنید");
    if (name.trim().length < 2) return setErr("نام خود را کامل بنویسید");
    if (!/^[\d+\-\s]{9,15}$/.test(phone.trim())) return setErr("شماره تماس معتبر وارد کنید");
    setBusy(true);
    try {
      const res = await fetch(`/api/tenants/${slug}/bookings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date, slot, doctorId, name: name.trim(), phone: phone.trim(), note: note.trim() }),
      });
      const j = (await res.json()) as { ok?: boolean; err?: string; id?: string };
      if (j.ok && j.id) {
        setDoneId(j.id);
        setBooked((b) => [...b, slot]);
      } else {
        setErr(j.err ?? "ثبت نوبت ناموفق بود — دوباره تلاش کنید");
        if (j.err?.includes("گفته شد")) setBooked((b) => [...b, slot]);
      }
    } catch {
      setErr("خطای شبکه — اتصال اینترنت را بررسی کنید");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return <div className="c-loading">در حال بارگذاری تقویم…</div>;

  if (doneId) {
    return (
      <div className="c-book" id="book">
        <div className="c-okbox">
          <div className="big">✅ نوبت شما ثبت شد</div>
          <p>
            {dates.find((x) => x.iso === date)?.d} — ساعت {slot}
            {doctorId && doctors.find((d) => d.id === doctorId) ? ` — ${doctors.find((d) => d.id === doctorId)?.name}` : ""}
          </p>
          <p>کد پیگیری: {doneId}</p>
          <a className="c-cta ghost" style={{ marginTop: 14 }} href={`/c/${slug}/intake`}>
            📋 پرسش‌نامه‌ی پیش از ویزیت را هم پر کنید
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="c-book" id="book">
      <label className="c-label">۱. انتخاب پزشک</label>
      <div className="c-doc-chips">
        {doctors.map((d) => (
          <button key={d.id} className={d.id === doctorId ? "on" : ""} onClick={() => setDoctorId(d.id)}>
            {d.name} · {d.spec}
          </button>
        ))}
      </div>

      <label className="c-label">۲. انتخاب روز</label>
      <div className="c-date-scroll">
        {dates.map((x) => (
          <button key={x.iso} className={`c-date ${x.iso === date ? "on" : ""}`} onClick={() => { setDate(x.iso); setSlot(""); }}>
            <b>{x.w}</b>
            <small>{x.d}</small>
          </button>
        ))}
      </div>

      <label className="c-label">۳. انتخاب ساعت</label>
      <div className="c-slot-grid">
        {slots.map((s) => {
          const isBooked = booked.includes(s);
          return (
            <button key={s} disabled={isBooked} className={`c-slot ${s === slot ? "on" : ""}`} onClick={() => setSlot(s)} title={isBooked ? "این ساعت گرفته شده" : ""}>
              {s}
            </button>
          );
        })}
      </div>

      <label className="c-label">۴. اطلاعات شما</label>
      <div className="c-row">
        <input className="c-in" placeholder="نام و نام خانوادگی *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="c-in" placeholder="شماره تماس *" dir="ltr" style={{ textAlign: "right" }} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <input className="c-in" style={{ marginTop: 12 }} placeholder="توضیح کوتاه (اختیاری) — مثلاً ادامه‌ی درمان" value={note} onChange={(e) => setNote(e.target.value)} />

      {err && <div className="c-err">⚠️ {err}</div>}

      <button className="c-cta ok" style={{ marginTop: 18, width: "100%", justifyContent: "center", height: 50 }} disabled={busy} onClick={submit}>
        {busy ? "در حال ثبت…" : "✅ ثبت نوبت"}
      </button>
      <p style={{ fontSize: "11px", color: "var(--mut)", textAlign: "center", marginTop: 10 }}>
        نوبت شما فوراً برای منشی کلینیک ارسال می‌شود؛ برای تأیید تماس می‌گیریم.
      </p>
    </div>
  );
}
