import type { Metadata } from "next";
import { TermsPage } from "@/components/blog/static-pages";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description:
    "شرایط استفاده از وب‌سایت تک‌راه، مالکیت محتوا، محدودیت مسئولیت و قوانین حاکم.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return <TermsPage />;
}
