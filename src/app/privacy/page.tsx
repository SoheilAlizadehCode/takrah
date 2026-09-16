import type { Metadata } from "next";
import { PrivacyPage } from "@/components/blog/static-pages";

export const metadata: Metadata = {
  title: "سیاست حفظ حریم خصوصی",
  description:
    "توضیح کامل درباره اطلاعاتی که تک‌راه جمع‌آوری می‌کند، کوکی‌ها، تبلیغات گوگل و نحوه محافظت از اطلاعات شما.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return <PrivacyPage />;
}
