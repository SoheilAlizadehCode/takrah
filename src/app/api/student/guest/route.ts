// ورود موقت مهمان — فقط تا وقتی Google OAuth تنظیم نشده (وقتی NEXT_PUBLIC_GOOGLE_CLIENT_ID
// در Vercel تنظیم شود، این مسیر ۴۰۳ می‌دهد و رابط کاربری هم دکمه مهمان را نشان نمی‌دهد).
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
  if (clientId) {
    return NextResponse.json({ ok: false, reason: "login_required" }, { status: 403 });
  }

  const prev = parseSession(req.cookies.get(STUDENT_COOKIE)?.value);
  const session: StudentSession = {
    guest: true,
    tgId: prev?.tgId,
    tgName: prev?.tgName,
    verified: prev?.verified,
    verifiedAt: prev?.verifiedAt,
    ts: prev?.ts ?? Date.now(),
  };

  const out = NextResponse.json({ ok: true });
  out.cookies.set(STUDENT_COOKIE, signSession(session), cookieOptions(req.nextUrl.protocol === "https:"));
  return out;
}
