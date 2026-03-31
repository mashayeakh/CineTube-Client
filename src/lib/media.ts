const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export function resolveMediaUrl(value?: string | null, fallback = "") {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
        return fallback;
    }

    if (/^(https?:)?\/\//i.test(trimmedValue) || trimmedValue.startsWith("data:") || trimmedValue.startsWith("blob:")) {
        return trimmedValue;
    }

    if (!BACKEND_BASE_URL) {
        return trimmedValue;
    }

    const normalizedPath = trimmedValue.startsWith("/")
        ? trimmedValue
        : `/${trimmedValue.replace(/^\.?\//, "")}`;

    try {
        return new URL(normalizedPath, BACKEND_BASE_URL).toString();
    } catch {
        return trimmedValue;
    }
}