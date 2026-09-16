import type { Metadata } from "next";
import { ContactPage } from "@/components/blog/contact-page";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "راه‌های ارتباط با تحریریه تک‌راه؛ سؤال، پیشنهاد موضوع یا گزارش خطا در محتوا را از همین صفحه برای ما بفرستید.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return <ContactPage />;
}
