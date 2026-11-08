// ─── صفحه‌ی عمومی هر کلینیک — قالبی از دموی plan۲ با داده‌ی واقعی مستأجر ───
// آدرس: /c/<slug>  — دموی زنده: /c/salamat (کلینیک سلامت، نخستین مستأجر)
import type { Metadata } from "next";
import { getTenant, ensureSeed } from "@/lib/tenants";
import { ClinicStyles } from "./theme";
import { BookingWidget } from "./booking";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTenant(slug);
  return {
    title: t ? `${t.name} | نوبت‌دهی آنلاین` : "کلینیک یافت نشد",
    description: t ? `${t.name} — رزرو نوبت آنلاین، پاسخگویی هوشمند و پرسش‌نامه‌ی پیش از ویزیت` : undefined,
  };
}

export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
  await ensureSeed();
  const { slug } = await params;
  const t = await getTenant(slug);

  if (!t) {
    return (
      <div className="c-expired" style={{ padding: "140px 20px 60px" }}>
        <style>{`.c-expired{font-family:Vazirmatn,Tahoma,sans-serif;color:#16324a}`}</style>
        <div className="card">
          <div style={{ fontSize: 40 }}>🔍</div>
          <h2>چنین کلینیکی ثبت نشده است</h2>
          <p>آدرس وارد‌شده اشتباه است یا کلینیک هنوز ثبت نشده.</p>
          <a className="c-cta" style={{ marginTop: 16 }} href="/start">
            🚀 کلینیک خودت را رایگان بساز
          </a>
        </div>
      </div>
    );
  }

  if (t.status === "expired" || t.status === "archived") {
    return (
      <div className="c-expired">
        <style>{`.c-expired{font-family:Vazirmatn,Tahoma,sans-serif;color:#16324a}`}</style>
        <div className="card">
          <div style={{ fontSize: 40 }}>⏳</div>
          <h2>اشتراک {t.name} منقضی شده است</h2>
          <p>برای ادامه‌ی نوبت‌دهی آنلاین و دستیار پزشک، اشتراک را تمدید کنید.</p>
          <a className="c-cta" style={{ marginTop: 16 }} href="/start">
            🔄 تمدید اشتراک
          </a>
        </div>
      </div>
    );
  }

  const initial = t.name.trim().charAt(0) || "🏥";
  const planLabel = t.plan === "pro" ? "پلن حرفه‌ای" : t.plan === "basic" ? "پلن استاندارد" : "دوره‌ی آزمایشی";

  return (
    <div className="c-wrap">
      <ClinicStyles />

      {/* nav */}
      <div className="c-nav-wrap">
        <nav className="c-nav">
          <div className="c-brand">
            <div className="logo">{initial}</div>
            <div>
              <b>{t.name}</b>
              <small>{t.tagline}</small>
            </div>
          </div>
          <a className="c-cta" href="#book">
            🗓 رزرو نوبت
          </a>
        </nav>
      </div>

      {/* hero */}
      <header className="c-hero">
        <div className="c-aurora c-a1" />
        <div className="c-aurora c-a2" />
        <div className="c-aurora c-a3" />
        <div className="c-gridp" />
        <div className="container c-hero-grid">
          <div>
            <span className="c-pill">✨ {planLabel} تکنار — منشی هوشمند و نوبت‌دهی آنلاین</span>
            <h1>
              نوبت‌دهی آنلاین <span className="gold">{t.name}</span>
            </h1>
            <p className="lead">
              بدون تماس تلفنی و معطلی؛ روز و ساعت دلخواه‌تان را همین‌جا انتخاب کنید. نوبت شما فوراً برای منشی کلینیک ثبت می‌شود.
            </p>
            <div className="c-info-chips">
              <div className="c-chip">📍 {t.address}</div>
              <div className="c-chip">🕘 {t.hours}</div>
              <div className="c-chip">
                ☎️ پذیرش: <b dir="ltr">{t.phone}</b>
                {t.whatsapp ? (
                  <>
                    {" — واتساپ: "}
                    <a href={`https://wa.me/${t.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "#ffd966" }}>
                      {t.whatsapp}
                    </a>
                  </>
                ) : null}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <a className="c-cta ok" href="#book">
                ✅ رزرو نوبت
              </a>
              <a className="c-cta ghost" style={{ background: "rgba(255,255,255,.1)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }} href={`/c/${t.slug}/intake`}>
                📋 پرسش‌نامه‌ی پیش از ویزیت
              </a>
            </div>
          </div>
          <div className="c-qr-card">
            <img src={`/api/tenants/qr?slug=${t.slug}`} alt={`کد QR نوبت‌دهی ${t.name}`} />
            <b>{t.name}</b>
            <small>اسکن کنید و مستقیم وارد صفحه‌ی نوبت شوید</small>
            <div style={{ marginTop: 12 }}>
              <span className="c-badge">⚡ powered by تکنار</span>
            </div>
          </div>
        </div>
      </header>

      {/* doctors */}
      <section className="c-sec">
        <div className="container">
          <span className="c-kicker">👨‍⚕️ پزشکان ما</span>
          <h2>تیم پزشکی {t.name}</h2>
          <p className="sub">پزشک خود را انتخاب کنید و در روز و ساعت مناسب مراجعه کنید.</p>
          <div className="c-doc-grid">
            {t.doctors.map((d) => (
              <div key={d.id} className="c-doc">
                <div className="av">🩺</div>
                <b>{d.name}</b>
                <div className="spec">{d.spec}</div>
                <div className="days">🗓 {d.days}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* booking */}
      <section className="c-sec alt" id="book-section">
        <div className="container">
          <span className="c-kicker">🗓 نوبت‌دهی آنلاین</span>
          <h2>رزرو نوبت در ۳۰ ثانیه</h2>
          <p className="sub">پزشک و روز و ساعت را انتخاب کنید؛ باقی‌اش با ما.</p>
          <BookingWidget slug={t.slug} slots={t.slots} doctors={t.doctors} />

          {/* دستیار پزشک */}
          <div className="c-intake-strip">
            <div className="ic">🩺</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <b>پرسش‌نامه‌ی پیش از ویزیت</b>
              <p>فرم را پر کنید؛ خلاصه‌ی منظم وضعیت‌تان با صدای گوینده به پزشک‌تان در تلگرام می‌رسد — ویزیت سریع‌تر و دقیق‌تر می‌شود.</p>
            </div>
            <a className="c-cta" href={`/c/${t.slug}/intake`}>
              پر کردن پرسش‌نامه
            </a>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="c-footer">
        <div className="container">
          <div>
            🏥 <b>{t.name}</b> — {t.address}
          </div>
          <div style={{ marginTop: 8, opacity: 0.8 }}>
            پذیرش: <span dir="ltr">{t.phone}</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 11.5 }}>
            ساخته‌شده با <b>تکنار</b> — منشی هوشمند کلینیک شما ·{" "}
            <a href="/start">کلینیک خودت را بساز</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
