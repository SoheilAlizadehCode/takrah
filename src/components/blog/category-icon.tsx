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
