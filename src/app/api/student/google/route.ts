// ورود با گوگل برای گیت دانلود — اعتبارسنجی ID Token گوگل بدون کتابخانه اضافه.
// تنظیم: NEXT_PUBLIC_GOOGLE_CLIENT_ID در Vercel (فقط Client ID لازم است، نه Secret).
import { NextRequest, NextResponse } from "next/server";
import {
  STUDENT_COOKIE,
  cookieOptions,
  parseSession,
  signSession,
  type StudentSession,
} from "@/lib/student-gate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  if (!clientId) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 501 });
  }

  const body = (await req.json().catch(() => null)) as { credential?: string } | null;
  const credential = body?.credential;
  if (!credential) {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  // بررسی توکن با سرویس رسمی گوگل
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    { cache: "no-store", signal: AbortSignal.timeout(10000) },
  ).catch(() => null);
  if (!res?.ok) {
    return NextResponse.json({ ok: false, reason: "invalid_token" }, { status: 401 });
  }
  const info = (await res.json().catch(() => null)) as Record<string, string> | null;
  if (!info) {
    return NextResponse.json({ ok: false, reason: "invalid_token" }, { status: 401 });
  }
  if (info.aud !== clientId) {
    return NextResponse.json({ ok: false, reason: "wrong_audience" }, { status: 401 });
  }
  if (info.email_verified !== "true") {
    return NextResponse.json({ ok: false, reason: "email_unverified" }, { status: 401 });
  }
  if (!info.exp || Number(info.exp) * 1000 < Date.now()) {
    return NextResponse.json({ ok: false, reason: "expired" }, { status: 401 });
  }

  // ادغام با سشن قبلی (مثلاً اگر قبلاً عضویتش تأیید شده باشد)
  const prev = parseSession(req.cookies.get(STUDENT_COOKIE)?.value);
  const session: StudentSession = {
    email: info.email,
    name: info.name || "",
    picture: info.picture || "",
    guest: false,
    tgId: prev?.tgId,
    tgName: prev?.tgName,
    verified: prev?.verified,
    verifiedAt: prev?.verifiedAt,
    ts: prev?.ts ?? Date.now(),
  };

  const out = NextResponse.json({
    ok: true,
    name: session.name,
    email: session.email,
    picture: session.picture,
  });
  out.cookies.set(STUDENT_COOKIE, signSession(session), cookieOptions(req.nextUrl.protocol === "https:"));
  return out;
}
