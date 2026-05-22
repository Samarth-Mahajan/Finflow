import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type TrendVariant = "positive" | "negative" | "neutral" | "teal";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendVariant?: TrendVariant;
  subtext?: string;
  icon?: LucideIcon;
  className?: string;
}

const trendStyles: Record<TrendVariant, string> = {
  positive: "bg-emerald-500/15 text-emerald-400",
  negative: "bg-rose-500/15 text-rose-400",
  neutral: "bg-slate-500/15 text-finflow-muted",
  teal: "bg-teal-500/15 text-finflow-teal",
};

export function StatCard({
  label,
  value,
  trend,
  trendVariant = "neutral",
  subtext,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-finflow-border bg-finflow-card p-5 shadow-[var(--finflow-shadow)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-finflow-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-finflow-text">
            {value}
          </p>
          {(trend || subtext) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                    trendStyles[trendVariant]
                  )}
                >
                  {trend}
                </span>
              )}
              {subtext && (
                <span className="text-xs text-finflow-muted">{subtext}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-finflow-border bg-finflow-card-elevated">
            <Icon className="h-5 w-5 text-finflow-muted" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
