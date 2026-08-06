import type { NextRequest } from "next/server";

import { readBoundedJson } from "@/lib/http/boundedJson";

export type JsonRecord = Record<string, unknown>;

export const CMS_LANGS = ["en", "fa"] as const;
export type CmsLang = (typeof CMS_LANGS)[number];

export function isRecord(value: unknown): value is JsonRecord {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function readJson(request: NextRequest, maxBytes = 65_536): Promise<JsonRecord> {
    const body = await readBoundedJson(request, maxBytes);
    if (!isRecord(body)) {
        throw new Error("Request body must be a JSON object.");
    }

    return body;
}

export function parseLang(value: string | null | undefined): CmsLang {
    return value === "fa" ? "fa" : "en";
}

export function parseString(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${fieldName} must be a non-empty string.`);
    }

    return value.trim();
}

export function parseOptionalString(value: unknown): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value !== "string") {
        throw new Error("Expected a string value.");
    }

    return value;
}

export function parseOptionalBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value !== "boolean") {
        throw new Error("Expected a boolean value.");
    }

    return value;
}

export function parseOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error("Expected a numeric value.");
    }

    return value;
}

export function parseOptionalStringArray(value: unknown): string[] | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        throw new Error("Expected an array of strings.");
    }

    return value;
}

export function parseUuid(value: string, fieldName: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
        throw new Error(`${fieldName} must be a valid UUID.`);
    }

    return value;
}

export type TranslationInput = {
    title?: string;
    subtitle?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    statusBadge?: string;
    ctaLabel?: string;
    ctaHref?: string;
    label?: string;
    data?: Record<string, unknown>;
};

export type TranslationsInput = Partial<Record<CmsLang, TranslationInput>>;

export function parseTranslations(value: unknown): TranslationsInput {
    if (!isRecord(value)) {
        throw new Error("translations must be an object keyed by language code.");
    }

    const result: TranslationsInput = {};

    for (const lang of CMS_LANGS) {
        const raw = value[lang];
        if (raw === undefined) {
            continue;
        }

        if (!isRecord(raw)) {
            throw new Error(`translations.${lang} must be an object.`);
        }

        result[lang] = {
            title: parseOptionalString(raw.title),
            subtitle: parseOptionalString(raw.subtitle),
            description: parseOptionalString(raw.description),
            seoTitle: parseOptionalString(raw.seoTitle),
            seoDescription: parseOptionalString(raw.seoDescription),
            statusBadge: parseOptionalString(raw.statusBadge),
            ctaLabel: parseOptionalString(raw.ctaLabel),
            ctaHref: parseOptionalString(raw.ctaHref),
            label: parseOptionalString(raw.label),
            data: isRecord(raw.data) ? raw.data : undefined,
        };
    }

    if (Object.keys(result).length === 0) {
        throw new Error("translations must include at least one of en/fa.");
    }

    return result;
}
