import type { Metadata } from "next";
import { PackagesView } from "@/components/blog/packages-view";

export const metadata: Metadata = {
  title: "منشی و دستیار هوشمند مطب — پلن‌ها و دموی زنده | تک‌راه",
  description:
    "وب‌سایت مطب، نوبت‌دهی آنلاین با کد QR، منشی شبانهٔ هوش مصنوعی «آوا» و دستیار پزشک با خلاصهٔ صوتی بیمار. انتخاب مطب خصوصی یا کلینیک، ۳ پلن (سایت / سایت+نوبت‌دهی / کامل+آوا) × دورهٔ ۶ ماهه و یکساله — پرداخت و فعال‌سازی خودکار.",
  alternates: { canonical: "/packages" },
};

export default function Packages() {
  return <PackagesView />;
}
