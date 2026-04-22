import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatCurrency,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardPayments } from "@/service/user-dashboard.services";

export default async function UserPaymentHistoryPage() {
    let payload: unknown = null;

    try {
        const response = await getUserDashboardPayments();
        payload = response.data;
    } catch {
        payload = null;
    }

    const items = extractArray(payload, ["payments", "items", "results", "data"]);

    const rows = items.slice(0, 20).map((item) => {
        const amount = formatCurrency(findValue(item, ["amount", "price", "total"]));
        let method = parseString(findValue(item, ["method", "paymentMethod"])).trim();
        if (!method || method === "-" || method === "–" || method === "—") {
            method = "CARD";
        }
        const status = parseString(findValue(item, ["status"]));
        const transactionId = parseString(findValue(item, ["transactionId", "txnId", "id"]));
        const createdAt = formatDate(findValue(item, ["createdAt", "paidAt", "date"]));

        return [amount, method, status, transactionId, createdAt];
    });

    return (
        <UserPageShell
            activePath="/user/payment-history"
            title="Payment History"
        // subtitle="Data from GET /api/v1/user/dashboard/payments"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total payments</p>
                    <p className="text-lg font-semibold text-slate-900">{items.length}</p>
                </div>

                <UserDataTable
                    headers={["Amount", "Method", "Status", "Transaction", "Date"]}
                    rows={rows}
                    emptyMessage="No payment records found."
                />
            </section>
        </UserPageShell>
    );
}
