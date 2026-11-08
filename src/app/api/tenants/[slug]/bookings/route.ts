// ─── نوبت‌های هر کلینیک: گرفتن ساعت‌های اشغال‌شده + ثبت نوبت جدید ───
import { reply, SITE_URL } from "@/lib/clinic-bot";
import { addBooking, getBookings, getTenant } from "@/lib/tenants";
import { logEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!DATE_RE.test(date)) return Response.json({ ok: false, err: "تاریخ نامعتبر" }, { status: 400 });
  const t = await getTenant(slug);
  if (!t) return Response.json({ ok: false, err: "چنین کلینیکی نیست" }, { status: 404 });
  const list = await getBookings(slug, date);
  return Response.json({ ok: true, booked: list.map((b) => b.slot) });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  const t = await getTenant(slug);
  if (!t) return Response.json({ ok: false, err: "چنین کلینیکی نیست" }, { status: 404 });
  if (t.status === "expired" || t.status === "archived") {
    return Response.json({ ok: false, err: "اشتراک این کلینیک منقضی شده است" }, { status: 403 });
  }

  let body: { date?: string; slot?: string; doctorId?: string; name?: string; phone?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, err: "بدنه‌ی درخواست نامعتبر است" }, { status: 400 });
  }

  const date = (body.date ?? "").trim();
  const slot = (body.slot ?? "").trim();
  const name = (body.name ?? "").trim().slice(0, 60);
  const phone = (body.phone ?? "").trim().slice(0, 20);
  const note = (body.note ?? "").trim().slice(0, 200);
  if (!DATE_RE.test(date) || date < new Date().toISOString().slice(0, 10) || date > new Date(Date.now() + 15 * 86400_000).toISOString().slice(0, 10)) {
    return Response.json({ ok: false, err: "تاریخ باید از امروز تا دو هفته‌ی آینده باشد" }, { status: 400 });
  }
  if (!t.slots.includes(slot)) return Response.json({ ok: false, err: "این ساعت جزو ساعات پذیرش نیست" }, { status: 400 });
  if (name.length < 2) return Response.json({ ok: false, err: "نام بیمار را کامل بنویسید" }, { status: 400 });
  if (!/^[\d+\-\s]{9,15}$/.test(phone)) return Response.json({ ok: false, err: "شماره تماس معتبر نیست" }, { status: 400 });

  const doctor = t.doctors.find((d) => d.id === body.doctorId) ?? t.doctors[0];
  const res = await addBooking(slug, {
    date,
    slot,
    doctorId: doctor.id,
    doctorName: doctor.name,
    name,
    phone,
    note,
  });
  if (!res.ok) return Response.json(res, { status: 409 });

  await logEvent("booking", `${slug}:${slot}`);

  // اطلاع‌رسانی فوری به پزشک/منشی در تلگرام (اگر چت‌آی‌دی تنظیم شده باشد)
  if (t.ownerChatId) {
    const jdate = new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(date + "T09:00:00"));
    await reply(
      t.ownerChatId,
      `🗓 <b>نوبت جدید ${t.name}</b>\n\n` +
        `👤 ${name} — ${phone}\n` +
        `🩺 ${doctor.name} (${doctor.spec})\n` +
        `📌 ${jdate} — ساعت ${slot}` +
        (note ? `\n📝 ${note}` : "") +
        `\n\n🔗 ${SITE_URL}/c/${t.slug}/intake`,
    );
  }
  return Response.json({ ok: true, id: res.booking.id });
}
