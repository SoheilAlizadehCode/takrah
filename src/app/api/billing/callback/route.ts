// ─── بازگشت از درگاه زرین‌پال — تأیید پرداخت و فعال‌سازی خودکار اشتراک ───
// زرین‌پال بعد از پرداخت به این مسیر برمی‌گرداند: ?Authority=...&Status=OK|NOK
// موفق → ریدایرکت به /c/<slug>?paid=1 — ناموفق → /pay/<slug>?failed=1
import { ADMIN_CHAT_ID, tg } from "@/lib/clinic-bot";
import { activateSubscription, faDate, getPendingPay, MONTHS_LABEL, PLAN_LABEL, zarinpalVerify } from "@/lib/billing";

export const dynamic = "force-dynamic";

function redirect(loc: string): Response {
  return new Response(null, { status: 302, headers: { location: loc } });
}

export async function GET(req: Request): Promise<Response> {
  const p = new URL(req.url).searchParams;
  const authority = (p.get("Authority") ?? p.get("authority") ?? "").trim();
  const status = (p.get("Status") ?? p.get("status") ?? "").toUpperCase();

  if (!authority || !/^[-a-z0-9]{20,80}$/i.test(authority)) return redirect(`/start?pay=bad`);
  const pending = await getPendingPay(authority);
  if (status !== "OK") {
    if (pending) await kvDbg("cancel", authority);
    return redirect(pending ? `/pay/${pending.slug}?failed=1` : `/start?pay=cancel`);
  }
  if (!pending) return redirect(`/start?pay=expired`);

  const v = await zarinpalVerify(pending.amount, authority);
  if (!v.ok) {
    await kvDbg("verify-fail", `${authority}: ${v.err}`);
    return redirect(`/pay/${pending.slug}?failed=1`);
  }

  const plan = pending.plan === "basic" || pending.plan === "pro" ? pending.plan : "pro";
  const months = pending.months === 1 || pending.months === 6 || pending.months === 12 ? pending.months : 1;
  const act = await activateSubscription(pending.slug, plan, months, {
    authority,
    refId: v.refId,
    slug: pending.slug,
    amount: pending.amount,
    plan,
    months,
    t: Date.now(),
  });
  if (!act) return redirect(`/pay/${pending.slug}?failed=1&err=activate`);

  // خبر پرداخت موفق برای ادمین و صاحب مطب
  const msg =
    `💰 <b>پرداخت موفق — اشتراک فعال شد</b>\n\n` +
    `🏥 ${act.tenant.name} — ${pending.slug}\n` +
    `📦 ${PLAN_LABEL[plan]} — ${MONTHS_LABEL[months]}\n` +
    `💵 ${pending.amount.toLocaleString("fa-IR")} تومان\n` +
    `🧾 کد رهگیری: ${v.refId}\n` +
    `📅 اعتبار تا: ${faDate(act.paidUntil)}`;
  if (ADMIN_CHAT_ID) await tg("sendMessage", { chat_id: ADMIN_CHAT_ID, text: msg, parse_mode: "HTML", disable_web_page_preview: true });
  if (act.tenant.ownerChatId && act.tenant.ownerChatId !== ADMIN_CHAT_ID) {
    await tg("sendMessage", { chat_id: act.tenant.ownerChatId, text: msg, parse_mode: "HTML", disable_web_page_preview: true });
  }

  return redirect(`/c/${pending.slug}?paid=1`);
}

async function kvDbg(stage: string, info: string): Promise<void> {
  const { kvSet } = await import("@/lib/kv");
  await kvSet("dbg:zarinpal", JSON.stringify({ t: Date.now(), stage, body: info.slice(0, 300) }));
}
