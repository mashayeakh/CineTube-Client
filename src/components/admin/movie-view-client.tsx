"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

type OptionItem = {
    id: string;
    name: string;
};

type MovieRow = {
    id: string;
    title: string;
    releaseYear: number;
    priceType: string;
    ageGroup: string;
    director: string;
    genres: string[];
    platforms: string[];
};

type MovieViewClientProps = {
    movies: MovieRow[];
    genres: OptionItem[];
    platforms: OptionItem[];
    updateMovieAction: (formData: FormData) => Promise<void>;
    deleteMovieAction: (formData: FormData) => Promise<void>;
    deleteAllMoviesAction: () => Promise<void>;
};

export function MovieViewClient({
    movies,
    genres,
    platforms,
    updateMovieAction,
    deleteMovieAction,
    deleteAllMoviesAction,
}: MovieViewClientProps) {
    const [query, setQuery] = useState("");
    const [priceType, setPriceType] = useState("ALL");
    const [ageGroup, setAgeGroup] = useState("ALL");
    const [year, setYear] = useState("");
    const [genreId, setGenreId] = useState("ALL");
    const [platformId, setPlatformId] = useState("ALL");

    const selectedGenreName = genres.find((genre) => genre.id === genreId)?.name;
    const selectedPlatformName = platforms.find((platform) => platform.id === platformId)?.name;

    const filteredMovies = useMemo(() => {
        const q = query.trim().toLowerCase();

        return movies.filter((movie) => {
            const queryMatched = !q || movie.title.toLowerCase().includes(q) || movie.director.toLowerCase().includes(q);
            const priceMatched = priceType === "ALL" || movie.priceType === priceType;
            const ageMatched = ageGroup === "ALL" || movie.ageGroup === ageGroup;
            const yearMatched = !year || String(movie.releaseYear) === year;
            const genreMatched = genreId === "ALL" || (selectedGenreName ? movie.genres.includes(selectedGenreName) : false);
            const platformMatched = platformId === "ALL" || (selectedPlatformName ? movie.platforms.includes(selectedPlatformName) : false);

            return queryMatched && priceMatched && ageMatched && yearMatched && genreMatched && platformMatched;
        });
    }, [movies, query, priceType, ageGroup, year, genreId, platformId, selectedGenreName, selectedPlatformName]);

    return (
        <>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search title/director"
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                    />
                    <select value={priceType} onChange={(event) => setPriceType(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
                        <option value="ALL">All Price Types</option>
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>
                    <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
                        <option value="ALL">All Age Groups</option>
                        <option value="AGE_7_PLUS">AGE_7_PLUS</option>
                        <option value="AGE_13_PLUS">AGE_13_PLUS</option>
                        <option value="AGE_16_PLUS">AGE_16_PLUS</option>
                        <option value="AGE_18_PLUS">AGE_18_PLUS</option>
                    </select>
                    <input
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                        placeholder="Year"
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                    />
                    <select value={genreId} onChange={(event) => setGenreId(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
                        <option value="ALL">All Genres</option>
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>
                    <select value={platformId} onChange={(event) => setPlatformId(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
                        <option value="ALL">All Platforms</option>
                        {platforms.map((platform) => (
                            <option key={platform.id} value={platform.id}>{platform.name}</option>
                        ))}
                    </select>
                    <div className="md:col-span-3 lg:col-span-6">
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setPriceType("ALL");
                                setAgeGroup("ALL");
                                setYear("");
                                setGenreId("ALL");
                                setPlatformId("ALL");
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">Showing {filteredMovies.length} of {movies.length} movies</p>
                    <form action={deleteAllMoviesAction}>
                        <PendingSubmitButton pendingText="Deleting all..." className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
                            <Trash2 className="size-4" />
                            Delete All Movies
                        </PendingSubmitButton>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-220 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Movie</th>
                                <th className="px-4 py-3 font-semibold">Year</th>
                                <th className="px-4 py-3 font-semibold">Price</th>
                                <th className="px-4 py-3 font-semibold">Age</th>
                                <th className="px-4 py-3 font-semibold">Genres</th>
                                <th className="px-4 py-3 font-semibold">Platforms</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No movies found for these filters.</td>
                                </tr>
                            ) : (
                                filteredMovies.map((movie) => (
                                    <tr key={movie.id} className="border-t border-slate-200 align-top">
                                        <td className="px-4 py-3" colSpan={7}>
                                            <div className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_90px_120px_140px_minmax(120px,1fr)_minmax(120px,1fr)_auto_auto] md:items-center">
                                                <form action={updateMovieAction} className="contents">
                                                    <input type="hidden" name="id" value={movie.id} />
                                                    <div>
                                                        <input name="title" defaultValue={movie.title} className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm" />
                                                        <p className="mt-1 text-xs text-slate-500">{movie.director}</p>
                                                    </div>
                                                    <input name="releaseYear" defaultValue={movie.releaseYear || ""} className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm" />
                                                    <select name="priceType" defaultValue={movie.priceType} className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs">
                                                        <option value="FREE">FREE</option>
                                                        <option value="PREMIUM">PREMIUM</option>
                                                    </select>
                                                    <select name="ageGroup" defaultValue={movie.ageGroup} className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs">
                                                        <option value="AGE_7_PLUS">AGE_7_PLUS</option>
                                                        <option value="AGE_13_PLUS">AGE_13_PLUS</option>
                                                        <option value="AGE_16_PLUS">AGE_16_PLUS</option>
                                                        <option value="AGE_18_PLUS">AGE_18_PLUS</option>
                                                    </select>
                                                    <span className="text-xs text-slate-600">{movie.genres.join(", ") || "-"}</span>
                                                    <span className="text-xs text-slate-600">{movie.platforms.join(", ") || "-"}</span>
                                                    <PendingSubmitButton pendingText="Saving..." className="h-8 rounded-md border border-slate-300 px-3 text-xs font-medium hover:bg-slate-50">Save</PendingSubmitButton>
                                                </form>
                                                <form action={deleteMovieAction}>
                                                    <input type="hidden" name="id" value={movie.id} />
                                                    <PendingSubmitButton pendingText="Deleting..." className="h-8 rounded-md border border-rose-200 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50">
                                                        Delete
                                                    </PendingSubmitButton>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
