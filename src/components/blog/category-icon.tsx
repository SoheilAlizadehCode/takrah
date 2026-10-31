import {
  BrainCircuit,
  Smartphone,
  ShieldCheck,
  AppWindow,
  Globe,
  Code2,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  ai: BrainCircuit,
  mobile: Smartphone,
  security: ShieldCheck,
  software: AppWindow,
  "web-tools": Globe,
  programming: Code2,
  student: GraduationCap,
};

/**
 * رنگ اختصاصی آیکون هر دسته — برای نوار ناوبری واضح‌تر و خواناتر.
 * هم در هدر فارسی و هم هدر انگلیسی استفاده می‌شود تا دو نسخه یکدست باشند.
 */
export const CATEGORY_ICON_COLORS: Record<string, string> = {
  ai: "text-violet-600 dark:text-violet-400",
  mobile: "text-sky-600 dark:text-sky-400",
  security: "text-emerald-600 dark:text-emerald-400",
  software: "text-amber-600 dark:text-amber-400",
  "web-tools": "text-cyan-600 dark:text-cyan-400",
  programming: "text-rose-600 dark:text-rose-400",
  student: "text-indigo-600 dark:text-indigo-400",
};

export function CategoryIcon({
  id,
  className = "h-4 w-4",
}: {
  id: string;
  className?: string;
}) {
  const Icon = icons[id] ?? Globe;
  return <Icon className={className} aria-hidden="true" />;
}
