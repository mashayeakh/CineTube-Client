/* eslint-disable @next/next/no-img-element */
"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CalendarRange,
    Clapperboard,
    Film,
    FolderPlus,
    Search,
    Sparkles,
    Trash2,
} from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { resolveMediaUrl } from "@/lib/media";

type OptionItem = {
    id: string;
    name: string;
};

type MovieRow = {
    id: string;
    title: string;
    description: string;
    releaseYear: number;
    priceType: string;
    ageGroup: string;
    director: string;
    poster: string;
    cast: string[];
    genres: string[];
    platforms: string[];
};

type MovieViewClientProps = {
    movies: MovieRow[];
    genres: OptionItem[];
    platforms: OptionItem[];
    adminName: string;
    initialCreateOpen?: boolean;
    createMovieAction: (formData: FormData) => Promise<void>;
    updateMovieAction: (formData: FormData) => Promise<void>;
    deleteMovieAction: (formData: FormData) => Promise<void>;
    deleteAllMoviesAction: () => Promise<void>;
    actionError?: string;
    successMessage?: string;
};

function formatReleaseYear(year: number | null | undefined): string {
    if (!year || year === 0) return "N/A";
    return String(year);
}

export function MovieViewClient({
    movies,
    genres,
    platforms,
    adminName,
    initialCreateOpen = false,
    createMovieAction,
    updateMovieAction,
    deleteMovieAction,
    deleteAllMoviesAction,
    actionError = "",
    successMessage = "",
}: MovieViewClientProps) {
    const [query, setQuery] = useState("");
    const [priceType, setPriceType] = useState("ALL");
    const [ageGroup, setAgeGroup] = useState("ALL");
    const [year, setYear] = useState("");
    const [genreId, setGenreId] = useState("ALL");
    const [platformId, setPlatformId] = useState("ALL");
    const [isCreateOpen, setIsCreateOpen] = useState(initialCreateOpen);
    const [selectedMovie, setSelectedMovie] = useState<MovieRow | null>(null);

    const deferredQuery = useDeferredValue(query);

    const selectedGenreName = genres.find((genre) => genre.id === genreId)?.name;
    const selectedPlatformName = platforms.find((platform) => platform.id === platformId)?.name;
    const withPosterCount = movies.filter((movie) => Boolean(resolveMediaUrl(movie.poster))).length;
    const premiumCount = movies.filter((movie) => movie.priceType === "PREMIUM").length;

    const router = useRouter();
    const initialToast = useMemo(() => {
        const message = successMessage || actionError;
        const type: "success" | "error" | undefined = successMessage ? "success" : actionError ? "error" : undefined;

        return message && type ? { type, message } : null;
    }, [actionError, successMessage]);

    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(initialToast);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeoutId = window.setTimeout(() => setToast(null), 4000);
        router.replace(window.location.pathname, { scroll: false });

        return () => window.clearTimeout(timeoutId);
    }, [router, toast]);

    const filteredMovies = useMemo(() => {
        const q = deferredQuery.trim().toLowerCase();

        return movies.filter((movie) => {
            const queryMatched = !q || movie.title.toLowerCase().includes(q) || movie.director.toLowerCase().includes(q);
            const priceMatched = priceType === "ALL" || movie.priceType === priceType;
            const ageMatched = ageGroup === "ALL" || movie.ageGroup === ageGroup;
            const yearMatched = !year || String(movie.releaseYear) === year;
            const genreMatched = genreId === "ALL" || (selectedGenreName ? movie.genres.includes(selectedGenreName) : false);
            const platformMatched = platformId === "ALL" || (selectedPlatformName ? movie.platforms.includes(selectedPlatformName) : false);

            return queryMatched && priceMatched && ageMatched && yearMatched && genreMatched && platformMatched;
        });
    }, [movies, deferredQuery, priceType, ageGroup, year, genreId, platformId, selectedGenreName, selectedPlatformName]);

    const resetFilters = () => {
        setQuery("");
        setPriceType("ALL");
        setAgeGroup("ALL");
        setYear("");
        setGenreId("ALL");
        setPlatformId("ALL");
    };

    return (
        <>
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                <div className="border-b border-slate-100 bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_45%,#334155_100%)] p-6 text-white sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <p className="text-sm text-slate-300">Interactive Movie Workspace</p>
                            <h2 className="mt-1 text-3xl font-bold tracking-tight">Browse, create, and manage movies</h2>
                            <p className="mt-2 max-w-2xl text-sm text-slate-300">Open any movie card to edit core details in a sheet, or create a new movie from the `+ Create` action.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                            <Sparkles className="size-3.5" />
                            Curated for {adminName}
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6 xl:grid-cols-4">
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Total Movies</p>
                            <Clapperboard className="size-4 text-slate-400" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{movies.length}</p>
                    </article>
                    <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wider text-indigo-700">Premium</p>
                            <Film className="size-4 text-indigo-600" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-indigo-800">{premiumCount}</p>
                    </article>
                    <article className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wider text-sky-700">With Poster</p>
                            <CalendarRange className="size-4 text-sky-600" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-sky-800">{withPosterCount}</p>
                    </article>
                    <article className="flex items-center justify-end rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,#2563eb_0%,#1d4ed8_100%)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                        >
                            <FolderPlus className="size-4" />
                            Create Movie
                        </button>
                    </article>
                </div>
            </section>

            {toast ? (
                <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl px-5 py-4 text-sm font-semibold shadow-2xl ring-1 ring-slate-200"
                    style={{
                        backgroundColor: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
                        color: toast.type === "success" ? "#166534" : "#991b1b",
                    }}
                >
                    {toast.message}
                </div>
            ) : null}

            <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.75fr))_auto]">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by title or director"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                        />
                    </label>
                    <select value={priceType} onChange={(event) => setPriceType(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                        <option value="ALL">All Price Types</option>
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>
                    <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                        <option value="ALL">All Age Groups</option>
                        <option value="ALL_AGES">ALL_AGES</option>
                        <option value="AGE_7_PLUS">AGE_7_PLUS</option>
                        <option value="AGE_13_PLUS">AGE_13_PLUS</option>
                        <option value="AGE_16_PLUS">AGE_16_PLUS</option>
                        <option value="AGE_18_PLUS">AGE_18_PLUS</option>
                    </select>
                    <input
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                        placeholder="Year"
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    />
                    <select value={genreId} onChange={(event) => setGenreId(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                        <option value="ALL">All Genres</option>
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>
                    <select value={platformId} onChange={(event) => setPlatformId(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                        <option value="ALL">All Platforms</option>
                        {platforms.map((platform) => (
                            <option key={platform.id} value={platform.id}>{platform.name}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Reset
                    </button>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Movie Library</p>
                        <p className="mt-1 text-sm text-slate-600">Showing {filteredMovies.length} of {movies.length} movies</p>
                    </div>
                    <form action={deleteAllMoviesAction}>
                        <PendingSubmitButton pendingText="Deleting all..." className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
                            <Trash2 className="size-4" />
                            Delete All Movies
                        </PendingSubmitButton>
                    </form>
                </div>

                {filteredMovies.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
                        <p className="text-base font-semibold text-slate-800">No movies found for these filters.</p>
                        <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or create a new movie from the top-right action.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {filteredMovies.map((movie) => {
                            const posterUrl = resolveMediaUrl(movie.poster);

                            return (
                                <button
                                    key={movie.id}
                                    type="button"
                                    onClick={() => setSelectedMovie(movie)}
                                    className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
                                >
                                    <div className="relative aspect-4/5 overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e40af_100%)]">
                                        {posterUrl ? (
                                            <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-white/85">
                                                <Clapperboard className="size-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/90 via-slate-900/45 to-transparent p-4 text-white">
                                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/70">
                                                {/* ✅ FIX 1 applied: use helper for card display too */}
                                                <span>{formatReleaseYear(movie.releaseYear)}</span>
                                                <span className="h-1 w-1 rounded-full bg-white/50" />
                                                <span>{movie.priceType}</span>
                                            </div>
                                            <h3 className="mt-2 line-clamp-2 text-xl font-semibold">{movie.title}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4">
                                        <p className="text-sm text-slate-500">Directed by {movie.director}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.genres.slice(0, 3).map((genre) => (
                                                <span key={`${movie.id}-${genre}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                                                    {genre}
                                                </span>
                                            ))}
                                            {movie.genres.length > 3 && (
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">+{movie.genres.length - 3}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            {/* <span>{movie.platforms[0] ?? "No platform"}</span> */}
                                            <span>{movie.ageGroup}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-none sm:w-[min(92vw,920px)]">
                    <SheetHeader className="border-b border-slate-100 px-6 py-5">
                        <SheetTitle className="text-2xl font-semibold text-slate-900">Create Movie</SheetTitle>
                        <SheetDescription>Add a new movie with poster, metadata, genres, and streaming platforms.</SheetDescription>
                    </SheetHeader>

                    <form action={createMovieAction} className="space-y-5 px-6 py-6">
                        {actionError ? (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                {actionError}
                            </div>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Movie Title</span>
                                <input name="title" required placeholder="The Dark Knight" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                            </label>
                            <label className="space-y-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Poster</span>
                                <input name="poster" type="file" accept="image/*" required className="h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                            </label>
                        </div>

                        <label className="space-y-1.5">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Description</span>
                            <textarea name="description" required placeholder="Write a concise synopsis" className="min-h-32 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Director</span>
                                <input name="director" required placeholder="Christopher Nolan" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                            </label>
                            <label className="space-y-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Release Year</span>
                                <input name="releaseYear" required type="number" placeholder="2012" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                            </label>
                        </div>
                        <label className="space-y-1.5">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Streaming Link</span>
                            <input name="streamingLink" type="url" placeholder="https://..." className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                        </label>

                        <label className="space-y-1.5">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Cast</span>
                            <input name="cast" placeholder="Christian Bale, Michael Caine" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Price Type</span>
                                <select name="priceType" defaultValue="PREMIUM" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                                    <option value="FREE">FREE</option>
                                    <option value="PREMIUM">PREMIUM</option>
                                </select>
                            </label>
                            {/* ✅ FIX 2: Added ALL_AGES to create form */}
                            <label className="space-y-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Age Group</span>
                                <select name="ageGroup" defaultValue="AGE_13_PLUS" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                                    <option value="ALL_AGES">ALL_AGES</option>
                                    <option value="AGE_7_PLUS">AGE_7_PLUS</option>
                                    <option value="AGE_13_PLUS">AGE_13_PLUS</option>
                                    <option value="AGE_16_PLUS">AGE_16_PLUS</option>
                                    <option value="AGE_18_PLUS">AGE_18_PLUS</option>
                                </select>
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <fieldset className="rounded-2xl border border-slate-200 p-4">
                                <legend className="px-1 text-sm font-semibold text-slate-800">Genres</legend>
                                <div className="mt-3 grid max-h-56 gap-2 overflow-auto pr-1">
                                    {genres.length === 0 ? (
                                        <p className="text-sm text-slate-500">No genres found.</p>
                                    ) : (
                                        genres.map((genre) => (
                                            <label key={genre.id} className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-slate-700">
                                                <input type="checkbox" name="genres" value={genre.id} className="size-4 rounded border-slate-300" />
                                                <span>{genre.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </fieldset>

                            <fieldset className="rounded-2xl border border-slate-200 p-4">
                                <legend className="px-1 text-sm font-semibold text-slate-800">Streaming Platforms</legend>
                                <div className="mt-3 grid max-h-56 gap-2 overflow-auto pr-1">
                                    {(
                                        platforms.map((platform) => (
                                            <label key={platform.id} className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-slate-700">
                                                <input type="checkbox" name="platforms" value={platform.id} className="size-4 rounded border-slate-300" />
                                                <span>{platform.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </fieldset>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-2">
                            <PendingSubmitButton pendingText="Creating..." className="rounded-xl bg-[linear-gradient(120deg,#2563eb_0%,#1d4ed8_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
                                Create Movie
                            </PendingSubmitButton>
                            <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                Cancel
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet open={Boolean(selectedMovie)} onOpenChange={(open) => !open && setSelectedMovie(null)}>
                <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-none sm:w-[min(92vw,980px)]">
                    {selectedMovie ? (
                        <>
                            <SheetHeader className="border-b border-slate-100 px-6 py-5">
                                <SheetTitle className="text-2xl font-semibold text-slate-900">{selectedMovie.title}</SheetTitle>
                                <SheetDescription>Edit core movie data and manage this record from one place.</SheetDescription>
                            </SheetHeader>

                            <div className="space-y-5 px-6 py-6">
                                <div className="space-y-4">
                                    <div className="mx-auto w-full max-w-70 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(160deg,#0f172a_0%,#1e40af_100%)]">
                                        {resolveMediaUrl(selectedMovie.poster) ? (
                                            <img src={resolveMediaUrl(selectedMovie.poster)} alt={selectedMovie.title} className="aspect-4/5 h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex aspect-4/5 items-center justify-center text-white/85">
                                                <Clapperboard className="size-12" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                            <p className="text-xs uppercase tracking-wider text-slate-500">Director</p>
                                            <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">{selectedMovie.director}</p>
                                        </article>

                                        {/* <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                                            <p className="text-xs uppercase tracking-wider text-slate-500">Genres</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedMovie.genres.length > 0 ? selectedMovie.genres.map((genre) => (
                                                    <span key={`${selectedMovie.id}-${genre}`} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
                                                        {genre}
                                                    </span>
                                                )) : <span className="text-sm text-slate-500">No genres</span>}
                                            </div>
                                        </article> */}
                                        {/* <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                                            <p className="text-xs uppercase tracking-wider text-slate-500">Platforms</p>

                                        </article> */}
                                    </div>
                                </div>

                                <form action={updateMovieAction} className="space-y-4">
                                    <input type="hidden" name="id" value={selectedMovie.id} />
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="space-y-1.5 md:col-span-2">
                                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Title</span>
                                            <input name="title" defaultValue={selectedMovie.title} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                                        </label>
                                        <label className="space-y-1.5">
                                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Director</span>
                                            <input name="director" defaultValue={selectedMovie.director} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                                        </label>
                                        <label className="space-y-1.5">
                                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Release Year</span>
                                            {/* ✅ FIX 1 applied: show empty string instead of 0 in the edit input */}
                                            <input name="releaseYear" defaultValue={selectedMovie.releaseYear !== 0 ? selectedMovie.releaseYear : ""} placeholder="e.g. 2024" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                                        </label>
                                        <label className="space-y-1.5">
                                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Price Type</span>
                                            <select name="priceType" defaultValue={selectedMovie.priceType} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                                                <option value="FREE">FREE</option>
                                                <option value="PREMIUM">PREMIUM</option>
                                            </select>
                                        </label>
                                        {/* ✅ FIX 2: Added ALL_AGES to edit form so existing movies with ALL_AGES render correctly */}
                                        <label className="space-y-1.5">
                                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Age Group</span>
                                            <select name="ageGroup" defaultValue={selectedMovie.ageGroup} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">
                                                <option value="ALL_AGES">ALL_AGES</option>
                                                <option value="AGE_7_PLUS">AGE_7_PLUS</option>
                                                <option value="AGE_13_PLUS">AGE_13_PLUS</option>
                                                <option value="AGE_16_PLUS">AGE_16_PLUS</option>
                                                <option value="AGE_18_PLUS">AGE_18_PLUS</option>
                                            </select>
                                        </label>
                                        <label className="space-y-1.5 md:col-span-2">
                                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Description</span>
                                            <textarea name="description" defaultValue={selectedMovie.description} className="min-h-28 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                                        </label>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <fieldset className="rounded-2xl border border-slate-200 p-4">
                                            <legend className="px-1 text-sm font-semibold text-slate-800">Genres</legend>
                                            <div className="mt-3 grid max-h-56 gap-2 overflow-auto pr-1">
                                                {genres.length === 0 ? (
                                                    <p className="text-sm text-slate-500">No genres found.</p>
                                                ) : (
                                                    genres.map((genre) => (
                                                        <label key={genre.id} className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-slate-700">
                                                            <input type="checkbox" name="genres" value={genre.id} defaultChecked={selectedMovie.genres.includes(genre.name)} className="size-4 rounded border-slate-300" />
                                                            <span>{genre.name}</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </fieldset>

                                        <fieldset className="rounded-2xl border border-slate-200 p-4">
                                            <legend className="px-1 text-sm font-semibold text-slate-800">Streaming Platforms</legend>
                                            <div className="mt-3 grid max-h-56 gap-2 overflow-auto pr-1">
                                                {(
                                                    platforms.map((platform) => (
                                                        <label key={platform.id} className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-slate-700">
                                                            <input type="checkbox" name="platforms" value={platform.id} defaultChecked={selectedMovie.platforms.includes(platform.name)} className="size-4 rounded border-slate-300" />
                                                            <span>{platform.name}</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-2">
                                        <PendingSubmitButton pendingText="Saving..." className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                            Save Changes
                                        </PendingSubmitButton>
                                    </div>
                                </form>

                                <form action={deleteMovieAction} className="border-t border-slate-100 pt-2">
                                    <input type="hidden" name="id" value={selectedMovie.id} />
                                    <PendingSubmitButton pendingText="Deleting..." className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                                        Delete Movie
                                    </PendingSubmitButton>
                                </form>
                            </div>
                        </>
                    ) : null}
                </SheetContent>
            </Sheet>
        </>
    );
}