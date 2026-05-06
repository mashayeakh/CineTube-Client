type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeKey(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findValue(source: unknown, keys: string[], depth = 0): unknown {
    if (!isRecord(source) || depth > 3) {
        return undefined;
    }

    const targetKeys = new Set(keys.map(normalizeKey));

    for (const [key, value] of Object.entries(source)) {
        if (targetKeys.has(normalizeKey(key))) {
            return value;
        }
    }

    for (const value of Object.values(source)) {
        if (isRecord(value)) {
            const nestedValue = findValue(value, keys, depth + 1);

            if (nestedValue !== undefined) {
                return nestedValue;
            }
        }
    }

    return undefined;
}

export function parseNumber(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.replace(/[^0-9.-]/g, "");
        const parsed = Number(normalized);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return undefined;
}

export function parseString(value: unknown, fallback = "") {
    if (typeof value === "string") {
        return value.trim() || fallback;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    return fallback;
}

export function pickNumber(source: unknown, keys: string[], fallback = 0) {
    const parsed = parseNumber(findValue(source, keys));
    return parsed ?? fallback;
}

export function pickString(source: unknown, keys: string[], fallback = "") {
    return parseString(findValue(source, keys), fallback);
}

export function pickBoolean(source: unknown, keys: string[], fallback = false) {
    const value = findValue(source, keys);

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.toLowerCase();

        if (["true", "yes", "spoiler", "blocked", "active"].includes(normalized)) {
            return true;
        }

        if (["false", "no", "clean", "inactive"].includes(normalized)) {
            return false;
        }
    }

    return fallback;
}

export function extractArray(source: unknown, keys: string[] = []) {
    if (Array.isArray(source)) {
        return source;
    }

    const keyedValue = findValue(source, keys);

    if (Array.isArray(keyedValue)) {
        return keyedValue;
    }

    if (isRecord(source)) {
        for (const value of Object.values(source)) {
            if (Array.isArray(value)) {
                return value;
            }
        }
    }

    return [] as unknown[];
}

export function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently updated";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

export function formatRole(value: string) {
    return value
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase()) || "Unknown";
}

export function shortenLabel(value: string, fallback: string) {
    const normalized = value.trim();

    if (!normalized) {
        return fallback;
    }

    const date = new Date(normalized);

    if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
        }).format(date);
    }

    if (normalized.length <= 10) {
        return normalized;
    }

    return normalized.slice(0, 10);
}

export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    const normalized = status.toLowerCase();

    if (normalized.includes("approved") || normalized.includes("active") || normalized.includes("paid") || normalized.includes("success") || normalized.includes("completed")) {
        return "default";
    }

    if (normalized.includes("pending") || normalized.includes("review") || normalized.includes("processing")) {
        return "secondary";
    }

    if (normalized.includes("reject") || normalized.includes("block") || normalized.includes("fail") || normalized.includes("delete")) {
        return "destructive";
    }

    return "outline";
}
