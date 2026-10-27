// باز کردن لینک‌های دانلود بعد از پایان تبلیغ.
// سمت سرور چک می‌کنیم: سشن تأییدشده + هنوز عضو کانال + حداقل زمان سپری‌شده
// (تقریباً برابر مدت تبلیغ) — یعنی تبلیغ واقعاً بخشی از قیف است، نه فقط دکوری.
import { NextRequest, NextResponse } from "next/server";
import {
  GATE_AD_SECONDS,
  STUDENT_COOKIE,
  channelMembership,
  cookieOptions,
  parseSession,
  signSession,
  type StudentSession,
} from "@/lib/student-gate";
import { publicFile, studentDownloads } from "@/lib/student-downloads";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = parseSession(req.cookies.get(STUDENT_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, reason: "no_session" }, { status: 401 });
  }
  if (!session.verified) {
    return NextResponse.json({ ok: false, reason: "not_verified" }, { status: 403 });
  }

  // عضویت هنوز برقرار است؟ اگر دانش‌آموز کانال را ترک کرده باشد، باید دوباره عضو شود.
  if (session.tgId) {
    const membership = await channelMembership(session.tgId);
    if (membership === "not_member") {
      const downgraded: StudentSession = { ...session, verified: false, verifiedAt: undefined };
      const out = NextResponse.json(
        { ok: false, reason: "not_member", backToStep: 2 },
        { status: 403 },
      );
      out.cookies.set(STUDENT_COOKIE, signSession(downgraded), cookieOptions(req.nextUrl.protocol === "https:"));
      return out;
    }
    // «unknown» را رد نمی‌کنیم تا قطعی لحظه‌ای تلگرام دانلود را نشکند.
  }

  // حداقل فاصله تأیید تا دانلود ≈ مدت تبلیغ (برگشت‌دهنده‌های جدید: از لود صفحه حساب می‌شود)
  const waitMs = GATE_AD_SECONDS * 1000 - 2500;
  const sinceVerify = Date.now() - (session.verifiedAt ?? 0);
  const sinceLoad = Date.now() - (Number(req.headers.get("x-gate-t0")) || 0);
  const waited = sinceVerify >= waitMs || sinceLoad >= waitMs;
  if (!waited) {
    const remaining = Math.max(1, Math.ceil((waitMs - Math.max(sinceVerify, sinceLoad)) / 1000));
    return NextResponse.json({ ok: false, reason: "wait", remaining }, { status: 425 });
  }

  return NextResponse.json({ ok: true, files: studentDownloads.map(publicFile) });
}
