// ─── صفحه‌ی پرداخت و تمدید اشتراک هر مطب/کلینیک — /pay/<slug> ───
// پلن (استاندارد/حرفه‌ای) × دوره (۱/۶/۱۲ ماهه) → درگاه زرین‌پال → فعال‌سازی خودکار
import type { Metadata } from "next";
import { faDate, PAYMENTS_LIVE } from "@/lib/billing";
import { getTenant } from "@/lib/tenants";
import { PayForm } from "./form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTenant(slug);
  return {
    title: t ? `خرید و تمدید اشتراک | ${t.name}` : "مطب یافت نشد",
    description: t ? `${t.name} — خرید و تمدید اشتراک منشی هوشمند تکنار` : undefined,
  };
}

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ failed?: string; new?: string; err?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const t = await getTenant(slug);

  if (!t) {
    return (
      <div className="c-expired" style={{ padding: "140px 20px 60px", fontFamily: "Vazirmatn,Tahoma,sans-serif" }}>
        <div className="card">
          <div style={{ fontSize: 40 }}>🔍</div>
          <h2>چنین مطبی ثبت نشده است</h2>
          <p>اول از صفحه‌ی ثبت‌نام مطب خودت را بساز.</p>
          <a className="c-cta" style={{ marginTop: 16 }} href="/start">
            🚀 ساخت مطب در تکنار
          </a>
        </div>
        <style>{`.card{background:#fff;border:1px solid #d9e6f2;border-radius:22px;box-shadow:0 16px 44px rgba(26,74,122,.1);padding:36px;text-align:center;max-width:460px;margin:0 auto}h2{font-size:19px;font-weight:900;margin:14px 0 8px;color:#16324a}p{font-size:13px;color:#5b7a99}`}</style>
      </div>
    );
  }

  const statusLabel =
    t.status === "active"
      ? `✅ اشتراک فعال — اعتبار تا ${t.paidUntil ? faDate(t.paidUntil) : "نامحدود"}`
      : t.status === "trial"
        ? "⏳ دوره‌ی آزمایشی ۱۴ روزه"
        : "⛔ اشتراک منقضی شده";

  return (
    <div className="c-wrap" style={{ fontFamily: "Vazirmatn,Tahoma,sans-serif", color: "#16324a", minHeight: "100vh", background: "#f4f8fc" }}>
      <style>{`
.pay-wrap{max-width:700px;margin:0 auto;padding:40px 18px 60px}
.pay-head{text-align:center;margin-bottom:24px}
.pay-head h1{font-size:21px;font-weight:900}
.pay-status{display:inline-block;margin-top:10px;font-size:12.5px;font-weight:800;background:#fff;border:1px solid #d9e6f2;border-radius:999px;padding:8px 16px}
.pay-card{background:#fff;border:1px solid #d9e6f2;border-radius:20px;padding:22px;box-shadow:0 14px 40px rgba(26,74,122,.08);margin-top:16px}
`}</style>
      <div className="pay-wrap">
        <div className="pay-head">
          <h1>💳 خرید و تمدید اشتراک — {t.name}</h1>
          <span className="pay-status">{statusLabel}</span>
        </div>

        {sp.failed && (
          <div className="c-err" style={{ fontFamily: "inherit" }}>
            ⚠️ پرداخت ناموفق بود یا لغو شد — می‌توانی دوباره تلاش کنی.
            {sp.err === "activate" ? " (خطای فعال‌سازی؛ اگر مبلغ کسر شده با پشتیبانی تماس بگیر — کد رهگیری در زرین‌پال موجود است)" : ""}
          </div>
        )}
        {sp.new && (
          <div className="c-okbox" style={{ marginBottom: 14 }}>
            <div className="big">🎉 مطب شما ساخته شد!</div>
            <p>آخرین قدم: پلن و دوره را انتخاب و پرداخت کن — اشتراک بلافاصله فعال می‌شود.</p>
          </div>
        )}

        <PayForm slug={t.slug} live={PAYMENTS_LIVE} />

        <p className="c-note" style={{ background: "#fff", border: "1px solid #d9e6f2" }}>
          🔒 پرداخت امن زرین‌پال · فعال‌سازی خودکار همان لحظه · بدون نیاز به نصب یا سورس‌کد · قابل لغو در پایان دوره ·
          برای هر مشکل، پشتیبانی تکنار در تلگرام پاسخ‌گو است.
        </p>
      </div>
    </div>
  );
}
