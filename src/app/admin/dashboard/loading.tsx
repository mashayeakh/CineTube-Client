import { Spinner } from "@/components/ui/spinner";

export default function AdminDashboardLoading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                <Spinner className="size-4" />
                Loading dashboard...
            </div>
        </div>
    );
}
