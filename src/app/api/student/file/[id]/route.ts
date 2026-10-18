// سرو امن فایل‌های دانلودی — فایل‌ها خارج از public هستند و بدون کوکی تأییدشدهٔ
// گیت (ورود + عضویت کانال + تبلیغ) هیچ‌کس به آن‌ها دسترسی ندارد.
import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { STUDENT_COOKIE, parseSession } from "@/lib/student-gate";
import { getStudentDownload } from "@/lib/student-downloads";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const session = parseSession(req.cookies.get(STUDENT_COOKIE)?.value);
  if (!session?.verified) {
    return new Response("forbidden — از صفحه دانلود وارد شو", { status: 403 });
  }

  const item = getStudentDownload(id);
  if (!item) {
    return new Response("not found", { status: 404 });
  }

  // نام فایل از کاتالوگ می‌آید (نه ورودی کاربر) — ریسک path traversal ندارد.
  const buf = await fs
    .readFile(path.join(process.cwd(), "private-downloads", item.file))
    .catch(() => null);
  if (!buf) {
    return new Response("file unavailable", { status: 404 });
  }

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buf.length),
      "Content-Disposition": `attachment; filename="${item.downloadName}"; filename*=UTF-8''${encodeURIComponent(item.downloadName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
