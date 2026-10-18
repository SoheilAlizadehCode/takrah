// ─── نسخه‌ی سامانه — اثبات اینکه همه‌چیز نسخه‌بندی و در گیت‌هاب ثبت است ───
export const dynamic = "force-dynamic";

const VERSION = "2.1.0";

export async function GET() {
  return Response.json({
    ok: true,
    version: VERSION,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "main",
    deployedAt: process.env.VERCEL_DEPLOYMENT_CREATED_AT
      ? new Date(Number(process.env.VERCEL_DEPLOYMENT_CREATED_AT) * 1000).toISOString()
      : new Date().toISOString(),
    features: [
      "smart-ava-llm",
      "ava-memory",
      "voice-in",
      "daily-director-report",
      "phone-call-reminder",
      "reminder-voice",
      "analytics",
    ],
  });
}
