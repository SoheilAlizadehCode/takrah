// ─── شروع پرداخت اشتراک — POST { slug, plan, months } ───
// اگر ZARINPAL_MERCHANT_ID تنظیم نباشد: حالت دستی — خبر به ادمین، پاسخ manual برای نمایش راهنما
import { ADMIN_CHAT_ID, SITE_URL, tg } from "@/lib/clinic-bot";
import { PAYMENTS_LIVE, PLAN_LABEL, PRICES, savePendingPay, zarinpalRequest, type PayMonths } from "@/lib/billing";
import { getTenant } from "@/lib/tenants";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: { slug?: string; plan?: string; months?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, err: "بدنه‌ی درخواست نامعتبر است" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim().toLowerCase();
  const plan = body.plan === "basic" || body.plan === "pro" ? body.plan : "";
  const months = (body.months === 1 || body.months === 6 || body.months === 12 ? body.months : 0) as PayMonths;
  if (!slug) return Response.json({ ok: false, err: "مطب یافت نشد" }, { status: 400 });
  if (!plan) return Response.json({ ok: false, err: "پلن را انتخاب کنید" }, { status: 400 });
  if (!months) return Response.json({ ok: false, err: "دوره‌ی اشتراک را انتخاب کنید" }, { status: 400 });

  const t = await getTenant(slug);
  if (!t) return Response.json({ ok: false, err: "چنین مطبی ثبت نشده است" }, { status: 404 });

  const amount = PRICES[plan][months];
  if (!amount) return Response.json({ ok: false, err: "قیمت نامعتبر است" }, { status: 400 });

  // حالت دستی — تا وقتی مرچنت زرین‌پال در Vercel ست نشده
  if (!PAYMENTS_LIVE) {
    if (ADMIN_CHAT_ID) {
      await tg("sendMessage", {
        chat_id: ADMIN_CHAT_ID,
        text:
          `💳 <b>درخواست اشتراک (پرداخت دستی)</b>\n\n` +
          `🏥 ${t.name} — ${slug}\n` +
          `📦 پلن: ${PLAN_LABEL[plan]} — ${months} ماهه\n` +
          `💰 مبلغ: ${amount.toLocaleString("fa-IR")} تومان\n` +
          `🔗 ${SITE_URL}/pay/${slug}`,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    }
    return Response.json({ ok: false, manual: true, amount, err: "درگاه پرداخت هنوز فعال نیست — فعال‌سازی دستی ثبت شد" });
  }

  const r = await zarinpalRequest(amount, `اشتراک ${PLAN_LABEL[plan]} ${months} ماهه — ${t.name}`);
  if (!r.ok) {
    return Response.json({ ok: false, err: `اتصال به درگاه ناموفق: ${r.err}` }, { status: 502 });
  }
  await savePendingPay(r.authority, { authority: r.authority, slug, amount, plan, months });
  return Response.json({ ok: true, url: r.url, amount });
}
