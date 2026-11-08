// ─── بررسی آزاد بودن آدرس (slug) هنگام ثبت‌نام ───
import { slugFree } from "@/lib/tenants";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const slug = (new URL(req.url).searchParams.get("slug") ?? "").trim().toLowerCase();
  if (!slug) return Response.json({ ok: false, available: false, err: "خالی است" });
  const available = await slugFree(slug);
  return Response.json({ ok: true, available });
}
