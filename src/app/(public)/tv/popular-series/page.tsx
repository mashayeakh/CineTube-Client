import { CatalogPageShell } from "@/components/catalog-page-shell";

export default function PopularSeriesPage() {
    return (
        <CatalogPageShell
            eyebrow="TV Shows"
            title="Popular Series"
            description="A dedicated destination for binge-worthy series, trending seasons, and shows your viewers are most likely to watch next."
            highlights={[
                "Use this route for trending multi-season series.",
                "Ideal for future TV-specific filters and genres.",
                "Keeps movie and TV navigation clearly separated.",
            ]}
            primaryHref="/"
            primaryLabel="Explore Home"
            secondaryHref="/tv/on-tv"
            secondaryLabel="See On TV"
        />
    );
}