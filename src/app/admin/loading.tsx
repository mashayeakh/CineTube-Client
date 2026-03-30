import { Spinner } from "@/components/ui/spinner";

export default function AdminRouteLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                <Spinner className="size-4" />
                Loading admin page...
            </div>
        </div>
    );
}
