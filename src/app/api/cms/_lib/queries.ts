export function parseOrdering(ordering: string | null, fallback: "asc" | "desc" = "desc"): "asc" | "desc" {
    if (ordering === "asc" || ordering === "desc") {
        return ordering;
    }

    return fallback;
}

export function parseBooleanQuery(value: string | null, fallback: boolean): boolean {
    if (value === null) {
        return fallback;
    }

    return value.toLowerCase() === "true";
}
