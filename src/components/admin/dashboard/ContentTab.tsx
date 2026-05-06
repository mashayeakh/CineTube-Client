import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/states/empty-state";
import { Film, PlusCircle, Star } from "lucide-react";

interface MovieItem {
  id: string;
  title: string;
  genre: string;
  status: string;
  rating: number;
  releaseYear: string;
}

interface ContributionItem {
  id: string;
  title: string;
  submittedBy: string;
  status: string;
  createdAt: string;
}

interface TopMovieItem {
    id: string;
    title: string;
    count: number;
    rating: number;
}

interface ContentTabProps {
  movies: MovieItem[];
  contributions: ContributionItem[];
  topWatchlistMovies: TopMovieItem[];
  totalMovies: number;
  totalContributedMovies: number;
  formatNumber: (v: number) => string;
  getStatusVariant: (status: string) => any;
}

export function ContentTab({
  movies,
  contributions,
  topWatchlistMovies,
  totalMovies,
  totalContributedMovies,
  formatNumber,
  getStatusVariant,
}: ContentTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Movies Management */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Movie Catalogue</h3>
              <p className="text-sm text-slate-500">{formatNumber(totalMovies)} total movies</p>
            </div>
            <Film className="size-5 text-blue-500" />
          </div>

          <div className="space-y-3">
            {movies.length === 0 ? (
              <EmptyState
                title="No movies found"
                description="The catalogue is currently empty."
              />
            ) : (
              movies.map((movie) => (
                <div key={movie.id} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{movie.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{movie.genre} • {movie.releaseYear}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="size-3 fill-current" />
                      <span className="text-xs font-bold">{movie.rating.toFixed(1)}</span>
                    </div>
                    <Badge variant={getStatusVariant(movie.status)} className="text-[10px] px-1.5 py-0">
                      {movie.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* User Contributions */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">User Submissions</h3>
              <p className="text-sm text-slate-500">{formatNumber(totalContributedMovies)} community proposals</p>
            </div>
            <PlusCircle className="size-5 text-orange-500" />
          </div>

          <div className="space-y-3">
            {contributions.length === 0 ? (
              <EmptyState
                title="No pending contributions"
                description="All user submissions have been processed."
              />
            ) : (
              contributions.map((item) => (
                <div key={item.id} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-orange-100">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tight">By: {item.submittedBy}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                    <Badge variant={getStatusVariant(item.status)} className="text-[10px] px-1.5 py-0">
                      {item.status}
                    </Badge>
                    <span className="text-[9px] text-slate-400 font-medium">{item.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Top Watchlist Movies */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Trending in Watchlists</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
           {topWatchlistMovies.map((movie, idx) => (
              <div key={movie.id} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-lg hover:border-blue-100 group">
                 <span className="absolute -right-2 -top-2 text-4xl font-black text-slate-200/40 group-hover:text-blue-500/10 transition-colors">#{idx + 1}</span>
                 <p className="font-bold text-slate-900 text-sm truncate mb-2">{movie.title}</p>
                 <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-slate-500">
                        <Film className="size-3" />
                        <span className="text-xs font-bold">{formatNumber(movie.count)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="size-3 fill-current" />
                        <span className="text-xs font-bold">{movie.rating.toFixed(1)}</span>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </section>
    </div>
  );
}
