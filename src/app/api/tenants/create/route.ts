// ─── ثبت کلینیک جدید — پشت ویزارد /start ───
// هر کلینیک جدید = یک مستأجر با ۱۴ روز试用؛ خبرش برای ادمین تلگرام می‌رود.
import { ADMIN_CHAT_ID, SITE_URL, tg } from "@/lib/clinic-bot";
import { createTenant, type CreateTenantInput } from "@/lib/tenants";
import { logEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: CreateTenantInput;
  try {
    body = (await req.json()) as CreateTenantInput;
  } catch {
    return Response.json({ ok: false, err: "بدنه‌ی درخواست نامعتبر است" }, { status: 400 });
  }

  const res = await createTenant(body);
  if (!res.ok) return Response.json(res, { status: 400 });

  await logEvent("lead", `tenant:${res.tenant.slug}`);
  // خبر ثبت کلینیک جدید برای ادمین (اگر توکن و چت‌آی‌دی تنظیم باشد)
  if (ADMIN_CHAT_ID) {
    await tg("sendMessage", {
      chat_id: ADMIN_CHAT_ID,
      text:
        `🎉 <b>کلینیک جدید ثبت شد</b>\n\n` +
        `🏥 ${res.tenant.name}\n` +
        `🔗 ${SITE_URL}/c/${res.tenant.slug}\n` +
        `📞 ${res.tenant.phone}\n` +
        `👨‍⚕️ پزشکان: ${res.tenant.doctors.map((d) => d.name).join("، ")}\n` +
        `💳 پلن: ${res.tenant.plan === "trial" ? "آزمایشی ۱۴ روزه" : res.tenant.plan}` +
        (res.tenant.ownerChatId ? `\n📨 چت پزشک: ${res.tenant.ownerChatId}` : ""),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  }
  return Response.json({ ok: true, slug: res.tenant.slug });
}
