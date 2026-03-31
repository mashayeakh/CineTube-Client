"use client"

import { useState } from "react"
import { Loader2, Star, Send, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createReviewAction } from "./_actions/reviewActions"

type WatchlistMovie = {
    movieId: string
    title: string
}

type ReviewFormClientProps = {
    watchlistMovies: WatchlistMovie[]
}

export default function ReviewFormClient({ watchlistMovies }: ReviewFormClientProps) {
    const [selectedMovieId, setSelectedMovieId] = useState("")
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [content, setContent] = useState("")
    const [tagInput, setTagInput] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase()
        if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
            setTags([...tags, trimmed])
            setTagInput("")
        }
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag))
    }

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addTag()
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedMovieId || !content.trim() || rating === 0) return

        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            const result = await createReviewAction({
                movieId: selectedMovieId,
                rating,
                content: content.trim(),
                tags,
            })

            if (!result.success) {
                setError(result.message)
            } else {
                setSuccess(result.message || "Review submitted successfully! It will appear after admin approval.")
                setSelectedMovieId("")
                setRating(0)
                setContent("")
                setTags([])
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (watchlistMovies.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                    Add movies to your watchlist first, then you can review them here.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                </p>
            )}
            {success && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                    {success}
                </p>
            )}

            {/* Movie Selection */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Select Movie</label>
                <select
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                >
                    <option value="">Choose a movie from your watchlist...</option>
                    {watchlistMovies.map((m) => (
                        <option key={m.movieId} value={m.movieId}>
                            {m.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Rating</label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-0.5 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`size-6 ${star <= (hoverRating || rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-sm font-medium text-slate-600">{rating}.0</span>
                    )}
                </div>
            </div>

            {/* Review Content */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Your Review</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts about this movie..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tags (optional, max 5)</label>
                <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                        >
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                                <X className="size-3" />
                            </button>
                        </span>
                    ))}
                    {tags.length < 5 && (
                        <div className="flex items-center gap-1">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Add tag..."
                                className="h-8 w-28 text-xs"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:text-slate-700"
                            >
                                <Plus className="size-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={loading || !selectedMovieId || !content.trim() || rating === 0}
                className="gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="size-4" />
                        Submit Review
                    </>
                )}
            </Button>
        </form>
    )
}
