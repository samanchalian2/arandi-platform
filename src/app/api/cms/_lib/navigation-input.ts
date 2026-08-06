import { isRecord, parseUuid } from "./validation";

export type NavigationTranslationsInput = {
    en?: string;
    fa?: string;
};

export function parseNavigationKey(value: unknown): string {
    if (typeof value !== "string") throw new Error("key is required.");
    const key = value.trim();
    if (!/^[a-z][a-z0-9_-]{1,63}$/.test(key)) {
        throw new Error("key must be a safe lowercase identifier.");
    }
    return key;
}

export function parseNavigationHref(value: unknown, isExternal: boolean): string {
    if (typeof value !== "string") throw new Error("href is required.");
    const href = value.trim();
    if (href.length < 1 || href.length > 500) throw new Error("href is invalid.");
    if (isExternal) {
        let parsed: URL;
        try {
            parsed = new URL(href);
        } catch {
            throw new Error("External href must be a valid HTTPS URL.");
        }
        if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
            throw new Error("External href must be a credential-free HTTPS URL.");
        }
        return parsed.toString();
    }
    if (!href.startsWith("/") || href.startsWith("//") || /[\u0000-\u001f\\]/.test(href)) {
        throw new Error("Internal href must be a safe root-relative path.");
    }
    return href;
}

export function parseNavigationTranslations(
    value: unknown,
    requireBoth: boolean,
): NavigationTranslationsInput {
    if (!isRecord(value)) throw new Error("translations is required.");
    const result: NavigationTranslationsInput = {};
    for (const language of ["en", "fa"] as const) {
        const entry = value[language];
        if (entry === undefined && !requireBoth) continue;
        if (!isRecord(entry) || typeof entry.label !== "string") {
            throw new Error(`${language} navigation label is required.`);
        }
        const label = entry.label.trim();
        if (label.length < 1 || label.length > 100) {
            throw new Error(`${language} navigation label is invalid.`);
        }
        result[language] = label;
    }
    return result;
}

export function parseNavigationId(value: string): string {
    return parseUuid(value, "id");
}
