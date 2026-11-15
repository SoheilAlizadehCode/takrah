import type { Metadata } from "next";
import { PackagesView } from "@/components/blog/packages-view";

export const metadata: Metadata = {
  title: "منشی و دستیار هوشمند مطب — پلن‌ها و دموی زنده | تک‌راه",
  description:
    "یک اشتراک، همه‌چیز: نوبت‌دهی آنلاین با کد QR، منشی شبانهٔ هوش مصنوعی «آوا» و دستیار پزشک با خلاصهٔ صوتی بیمار. سه پلن (آزمایشی/پایه/حرفه‌ای) × دورهٔ ۶ ماهه و یکساله — ۱۴ روز رایگان، بدون کارت بانکی، فعال‌سازی خودکار.",
  alternates: { canonical: "/packages" },
};

export default function Packages() {
  return <PackagesView />;
}
