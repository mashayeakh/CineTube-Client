"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckSquare, CreditCard, ImagePlus, Loader2, Lock, Plus, Square, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitSeriesContribution } from "../_action/submitSeriesContribution"

type Item = { id: string; name: string }

interface SeriesContributionFormProps {
    userId: string
    genres: Item[]
    platforms: Item[]
    isPremium: boolean
}

const AGE_GROUPS = ["KIDS", "TEEN", "ADULT", "ALL"]
const SERIES_STATUSES = ["ONGOING", "COMPLETED", "UPCOMING"]

export function SeriesContributionForm({ userId, genres, platforms, isPremium }: SeriesContributionFormProps) {
    const router = useRouter()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [posterFile, setPosterFile] = useState<File | null>(null)
    const [posterPreview, setPosterPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [releaseYear, setReleaseYear] = useState("")
    const [director, setDirector] = useState("")
    const [language, setLanguage] = useState("")
    const [seasonCount, setSeasonCount] = useState("")
    const [seriesStatus, setSeriesStatus] = useState("ONGOING")
    const [castInput, setCastInput] = useState("")
    const [cast, setCast] = useState<string[]>([])
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
    const [ageGroup, setAgeGroup] = useState("TEEN")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const addCast = () => {
        const name = castInput.trim()
        if (name && !cast.includes(name)) {
            setCast((prev) => [...prev, name])
        }
        setCastInput("")
    }

    const removeCast = (name: string) => setCast((prev) => prev.filter((c) => c !== name))

    const toggleGenre = (id: string) =>
        setSelectedGenres((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        )

    const togglePlatform = (id: string) =>
        setSelectedPlatforms((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        )

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPosterFile(file)
        setPosterPreview(URL.createObjectURL(file))
    }

    const removePoster = () => {
        setPosterFile(null)
        if (posterPreview) URL.revokeObjectURL(posterPreview)
        setPosterPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!isPremium) {
            setError("You have not completed your payment yet. Please upgrade to a Premium subscription to contribute series.")
            setTimeout(() => router.push("/user/subscription"), 2000)
            return
        }

        if (!title || !description || !releaseYear || !director) {
            setError("Please fill in all required fields.")
            return
        }

        const year = parseInt(releaseYear, 10)
        if (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 5) {
            setError("Please enter a valid release year.")
            return
        }

        const seasons = seasonCount ? parseInt(seasonCount, 10) : undefined
        if (seasonCount && (isNaN(seasons!) || seasons! < 1)) {
            setError("Season count must be a positive number.")
            return
        }

        setSubmitting(true)

        const formData = new FormData()
        formData.append("userId", userId)
        formData.append("title", title)
        formData.append("description", description)
        formData.append("releaseYear", String(year))
        formData.append("director", director)
        if (language) formData.append("language", language)
        if (seasons) formData.append("totalSeasons", String(seasons))
        formData.append("status", seriesStatus)
        formData.append("ageGroup", ageGroup)
        cast.forEach((c) => formData.append("cast", c))
        selectedGenres.forEach((g) => formData.append("genres", g))
        selectedPlatforms.forEach((p) => formData.append("platforms", p))
        if (posterFile) formData.append("poster", posterFile)

        const result = await submitSeriesContribution(formData)

        setSubmitting(false)

        if (!result.success) {
            setError(result.message ?? "Submission failed.")
            return
        }

        setSuccess(true)
        setTimeout(() => router.refresh(), 1500)
    }

    if (success) {
        return (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                    <CheckSquare className="size-7 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Contribution submitted!</h3>
                    <p className="mt-1 text-sm text-slate-500">Your series has been sent for review.</p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment warning banner for non-premium users */}
            {!isPremium && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <Lock className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    <div className="flex-1 text-sm">
                        <p className="font-medium text-amber-800">Payment not completed</p>
                        <p className="mt-0.5 text-amber-700">
                            You need a Premium subscription to submit contributions. Fill the form and click Submit — you will be redirected to complete your payment.
                        </p>
                    </div>
                    <a
                        href="/user/subscription#pricing"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
                    >
                        <CreditCard className="size-3.5" />
                        Pay Now
                    </a>
                </div>
            )}

            {/* Title */}
            <Field label="Title" required>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Breaking Bad"
                    required
                />
            </Field>

            {/* Description */}
            <Field label="Description" required>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short synopsis of the series..."
                    rows={3}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </Field>

            {/* Poster Upload */}
            <Field label="Poster Image">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                />
                {posterPreview ? (
                    <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={posterPreview}
                            alt="Poster preview"
                            className="h-60 w-40 rounded-lg border border-slate-200 object-cover"
                        />
                        <button
                            type="button"
                            onClick={removePoster}
                            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                        >
                            <Trash2 className="size-3" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-40 w-36 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500"
                    >
                        <ImagePlus className="size-8" />
                        <span className="text-xs font-medium">Upload Poster</span>
                    </button>
                )}
            </Field>

            {/* Release Year + Director */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Release Year" required>
                    <Input
                        value={releaseYear}
                        onChange={(e) => setReleaseYear(e.target.value)}
                        placeholder="2024"
                        type="number"
                        min={1888}
                        max={new Date().getFullYear() + 5}
                        required
                    />
                </Field>
                <Field label="Director" required>
                    <Input
                        value={director}
                        onChange={(e) => setDirector(e.target.value)}
                        placeholder="e.g. Vince Gilligan"
                        required
                    />
                </Field>
            </div>

            {/* Language + Season Count */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Language">
                    <Input
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="e.g. English"
                    />
                </Field>
                <Field label="Number of Seasons">
                    <Input
                        value={seasonCount}
                        onChange={(e) => setSeasonCount(e.target.value)}
                        placeholder="e.g. 5"
                        type="number"
                        min={1}
                    />
                </Field>
            </div>

            {/* Series Status */}
            <Field label="Series Status">
                <div className="flex flex-wrap gap-2">
                    {SERIES_STATUSES.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setSeriesStatus(s)}
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${seriesStatus === s
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </Field>

            {/* Cast */}
            <Field label="Cast">
                <div className="flex gap-2">
                    <Input
                        value={castInput}
                        onChange={(e) => setCastInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCast() } }}
                        placeholder="Actor name, press Enter or +"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addCast}>
                        <Plus className="size-4" />
                    </Button>
                </div>
                {cast.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {cast.map((name) => (
                            <span key={name} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {name}
                                <button type="button" onClick={() => removeCast(name)} className="text-slate-400 hover:text-slate-700">
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </Field>

            {/* Genres */}
            {genres.length > 0 && (
                <Field label="Genres">
                    <div className="flex flex-wrap gap-2">
                        {genres.map((g) => {
                            const selected = selectedGenres.includes(g.id)
                            return (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => toggleGenre(g.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${selected
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {selected ? <CheckSquare className="size-3" /> : <Square className="size-3" />}
                                    {g.name}
                                </button>
                            )
                        })}
                    </div>
                </Field>
            )}

            {/* Platforms */}
            {platforms.length > 0 && (
                <Field label="Streaming Platforms">
                    <div className="flex flex-wrap gap-2">
                        {platforms.map((p) => {
                            const selected = selectedPlatforms.includes(p.id)
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => togglePlatform(p.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${selected
                                        ? "border-violet-500 bg-violet-50 text-violet-700"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {selected ? <CheckSquare className="size-3" /> : <Square className="size-3" />}
                                    {p.name}
                                </button>
                            )
                        })}
                    </div>
                </Field>
            )}

            {/* Age Group */}
            <Field label="Age Group">
                <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map((group) => (
                        <button
                            key={group}
                            type="button"
                            onClick={() => setAgeGroup(group)}
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${ageGroup === group
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto"
            >
                {submitting ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" /> Submitting...</>
                ) : (
                    "Submit Contribution"
                )}
            </Button>
        </form>
    )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
                {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
        </div>
    )
}
