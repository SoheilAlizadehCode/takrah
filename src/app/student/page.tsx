import type { Metadata } from "next";
import { StudentHomeView } from "@/components/blog/student-views";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "کتابخانه دانش‌آموزی تک‌راه | مقاله‌های کتاب‌های درسی شبکه و نرم‌افزار",
  description:
    "مجموعه مقاله‌های آموزشی کتاب‌های درسی رشته شبکه و نرم‌افزار رایانه پایه دوازدهم؛ پودمان‌به‌پودمان، ساده و جذاب، همراه با نکات کارگاهی و چک‌لیست ارزشیابی برای دانش‌آموزان فنی و حرفه‌ای.",
  alternates: {
    canonical: "/student",
  },
  openGraph: {
    type: "website",
    title: "کتابخانه دانش‌آموزی تک‌راه",
    description:
      "پودمان‌به‌پودمانِ کتاب‌های درسی شبکه و نرم‌افزار رایانه، به زبان ساده و با نکات امتحانی.",
    url: `${siteConfig.url}/student`,
    siteName: siteConfig.name,
    locale: "fa_IR",
  },
};

export default function StudentHomePage() {
  return <StudentHomeView />;
}
