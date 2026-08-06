import {
    PAGE_TEMPLATE_KEYS,
    type PageTemplateKey,
} from "@/lib/admin/pages/templates";

import { isRecord } from "./validation";

export type PageCreateTranslation = {
    title: string;
    seoTitle: string;
    seoDescription: string;
};

export type PageCreateInput = {
    slug: string;
    route: string;
    template: PageTemplateKey;
    seoKeywords: string[];
    translations: {
        en: PageCreateTranslation;
        fa: PageCreateTranslation;
    };
};

function boundedText(
    value: unknown,
    fieldName: string,
    minimum: number,
    maximum: number,
): string {
    if (typeof value !== "string") throw new Error(`${fieldName} is required.`);
    const text = value.trim();
    if (text.length < minimum || text.length > maximum) {
        throw new Error(`${fieldName} must be between ${minimum} and ${maximum} characters.`);
    }
    return text;
}

export function parsePageSlug(value: unknown): string {
    if (typeof value !== "string") throw new Error("slug is required.");
    const slug = value.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
        throw new Error("slug must be a safe lowercase URL segment.");
    }
    return slug;
}

export function parsePageRoute(value: unknown): string {
    if (typeof value !== "string") throw new Error("route is required.");
    const route = value.trim().toLowerCase();
    if (
        route.length > 200
        || !/^\/[a-z0-9][a-z0-9/-]*$/.test(route)
        || route.includes("//")
        || (route.length > 1 && route.endsWith("/"))
    ) {
        throw new Error("route must be a canonical root-relative path.");
    }
    return route;
}

export function parsePageTemplate(value: unknown): PageTemplateKey {
    if (
        typeof value !== "string"
        || !PAGE_TEMPLATE_KEYS.includes(value as PageTemplateKey)
    ) {
        throw new Error("template is invalid.");
    }
    return value as PageTemplateKey;
}

export function parsePageCreateInput(body: Record<string, unknown>): PageCreateInput {
    if (body.status !== undefined && body.status !== "draft") {
        throw new Error("New Pages must start as draft.");
    }
    if (!isRecord(body.translations)) {
        throw new Error("translations must include en and fa.");
    }
    const translations = {} as PageCreateInput["translations"];
    for (const language of ["en", "fa"] as const) {
        const translation = body.translations[language];
        if (!isRecord(translation)) {
            throw new Error(`translations.${language} is required.`);
        }
        translations[language] = {
            title: boundedText(translation.title, `translations.${language}.title`, 2, 160),
            seoTitle: boundedText(translation.seoTitle, `translations.${language}.seoTitle`, 2, 160),
            seoDescription: boundedText(
                translation.seoDescription,
                `translations.${language}.seoDescription`,
                20,
                500,
            ),
        };
    }
    const rawKeywords = body.seoKeywords ?? [];
    if (
        !Array.isArray(rawKeywords)
        || rawKeywords.length > 20
        || rawKeywords.some((keyword) =>
            typeof keyword !== "string"
            || keyword.trim().length < 1
            || keyword.trim().length > 60)
    ) {
        throw new Error("seoKeywords must contain at most 20 bounded strings.");
    }
    return {
        slug: parsePageSlug(body.slug),
        route: parsePageRoute(body.route),
        template: parsePageTemplate(body.template ?? "standard"),
        seoKeywords: Array.from(new Set(rawKeywords.map((keyword) => keyword.trim()))),
        translations,
    };
}
