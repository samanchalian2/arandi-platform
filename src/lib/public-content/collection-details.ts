import {
    getPublicEnterprisePage,
    type EnterpriseCollectionKey,
} from "./enterprise-pages";
import { findPublishedPageBySlug } from "./pages";

type PublicLanguage = "en" | "fa";

export type PublicCollectionDetail = {
    collection: EnterpriseCollectionKey;
    slug: string;
    title: string;
    summary: string;
    eyebrow: string;
    highlight: string | null;
    mediaUrl?: string;
    mediaAlt?: string;
    projectDetails?: { client: string; industry: string; overview: string; scope: string[]; technologies: string[]; outcome: string };
};

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function asRecord(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown, maxLength = 1_200): string | null {
    return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength ? value.trim() : null;
}

function textList(value: unknown): string[] | null {
    if (!Array.isArray(value) || value.length === 0 || value.length > 16) return null;
    const items = value.map((item) => text(item, 400));
    return items.every((item): item is string => item !== null) ? items : null;
}

function projectDetails(value: unknown, language: PublicLanguage): PublicCollectionDetail["projectDetails"] {
    const root = asRecord(value);
    const localized = asRecord(root?.[language]);
    if (!localized) return undefined;
    const client = text(localized.client, 240);
    const industry = text(localized.industry, 240);
    const overview = text(localized.overview);
    const scope = textList(localized.scope);
    const technologies = textList(localized.technologies);
    const outcome = text(localized.outcome);
    return client && industry && overview && scope && technologies && outcome ? { client, industry, overview, scope, technologies, outcome } : undefined;
}

export async function getPublicCollectionDetail(
    collection: EnterpriseCollectionKey,
    slug: string,
    language: PublicLanguage,
): Promise<PublicCollectionDetail> {
    if (!SAFE_SLUG.test(slug)) throw new Error("Collection detail slug is invalid.");
    switch (collection) {
        case "services": {
            const page = await getPublicEnterprisePage("services", language);
            const item = page.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Service is unavailable.");
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: item.label,
                highlight: null,
            };
        }
        case "solutions": {
            const page = await getPublicEnterprisePage("solutions", language);
            const item = page.catalog.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Solution is unavailable.");
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: page.catalog.eyebrow,
                highlight: item.outcome,
            };
        }
        case "industries": {
            const page = await getPublicEnterprisePage("industries", language);
            const item = page.section.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Industry is unavailable.");
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: page.section.eyebrow,
                highlight: null,
            };
        }
        case "projects": {
            const page = await getPublicEnterprisePage("projects", language);
            const item = page.section.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Project is unavailable.");
            const rawPage = await findPublishedPageBySlug("projects", language);
            const rawCard = rawPage?.sections.find((section) => section.key === "projects-catalog")?.cards.find((card) => asRecord(card.payload)?.sourceKey === slug);
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: page.section.eyebrow,
                highlight: item.impact,
                mediaUrl: rawCard?.media?.url,
                mediaAlt: rawCard?.media?.alt ?? item.title,
                projectDetails: projectDetails(asRecord(rawCard?.payload)?.projectDetails, language),
            };
        }
    }
}
