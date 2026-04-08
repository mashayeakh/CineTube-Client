import { Skeleton } from "@/components/ui/skeleton";

export default function SeriesDetailLoading() {
    return (
        <div className="min-h-screen bg-linear-to-b from-[#030919] via-[#041335] to-[#020617] p-6 md:p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <Skeleton className="h-8 w-32 rounded-full bg-white/5" />
                <div className="flex flex-col gap-8 md:flex-row">
                    <Skeleton className="h-80 w-56 shrink-0 rounded-2xl bg-white/5" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-10 w-3/4 bg-white/5" />
                        <Skeleton className="h-4 w-1/2 bg-white/5" />
                        <Skeleton className="h-24 w-full bg-white/5" />
                        <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-7 w-20 rounded-full bg-white/5" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
