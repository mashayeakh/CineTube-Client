import { CatalogPageShell } from "@/components/catalog-page-shell";

export default function TopRatedMoviesPage() {
    return (
        <CatalogPageShell
            eyebrow="Movies"
            title="Top Rated Movies"
            description="A curated destination for standout films with the strongest audience and critic response. This page is ready as a navigation target while you connect a dedicated top-rated backend feed."
            highlights={[
                "Surface highest-rated releases across genres.",
                "Use this route for future score-based filtering.",
                "Keep navigation stable while the data feed evolves.",
            ]}
            primaryHref="/popular"
            primaryLabel="Browse Popular Movies"
            secondaryHref="/"
            secondaryLabel="Back to Home"
        />
    );
}