import { Spinner } from "@/components/ui/spinner";

export default function AdminSubscriptionManagementLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <Spinner className="size-5" />
                <p className="text-sm text-slate-600">Loading subscription management...</p>
            </div>
        </div>
    );
}
