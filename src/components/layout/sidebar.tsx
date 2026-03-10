"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, HeartPulse, Pill, LineChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  HeartPulse,
  Pill,
  LineChart,
  Settings,
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" as const },
  { label: "Readings", href: "/readings", icon: "HeartPulse" as const },
  { label: "Medications", href: "/medications", icon: "Pill" as const },
  { label: "Charts", href: "/charts", icon: "LineChart" as const },
  { label: "Settings", href: "/settings", icon: "Settings" as const },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-sidebar h-screen sticky top-0">
      <div className="flex h-14 items-center border-b px-4">
        <HeartPulse className="h-5 w-5 text-red-500 mr-2" />
        <span className="font-semibold">BP Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
