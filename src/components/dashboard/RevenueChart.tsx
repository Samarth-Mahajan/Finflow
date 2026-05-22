"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartData = [
  { month: "Jan", revenue: 72000, expenses: 38000 },
  { month: "Feb", revenue: 85000, expenses: 42000 },
  { month: "Mar", revenue: 78000, expenses: 45000 },
  { month: "Apr", revenue: 92000, expenses: 41000 },
  { month: "May", revenue: 105000, expenses: 44000 },
  { month: "Jun", revenue: 124500, expenses: 45230 },
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-finflow-border bg-finflow-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-finflow-muted">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function RevenueChart() {
  return (
    <div className="rounded-2xl border border-finflow-border bg-finflow-card p-6 shadow-[var(--finflow-shadow)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-finflow-text">
          Revenue vs Expenses
        </h2>
        <div className="flex items-center gap-5 text-xs text-finflow-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-finflow-teal" />
            Rev
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-finflow-red" />
            Exp
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
              }
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#2dd4bf"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
