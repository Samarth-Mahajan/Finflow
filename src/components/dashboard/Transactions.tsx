import {
  Building2,
  Cloud,
  Package,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type TransactionStatus = "Complete" | "Pending";

interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: string;
  amountPositive: boolean;
  status: TransactionStatus;
  icon: LucideIcon;
}

const transactions: Transaction[] = [
  {
    id: "1",
    name: "Acme Corp",
    date: "Mar 14, 2:15 PM",
    amount: "+$2,910.00",
    amountPositive: true,
    status: "Complete",
    icon: Building2,
  },
  {
    id: "2",
    name: "AWS Hosting",
    date: "Mar 14, 9:00 AM",
    amount: "-$1,240.50",
    amountPositive: false,
    status: "Complete",
    icon: Cloud,
  },
  {
    id: "3",
    name: "Tech Supplies GmbH",
    date: "Mar 13, 4:45 PM",
    amount: "+$4,500.00",
    amountPositive: true,
    status: "Pending",
    icon: Package,
  },
  {
    id: "4",
    name: "Office Depot EU",
    date: "Mar 13, 11:20 AM",
    amount: "-$89.99",
    amountPositive: false,
    status: "Complete",
    icon: ShoppingBag,
  },
  {
    id: "5",
    name: "Stripe Payout",
    date: "Mar 12, 8:00 PM",
    amount: "+$12,450.00",
    amountPositive: true,
    status: "Complete",
    icon: CreditCard,
  },
];

const statusStyles: Record<TransactionStatus, string> = {
  Complete: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Pending: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

export function Transactions() {
  return (
    <div className="flex h-full min-h-[380px] flex-col rounded-2xl border border-finflow-border bg-finflow-card shadow-[var(--finflow-shadow)]">
      <div className="flex items-center justify-between border-b border-finflow-border px-6 py-5">
        <h2 className="text-base font-semibold text-finflow-text">
          Recent Transactions
        </h2>
        <button
          type="button"
          className="text-xs font-medium text-finflow-teal transition-colors hover:text-finflow-teal-muted"
        >
          View All
        </button>
      </div>

      <ul className="finflow-scrollbar flex-1 space-y-0 overflow-y-auto px-4 py-2">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center gap-3 rounded-xl px-2 py-3.5 transition-colors hover:bg-finflow-card-elevated/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-finflow-border bg-finflow-card-elevated">
              <tx.icon className="h-[18px] w-[18px] text-finflow-muted" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-finflow-text">
                {tx.name}
              </p>
              <p className="text-xs text-finflow-muted">{tx.date}</p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "text-sm font-semibold",
                  tx.amountPositive ? "text-finflow-teal" : "text-finflow-text"
                )}
              >
                {tx.amount}
              </p>
              <span
                className={cn(
                  "mt-1 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium",
                  statusStyles[tx.status]
                )}
              >
                {tx.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
