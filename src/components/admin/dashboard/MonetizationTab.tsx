import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/states/empty-state";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

interface PaymentItem {
  id: string;
  email: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

interface MonetizationTabProps {
  payments: PaymentItem[];
  totalRevenue: number;
  paidPaymentsCount: number;
  activeSubscriptions: number;
  formatNumber: (v: number) => string;
  formatCurrency: (v: number) => string;
  getStatusVariant: (status: string) => any;
}

export function MonetizationTab({
  payments,
  totalRevenue,
  paidPaymentsCount,
  activeSubscriptions,
  formatNumber,
  formatCurrency,
  getStatusVariant,
}: MonetizationTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden relative group">
           <div className="absolute -right-4 -bottom-4 bg-emerald-50 size-24 rounded-full transition-all group-hover:scale-150 group-hover:bg-emerald-100/50" />
           <div className="relative z-10">
                <div className="flex items-center gap-2 text-emerald-600 mb-4">
                    <DollarSign className="size-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Revenue Snapshot</span>
                </div>
                <p className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(totalRevenue)}</p>
                <div className="mt-6 flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {formatNumber(paidPaymentsCount)} Paid Transactions
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-blue-500" />
                        {formatNumber(activeSubscriptions)} Active Subs
                    </span>
                </div>
           </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Subscription Health</h3>
                <TrendingUp className="size-5 text-blue-500" />
           </div>
           <div className="mt-4 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[65%]" />
           </div>
           <p className="mt-4 text-sm text-slate-500 font-medium">
             Current retention rate is <span className="text-blue-600 font-bold">65%</span>. Active subscriptions have grown by 4.2% since last month.
           </p>
        </article>
      </section>

      {/* Recent Payments Table */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs">RECORDS: {payments.length}</Badge>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500">
                <th className="py-4 pl-6 pr-4 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                <th className="py-4 pr-4 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                <th className="py-4 pr-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-4 pr-4 font-bold uppercase tracking-wider text-[10px]">Method</th>
                <th className="py-4 pr-6 font-bold uppercase tracking-wider text-[10px]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td className="py-12 px-6" colSpan={5}>
                    <EmptyState
                      icon={CreditCard}
                      title="No transactions recorded"
                      description="Transaction history will appear here once users start purchasing premium content."
                    />
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-6 pr-4 font-bold text-slate-800">
                      {payment.email}
                    </td>
                    <td className="py-4 pr-4 font-mono font-bold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={getStatusVariant(payment.status)} className="shadow-sm">
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4 text-xs font-medium text-slate-500">
                      {payment.method}
                    </td>
                    <td className="py-4 pr-6 text-xs text-slate-400">
                      {payment.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
