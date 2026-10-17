// ─── گزارش عملکرد سامانه برای رئیس درمانگاه ───
// داده‌ها: نوبت‌های VIP + سرنخ‌ها + رویدادهای آنالیتیکس (آوا، یادآوری، تماس)
// مصرف‌کننده‌ها: روت کرون /api/telegram/daily-report + فرمان /report در خود ربات VIP
import { SPECS, VIP_DOCTORS, allVipBookings, allVipLeads } from "./vip-bot";
import { getEvents, logEvent, safeParse, storageMode, type AnalyticsEvent } from "./kv";
import { aiAvailable } from "./ai";

export interface ReportData {
  generatedAt: string;
  dateLabel: string;
  storage: "redis" | "memory";
  ai: boolean;
  totals: {
    bookings: number;
    leads: number;
    todayBookings: number;
    weekBookings: number;
    avaQuestions: number;
    llmAnswers: number;
    voices: number;
    reminders: number;
    calls: number;
    confirms: number;
  };
  bySpec: { name: string; emoji: string; count: number }[];
  byDoctor: { name: string; count: number }[];
  topTopics: { topic: string; count: number }[];
  recentBookings: { id: string; userName: string; spec: string; doctor: string; when: string }[];
  recentLeads: { id: string; userName: string; phone: string; topic: string; when: string }[];
}

const fa = (n: number) => n.toLocaleString("fa-IR");

/** برچسب تاریخ امروز به شمسی — از همان موتور پلن ۲ */
function todayFaLabel(): string {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      timeZone: "Asia/Tehran",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

function isToday(ts: number): boolean {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date(ts)) ===
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());
}

function isThisWeek(ts: number): boolean {
  return Date.now() - ts <= 7 * 24 * 60 * 60 * 1000;
}

function whenFa(ts: number): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "Asia/Tehran",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export async function buildReport(): Promise<ReportData> {
  const [bookings, leads, events] = await Promise.all([
    allVipBookings(),
    allVipLeads(),
    getEvents(),
  ]);

  const evCount = (t: AnalyticsEvent["type"], since?: (e: AnalyticsEvent) => boolean) =>
    events.filter((e) => e.type === t && (!since || since(e))).length;

  // موضوع‌های پرتکرار سوال‌های آوا (از meta رویداد ava_q)
  const topicMap = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "ava_q" || !e.meta) continue;
    const t = e.meta;
    topicMap.set(t, (topicMap.get(t) ?? 0) + 1);
  }
  const topTopics = [...topicMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  const bySpec = SPECS.map((s, i) => ({
    name: s.name,
    emoji: s.emoji,
    count: bookings.filter((b) => b.specIdx === i).length,
  })).sort((a, b) => b.count - a.count);

  const byDoctor = VIP_DOCTORS.map((d) => ({
    name: d.name,
    count: bookings.filter((b) => b.doctorIdx === VIP_DOCTORS.indexOf(d)).length,
  }))
    .sort((a, b) => b.count - a.count)
    .filter((d) => d.count > 0);

  return {
    generatedAt: whenFa(Date.now()),
    dateLabel: todayFaLabel(),
    storage: storageMode(),
    ai: aiAvailable(),
    totals: {
      bookings: bookings.length,
      leads: leads.length,
      todayBookings: bookings.filter((b) => isToday(b.createdAt)).length,
      weekBookings: bookings.filter((b) => isThisWeek(b.createdAt)).length,
      avaQuestions: evCount("ava_q"),
      llmAnswers: evCount("llm"),
      voices: evCount("voice"),
      reminders: evCount("reminder"),
      calls: evCount("call"),
      confirms: evCount("confirm"),
    },
    bySpec,
    byDoctor,
    topTopics,
    recentBookings: bookings
      .slice(-5)
      .reverse()
      .map((b) => ({
        id: b.id,
        userName: b.userName,
        spec: SPECS[b.specIdx]?.name ?? "",
        doctor: VIP_DOCTORS[b.doctorIdx]?.name ?? "",
        when: whenFa(b.createdAt),
      })),
    recentLeads: leads
      .slice(-5)
      .reverse()
      .map((l) => ({
        id: l.id,
        userName: l.userName,
        phone: l.phone,
        topic: l.topic,
        when: whenFa(l.createdAt),
      })),
  };
}

