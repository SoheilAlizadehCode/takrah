// تأیید عضویت کانال با کدی که ربات @TakrahTop_support_bot بعد از /start dlv_<nonce> می‌فرستد.
// کد = "<nonce>.<tgId>.<امضای HMAC>" — امضا سرور-ساید چک می‌شود و بعد عضویت هم دوباره
// مستقیم از تلگرام پرسیده می‌شود (دو لایه).
import { NextRequest, NextResponse } from "next/server";
import {
  STUDENT_COOKIE,
  channelMembership,
  cookieOptions,
  parseSession,
  parseVerifyCode,
  signSession,
  type StudentSession,
} from "@/lib/student-gate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { nonce?: string; code?: string } | null;
  const nonce = (body?.nonce ?? "").trim();
  if (!/^[a-f0-9]{8,32}$/.test(nonce)) {
    return NextResponse.json({ ok: false, reason: "bad_nonce" }, { status: 400 });
  }

  const tgId = parseVerifyCode(body?.code ?? "", nonce);
  if (!tgId) {
    return NextResponse.json(
      { ok: false, reason: "bad_code", message: "کد درست نیست! از پیام ربات دوباره کپی کن." },
      { status: 401 },
    );
  }

  const membership = await channelMembership(tgId);
  if (membership === "unknown") {
    return NextResponse.json(
      { ok: false, reason: "telegram_error", message: "الان نمی‌توانم عضویت را چک کنم؛ چند لحظه بعد دوباره بزن." },
      { status: 502 },
    );
  }
  if (membership === "not_member") {
    return NextResponse.json(
      { ok: false, reason: "not_member", message: "هنوز عضو کانال نشده‌ای! اول عضو شو بعد دوباره از ربات کد بگیر." },
      { status: 403 },
    );
  }

  const prev = parseSession(req.cookies.get(STUDENT_COOKIE)?.value);
  const session: StudentSession = {
    email: prev?.email,
    name: prev?.name,
    picture: prev?.picture,
    guest: prev?.guest,
    tgId,
    tgName: prev?.tgName,
    verified: true,
    verifiedAt: Date.now(),
    ts: prev?.ts ?? Date.now(),
  };

  const out = NextResponse.json({ ok: true, step: 3 });
  out.cookies.set(STUDENT_COOKIE, signSession(session), cookieOptions(req.nextUrl.protocol === "https:"));
  return out;
}
