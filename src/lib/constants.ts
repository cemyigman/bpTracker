import { BPCategory } from "./types";

export function getBPCategory(systolic: number, diastolic: number): BPCategory {
  if (systolic >= 180 || diastolic >= 120) return "crisis";
  if (systolic >= 140 || diastolic >= 90) return "high_stage2";
  if (systolic >= 130 || diastolic >= 80) return "high_stage1";
  if (systolic >= 120 && diastolic < 80) return "elevated";
  return "normal";
}

export const BP_CATEGORY_CONFIG: Record<
  BPCategory,
  { label: string; color: string; bgClass: string; dotClass: string }
> = {
  normal: {
    label: "Normal",
    color: "#22c55e",
    bgClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotClass: "bg-green-500",
  },
  elevated: {
    label: "Elevated",
    color: "#eab308",
    bgClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    dotClass: "bg-yellow-500",
  },
  high_stage1: {
    label: "High - Stage 1",
    color: "#f97316",
    bgClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    dotClass: "bg-orange-500",
  },
  high_stage2: {
    label: "High - Stage 2",
    color: "#ef4444",
    bgClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dotClass: "bg-red-500",
  },
  crisis: {
    label: "Hypertensive Crisis",
    color: "#a855f7",
    bgClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    dotClass: "bg-purple-500",
  },
};

export const SYSTOLIC_COLOR = "#ef4444";
export const DIASTOLIC_COLOR = "#3b82f6";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" as const },
  { label: "Readings", href: "/readings", icon: "HeartPulse" as const },
  { label: "Medications", href: "/medications", icon: "Pill" as const },
  { label: "Charts", href: "/charts", icon: "LineChart" as const },
  { label: "Settings", href: "/settings", icon: "Settings" as const },
];