/** کارت گزارش متنی برای تلگرام (parse_mode=HTML) */
export function reportText(r: ReportData): string {
  const bar = (n: number, max: number) => {
    if (max <= 0) return "";
    const filled = Math.max(n > 0 ? 1 : 0, Math.round((n / max) * 8));
    return "█".repeat(filled) + "░".repeat(8 - filled);
  };
  const maxSpec = Math.max(1, ...r.bySpec.map((s) => s.count));

  return (
    `📊 <b>گزارش عملکرد سامانه</b>\n🗓 ${r.dateLabel}\n\n` +
    `━━━ 📈 آمار کلی ━━━\n` +
    `🗓 نوبت امروز: <b>${fa(r.totals.todayBookings)}</b>  |  این هفته: <b>${fa(r.totals.weekBookings)}</b>\n` +
    `🧾 کل نوبت‌ها: <b>${fa(r.totals.bookings)}</b>\n` +
    `🎯 سرنخ مشاوره: <b>${fa(r.totals.leads)}</b>\n` +
    `🤖 سوال‌های آوا: <b>${fa(r.totals.avaQuestions)}</b>${r.ai ? ` (${fa(r.totals.llmAnswers)} با هوش مصنوعی)` : ""}\n` +
    `🎤 وویس: <b>${fa(r.totals.voices)}</b>  |  ⏰ یادآوری: <b>${fa(r.totals.reminders)}</b>  |  📞 تماس: <b>${fa(r.totals.calls)}</b>\n` +
    `✅ نوبت تأییدشده توسط بیمار: <b>${fa(r.totals.confirms)}</b>\n\n` +
    `━━━ 🏥 نوبت به تفکیک تخصص ━━━\n` +
    r.bySpec.map((s) => `${s.emoji} ${s.name}: ${bar(s.count, maxSpec)} <b>${fa(s.count)}</b>`).join("\n") +
    `\n\n━━━ 🩺 پرکارترین پزشکان ━━━\n` +
    (r.byDoctor.length
      ? r.byDoctor.map((d, i) => `${fa(i + 1)}. ${d.name}: <b>${fa(d.count)}</b> نوبت`).join("\n")
      : "هنوز نوبتی ثبت نشده") +
    `\n\n━━━ 🔥 داغ‌ترین سوال‌های بیماران ━━━\n` +
    (r.topTopics.length
      ? r.topTopics.map((t, i) => `${fa(i + 1)}. ${t.topic} — ${fa(t.count)} بار`).join("\n")
      : "هنوز سوالی ثبت نشده") +
    `\n\n━━━ 🧾 آخرین نوبت‌ها ━━━\n` +
    (r.recentBookings.length
      ? r.recentBookings
          .map((b) => `• ${b.userName} — ${b.spec} (${b.doctor}) — ${b.when}`)
          .join("\n")
      : "—") +
    `\n\n━━━ 🎯 آخرین سرنخ‌ها ━━━\n` +
    (r.recentLeads.length
      ? r.recentLeads
          .map((l) => `• ${l.userName} — <code>${l.phone}</code> — ${l.topic}`)
          .join("\n")
      : "—") +
    `\n\n⚙️ <i>ذخیره‌سازی: ${r.storage === "redis" ? "ماندگار (Redis) ✅" : "موقت (حافظه) — برای ماندگاری Upstash را وصل کنید ⚠️"} | هوش مصنوعی: ${r.ai ? "فعال 🤖" : "موتور داخلی"}</i>`
  );
}

/** ثبت رویداد سوال آوا با موضوع استخراج‌شده از موتور داخلی */
export function topicFromMeta(meta?: { topic?: string }): string {
  return meta?.topic ?? "سایر";
}

export { logEvent, safeParse };
