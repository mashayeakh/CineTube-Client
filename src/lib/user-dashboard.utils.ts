export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeKey(value: string) {
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

export function parseString(value: unknown, fallback = "—") {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : fallback;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    return fallback;
}

export function formatDate(value: unknown) {
    if (typeof value !== "string" || value.length === 0) {
        return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatCurrency(value: unknown) {
    const numeric = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(numeric)) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(numeric);
}

export function getPrimitiveEntries(source: unknown) {
    if (!isRecord(source)) {
        return [] as Array<{ key: string; value: string }>;
    }

    const entries = Object.entries(source)
        .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
        .map(([key, value]) => ({
            key,
            value: parseString(value),
        }));

    return entries;
}
