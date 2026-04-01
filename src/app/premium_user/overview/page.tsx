import { PremiumPageShell } from "@/components/premium/premium-page-shell";

export default function PremiumOverviewPage() {
    return (
        <PremiumPageShell
            activePath="/premium_user/overview"
            title="Overview"
        // subtitle="High-level summary of your activity"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Label</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">Overview</p>
            </section>
        </PremiumPageShell>
    );
}