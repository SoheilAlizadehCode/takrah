import type { Metadata } from "next";
import { AboutPage } from "@/components/blog/static-pages";

export const metadata: Metadata = {
  title: "درباره تک‌راه",
  description:
    "داستان شکل‌گیری تک‌راه، مأموریت ما برای آموزش رایگان تکنولوژی به زبان فارسی و اصول تحریریه.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return <AboutPage />;
}
