import { FileText } from "lucide-react";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { Transactions } from "./Transactions";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value="$124,500.00"
          trend="+12.2%"
          trendVariant="positive"
          subtext="vs last month"
        />
        <StatCard
          label="Total Expenses"
          value="$45,230.00"
          trend="-2.4%"
          trendVariant="negative"
          subtext="vs last month"
        />
        <StatCard
          label="Net Cash Flow"
          value="$79,270.00"
          trend="+8.1%"
          trendVariant="teal"
          subtext="vs last month"
        />
        <StatCard
          label="Pending Invoices"
          value="12"
          subtext="$15,400.00 awaiting payment"
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <Transactions />
        </div>
      </div>
    </div>
  );
}
