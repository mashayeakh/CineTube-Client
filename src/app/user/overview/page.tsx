import { UserPageShell } from "@/components/user/user-page-shell";

export default function UserOverviewPage() {
    return (
        <UserPageShell
            activePath="/user/overview"
            title="Overview"
            subtitle="High-level summary of your activity"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Label</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">Overview</p>
            </section>
        </UserPageShell>
    );
}
