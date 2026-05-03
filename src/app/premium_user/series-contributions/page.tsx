export const dynamic = 'force-dynamic';

import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import { getGenres } from "@/app/(public)/public/_actions/genres";
import { getStreamingPlatforms } from "@/app/(public)/public/_actions/platforms";
import { getUserInfo } from "@/service/auth.services";
import { SeriesContributionForm } from "@/app/user/series-contributions/_components/SeriesContributionForm";

type Item = { id: string; name: string };

export default async function PremiumSeriesContributionsPage() {
    let currentUser = null;
    try {
        currentUser = await getUserInfo();
    } catch {
        currentUser = null;
    }

    const [rawGenres, rawPlatforms] = await Promise.all([
        getGenres().catch(() => []),
        getStreamingPlatforms().catch(() => []),
    ]);

    const genres: Item[] = (rawGenres as unknown[])
        .filter((genre): genre is Item => typeof genre === "object" && genre !== null && "id" in genre && "name" in genre);
    const platforms: Item[] = (rawPlatforms as unknown[])
        .filter((platform): platform is Item => typeof platform === "object" && platform !== null && "id" in platform && "name" in platform);

    const userId = typeof currentUser?.id === "string" ? currentUser.id : "";

    return (
        <PremiumPageShell activePath="/premium_user/series-contributions" title="Series Contribution">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-base font-semibold text-slate-900">Contribute a Series</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Fill in the details below. Our team will review your submission.
                    </p>
                </div>

                <SeriesContributionForm
                    userId={userId}
                    genres={genres}
                    platforms={platforms}
                    isPremium={true}
                />
            </section>
        </PremiumPageShell>
    );
}
