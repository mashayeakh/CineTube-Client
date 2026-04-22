import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import {
    getPrimitiveEntries,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardStats } from "@/service/user-dashboard.services";

function formatLabel(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function PremiumUserDashboardPage() {
    let statsData: unknown = null;

    try {
        const response = await getUserDashboardStats();
        statsData = response.data;
    } catch {
        statsData = null;
    }

    const stats = getPrimitiveEntries(statsData).slice(0, 8);

    return (
        <></>
        // <PremiumPageShell
        //     activePath="/premium_user/dashboard"
        //     title="Dashboard"
        // // subtitle="Stats from GET /api/v1/user/dashboard/stats"
        // >
        //     {stats.length > 0 ? (
        //         <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        //             {stats.map((item) => (
        //                 <article key={item.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        //                     <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{formatLabel(item.key)}</p>
        //                     <p className="mt-2 text-2xl font-semibold text-slate-900">{parseString(item.value)}</p>
        //                 </article>
        //             ))}
        //         </section>
        //     ) : (
        //         <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        //             <p className="text-sm text-slate-500">No dashboard stats available right now.</p>
        //         </section>
        //     )}
        // </PremiumPageShell>
    );
}