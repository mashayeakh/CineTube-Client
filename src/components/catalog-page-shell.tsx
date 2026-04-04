import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CatalogPageShellProps = {
    eyebrow: string;
    title: string;
    description: string;
    highlights: string[];
    primaryHref: string;
    primaryLabel: string;
    secondaryHref?: string;
    secondaryLabel?: string;
};

function CatalogPageShell({
    eyebrow,
    title,
    description,
    highlights,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
}: CatalogPageShellProps) {
    return (
        <main className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-12">
                    <div className="max-w-3xl space-y-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">{eyebrow}</p>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
                            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={primaryHref}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                {primaryLabel}
                                <ArrowRight className="size-4" />
                            </Link>
                            {secondaryHref && secondaryLabel ? (
                                <Link
                                    href={secondaryHref}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    {secondaryLabel}
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {highlights.map((item) => (
                            <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                                <p className="text-sm font-medium text-slate-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

export { CatalogPageShell };