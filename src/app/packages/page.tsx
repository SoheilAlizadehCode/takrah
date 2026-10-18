import type { Metadata } from "next";
import { PackagesView } from "@/components/blog/packages-view";

export const metadata: Metadata = {
  title: "پکیج‌های اتوماسیون کلینیک | تک‌راه",
  description:
    "سه پکیج اتوماسیون کلینیک از JSDevelop با دموی زنده و تعاملی: نوبت‌دهی آنلاین با تقویم شمسی، ربات تلگرام یادآوری، منشی هوش مصنوعی و اتوماسیون اینستاگرام.",
  alternates: { canonical: "/packages" },
};

export default function Packages() {
  return <PackagesView />;
}
