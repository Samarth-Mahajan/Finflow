"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ArrowLeftRight,
  TrendingUp,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { name: "Cash Flow", href: "/dashboard/cash-flow", icon: TrendingUp },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-finflow-border bg-finflow-sidebar">
      <div className="px-6 pt-7 pb-8">
        <Link href="/dashboard" className="block">
          <span className="text-xl font-bold tracking-tight text-finflow-text">
            FinFlow
          </span>
          <span className="mt-0.5 block text-xs font-medium text-finflow-teal">
            Wealth Command
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {mainNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-finflow-active text-finflow-text"
                  : "text-finflow-muted hover:bg-finflow-card hover:text-finflow-text"
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-finflow-purple-light"
                  aria-hidden
                />
              )}
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-finflow-teal" : "text-finflow-muted group-hover:text-finflow-text"
                )}
                aria-hidden
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 px-3 pb-4">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/dashboard/settings" ||
              pathname.startsWith("/dashboard/settings/")
              ? "bg-finflow-active text-finflow-text"
              : "text-finflow-muted hover:bg-finflow-card hover:text-finflow-text"
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" aria-hidden />
          Settings
        </Link>

        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-finflow-purple to-indigo-500 px-4 py-3 text-xs font-bold tracking-wider text-white shadow-lg shadow-finflow-purple/25 transition-opacity hover:opacity-90"
        >
          UPGRADE PRO
        </button>
      </div>
    </aside>
  );
}
