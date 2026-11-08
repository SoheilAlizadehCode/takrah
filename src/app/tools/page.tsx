import type { Metadata } from "next";
import { ToolsDirectoryView } from "@/components/blog/tools-views";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "دایرهٔ ابزارهای هوش مصنوعی | قیمت، دسترسی در ایران و جایگزین‌ها | تک‌راه",
  description:
    "مرجع فارسی ابزارهای هوش مصنوعی با «پروفایل ایران»: قیمت رسمی دلاری با تاریخ بررسی، وضعیت دسترسی از ایران، راه پرداخت تومانی، جایگزین رایگان و حکم صریح تک‌راه برای هر ابزار.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    type: "website",
    title: "دایرهٔ ابزارهای هوش مصنوعی تک‌راه — با پروفایل ایران",
    description:
      "برای هر ابزار AI: قیمت دلاری رسمی، وضعیت دسترسی از ایران، راه پرداخت تومانی، جایگزین رایگان و حکم تک‌راه.",
    url: `${siteConfig.url}/tools`,
    siteName: siteConfig.name,
    locale: "fa_IR",
  },
};

export default function ToolsHomePage() {
  return <ToolsDirectoryView />;
}
