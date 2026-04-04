import { CatalogPageShell } from "@/components/catalog-page-shell";

export default function OnTvPage() {
    return (
        <CatalogPageShell
            eyebrow="TV Shows"
            title="On TV"
            description="A clean landing page for shows that are currently airing, recently released, or actively drawing weekly attention."
            highlights={[
                "Reserve this route for airing-now schedules.",
                "Good fit for episode release and channel metadata.",
                "Keeps the new TV dropdown fully navigable today.",
            ]}
            primaryHref="/tv/popular-series"
            primaryLabel="Browse Popular Series"
            secondaryHref="/"
            secondaryLabel="Back to Home"
        />
    );
}