import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <Skeleton className="h-10 w-40 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-24 rounded-full bg-slate-200" />
                            <Skeleton className="h-10 w-24 rounded-full bg-slate-200" />
                            <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 p-8 shadow-sm sm:p-10">
                        <Skeleton className="h-5 w-28 rounded-full bg-slate-200" />
                        <Skeleton className="mt-5 h-14 w-full max-w-3xl rounded-2xl bg-slate-200" />
                        <Skeleton className="mt-4 h-5 w-full max-w-2xl rounded-full bg-slate-200" />
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Skeleton className="h-11 w-36 rounded-full bg-slate-200" />
                            <Skeleton className="h-11 w-32 rounded-full bg-slate-200" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-28 rounded-full bg-slate-200" />
                                <Skeleton className="h-8 w-56 rounded-full bg-slate-200" />
                            </div>
                            <Skeleton className="h-10 w-28 rounded-full bg-slate-200" />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={`loading-card-${index}`} className="space-y-3">
                                    <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-slate-200" />
                                    <Skeleton className="h-5 w-3/4 rounded-full bg-slate-200" />
                                    <Skeleton className="h-4 w-1/2 rounded-full bg-slate-200" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
                                <Skeleton className="h-8 w-44 rounded-full bg-slate-200" />
                            </div>
                            <Skeleton className="h-10 w-32 rounded-full bg-slate-200" />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={`loading-poster-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <Skeleton className="aspect-[3/4] w-full rounded-none bg-slate-200" />
                                    <div className="space-y-3 p-4">
                                        <Skeleton className="h-5 w-4/5 rounded-full bg-slate-200" />
                                        <Skeleton className="h-4 w-2/5 rounded-full bg-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
