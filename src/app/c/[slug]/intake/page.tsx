// ─── پرسش‌نامه‌ی پیش از ویزیت — دستیار دکتر ───
// بیمار فرم را پر می‌کند؛ خلاصه + وویس برای پزشک در تلگرام می‌رود.
import type { Metadata } from "next";
import { getTenant } from "@/lib/tenants";
import { ClinicStyles } from "../theme";
import { IntakeForm } from "./form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTenant(slug);
  return {
    title: t ? `پرسش‌نامه‌ی پیش از ویزیت | ${t.name}` : "کلینیک یافت نشد",
    description: t ? `${t.name} — پرسش‌نامه‌ی تخصصی پیش از ویزیت؛ خلاصه‌ی وضعیت شما به پزشک می‌رسد` : undefined,
  };
}

export default async function IntakePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTenant(slug);

  if (!t || t.status === "expired" || t.status === "archived") {
    return (
      <div className="c-expired" style={{ padding: "140px 20px 60px" }}>
        <style>{`.c-expired{font-family:Vazirmatn,Tahoma,sans-serif;color:#16324a}`}</style>
        <div className="card">
          <div style={{ fontSize: 40 }}>⏳</div>
          <h2>این بخش در حال حاضر فعال نیست</h2>
          <p>اشتراک کلینیک منقضی شده یا کلینیک ثبت نشده است.</p>
          <a className="c-cta" style={{ marginTop: 16 }} href="/start">
            🚀 ساخت کلینیک در تکنار
          </a>
        </div>
      </div>
    );
  }

  const initial = t.name.trim().charAt(0) || "🏥";

  return (
    <div className="c-wrap">
      <ClinicStyles />

      <div className="c-nav-wrap">
        <nav className="c-nav">
          <div className="c-brand">
            <div className="logo">{initial}</div>
            <div>
              <b>{t.name}</b>
              <small>پرسش‌نامه‌ی پیش از ویزیت</small>
            </div>
          </div>
          <a className="c-cta ghost" href={`/c/${t.slug}`}>
            🗓 رزرو نوبت
          </a>
        </nav>
      </div>

      <header className="c-hero" style={{ paddingBottom: 40 }}>
        <div className="c-aurora c-a1" />
        <div className="c-aurora c-a2" />
        <div className="c-gridp" />
        <div className="container" style={{ position: "relative" }}>
          <span className="c-pill">🩺 دستیار پزشک — خلاصه با هوش مصنوعی</span>
          <h1 style={{ fontSize: 28 }}>
            قبل از ویزیت، وضعیت‌تان را <span className="gold">دقیق</span> بگویید
          </h1>
          <p className="lead">
            فرم زیر را پر کنید؛ خلاصه‌ی منظم وضعیت شما + نسخه‌ی صوتی به {t.doctors[0]?.name ?? "پزشک"} می‌رسد تا وقت ویزیت روی موضوع اصلی بگذارد.
          </p>
        </div>
      </header>

      <section className="container" style={{ paddingBottom: 70 }}>
        <IntakeForm slug={t.slug} doctors={t.doctors} clinicName={t.name} />
      </section>
    </div>
  );
}
