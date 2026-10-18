import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DownloadGate } from "@/components/blog/student/download-gate";
import { STUDENT_COOKIE, parseSession } from "@/lib/student-gate";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "دانلود فایل‌های آموزشی دانش‌آموزی | تک‌راه",
  description:
    "دانلود رایگان PDF کتاب‌های درسی رشته شبکه و نرم‌افزار رایانه (پایه دوازدهم) + جزوه‌ها و ابزارهای کمکی؛ کافی است با گوگل وارد شوی، عضویت کانال تک‌راه را تأیید کنی و یک تبلیغ کوتاه ببینی.",
  alternates: {
    canonical: "/student/download",
  },
  openGraph: {
    type: "website",
    title: "دانلود فایل‌های آموزشی دانش‌آموزی تک‌راه",
    description:
      "PDF کتاب‌های درسی + جزوه‌ها و ابزارهای کمکی — رایگان برای اعضای کانال تک‌راه.",
    url: `${siteConfig.url}/student/download`,
    siteName: siteConfig.name,
    locale: "fa_IR",
  },
};

export default async function StudentDownloadPage() {
  const store = await cookies();
  const session = parseSession(store.get(STUDENT_COOKIE)?.value);

  return (
    <DownloadGate
      googleClientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
      initialStep={session?.verified ? 3 : 1}
      initialUser={{
        name: session?.name ?? "",
        email: session?.email ?? "",
        picture: session?.picture ?? "",
        guest: session?.guest ?? false,
      }}
    />
  );
}
