import { UserPageShell } from "@/components/user/user-page-shell";
import { getUserInfo } from "@/service/auth.services";
import { getUserDashboardSubscriptions } from "@/service/user-dashboard.services";
import { getGenres } from "@/app/(public)/public/_actions/genres";
import { getStreamingPlatforms } from "@/app/(public)/public/_actions/platforms";
import { ContributionForm } from "./_components/ContributionForm";

function hasActiveSubscription(source: unknown) {
    if (Array.isArray(source)) {
        return source.some(hasActiveSubscription);
    }

    if (typeof source === "object" && source !== null) {
        const record = source as Record<string, unknown>;
        const status = typeof record.status === "string" ? record.status.toLowerCase() : "";

        if (status.includes("active")) {
            return true;
        }

        return Object.values(record).some(hasActiveSubscription);
    }

    return false;
}

export default async function UserContributionsPage() {
    let currentUser = null;
    try {
        currentUser = await getUserInfo();
    } catch {
        currentUser = null;
    }

    const role = typeof currentUser?.role === "string" ? currentUser.role.toUpperCase() : "";

    const [rawGenres, rawPlatforms, subscriptionsResult] = await Promise.all([
        getGenres().catch(() => []),
        getStreamingPlatforms().catch(() => []),
        getUserDashboardSubscriptions().catch(() => ({ data: [] })),
    ]);

    const hasActiveSub = hasActiveSubscription(subscriptionsResult);
    const isPremium = role === "PREMIUM_USER" || role === "ADMIN" || hasActiveSub;

    type Item = { id: string; name: string };
    const genres: Item[] = (rawGenres as unknown[])
        .filter((g): g is Item => typeof g === "object" && g !== null && "id" in g && "name" in g);
    const platforms: Item[] = (rawPlatforms as unknown[])
        .filter((p): p is Item => typeof p === "object" && p !== null && "id" in p && "name" in p);

    const userId = currentUser?.id ?? "";

    return (
        <UserPageShell
            activePath="/user/contributions"
            title="Movie Contribution"
        // subtitle="Submit a movie to be reviewed and added to CineTube"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-base font-semibold text-slate-900">Contribute a Movie</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Fill in the details below. Our team will review your submission.
                    </p>
                </div>

                <ContributionForm userId={userId as string} genres={genres} platforms={platforms} isPremium={isPremium} />
            </section>
        </UserPageShell>
    );
}


