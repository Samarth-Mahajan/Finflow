import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, TrendingDown, TrendingUp, Receipt } from "lucide-react";

export default function DashboardPage() {
  // Placeholder data for the stat cards
  const stats = [
    {
      title: "Total Revenue",
      value: "€45,231.89",
      change: "+20.1% from last month",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Total Expenses",
      value: "€12,302.50",
      change: "-4.5% from last month",
      icon: TrendingDown,
      trend: "down",
    },
    {
      title: "Net Cash Flow",
      value: "€32,929.39",
      change: "+15.2% from last month",
      icon: Euro,
      trend: "up",
    },
    {
      title: "Pending Invoices",
      value: "14",
      change: "4 needing review",
      icon: Receipt,
      trend: "neutral",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back. Here is your financial overview.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stat.value}
              </div>
              <p
                className={`text-xs mt-1 ${
                  stat.trend === "up"
                    ? "text-emerald-600"
                    : stat.trend === "down"
                    ? "text-red-600"
                    : "text-slate-500"
                }`}
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for future Analytics / Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Chart component (Recharts) will be implemented here
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Transaction list will be implemented here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
