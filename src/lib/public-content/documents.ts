import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

import { PUBLIC_CONTENT_TAG } from "./cache";

export const PUBLIC_DOCUMENT_TYPES = ["article", "knowledge", "legal"] as const;
export type PublicDocumentType = typeof PUBLIC_DOCUMENT_TYPES[number];
export type PublicLanguage = "en" | "fa";

export type PublicDocumentSummary = {
    slug: string;
    route: string;
    type: PublicDocumentType;
    title: string;
    description: string;
};

export type PublicDocument = PublicDocumentSummary & {
    metadata: {
        title: string;
        description: string;
        keywords: string[];
    };
    hero: {
        title: string;
        description: string;
    };
    sections: Array<{
        key: string;
        type: "richText";
        title: string;
        subtitle: string | null;
        paragraphs: string[];
    }>;
};

export type PublicSearchResult = {
    slug: string;
    route: string;
    pageType: string;
    title: string;
    description: string;
};

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_ROUTE = /^\/[a-z0-9][a-z0-9/-]*$/;

function requiredText(value: unknown, field: string, maximum = 4_000): string {
    if (typeof value !== "string" || value.trim().length === 0 || value.length > maximum) {
        throw new Error(`${field} is invalid.`);
    }
    return value.trim();
}

function assertDocumentType(value: string): asserts value is PublicDocumentType {
    if (!PUBLIC_DOCUMENT_TYPES.includes(value as PublicDocumentType)) {
        throw new Error("Public document type is invalid.");
    }
}

function safeIdentity(slug: string, route: string, type: string) {
    assertDocumentType(type);
    if (!SAFE_SLUG.test(slug) || !SAFE_ROUTE.test(route) || !route.startsWith(`/${type === "article" ? "articles" : type}/`)) {
        throw new Error("Public document identity is invalid.");
    }
    return { slug, route, type };
}

const loadDocumentSnapshot = unstable_cache(
    async (type: PublicDocumentType, slug: string, language: PublicLanguage) =>
        prisma.page.findFirst({
            where: {
                pageType: type,
                slug,
                publishState: "published",
            },
            include: {
                translations: { where: { languageCode: language } },
                sections: {
                    where: { enabled: true },
                    orderBy: [{ order: "asc" }, { id: "asc" }],
                    include: {
                        translations: { where: { languageCode: language } },
                    },
                },
            },
        }),
    ["arandi-public-document-v3"],
    { tags: [PUBLIC_CONTENT_TAG], revalidate: 3_600 },
);

export async function findPublicDocumentListSnapshot(
    type: PublicDocumentType,
    language: PublicLanguage,
) {
    return prisma.page.findMany({
            where: {
                pageType: type,
                publishState: "published",
                translations: { some: { languageCode: language } },
            },
            orderBy: [{ updatedAt: "desc" }, { slug: "asc" }],
            include: {
                translations: { where: { languageCode: language } },
            },
        });
}

const loadDocumentListSnapshot = unstable_cache(
    findPublicDocumentListSnapshot,
    ["arandi-public-document-list-v1"],
    { tags: [PUBLIC_CONTENT_TAG], revalidate: 3_600 },
);

export async function findPublicSearchSnapshot(language: PublicLanguage) {
    return prisma.page.findMany({
            where: {
                publishState: "published",
                translations: { some: { languageCode: language } },
            },
            orderBy: [{ updatedAt: "desc" }, { slug: "asc" }],
            include: {
                translations: { where: { languageCode: language } },
                sections: {
                    where: { enabled: true },
                    orderBy: [{ order: "asc" }, { id: "asc" }],
                    include: {
                        translations: { where: { languageCode: language } },
                        cards: {
                            where: { publishState: "published" },
                            orderBy: [{ order: "asc" }, { id: "asc" }],
                            include: {
                                translations: { where: { languageCode: language } },
                            },
                        },
                    },
                },
            },
        });
}

const loadSearchSnapshot = unstable_cache(
    findPublicSearchSnapshot,
    ["arandi-public-search-v1"],
    { tags: [PUBLIC_CONTENT_TAG], revalidate: 3_600 },
);

export function mapPublicDocument(
    page: Awaited<ReturnType<typeof loadDocumentSnapshot>>,
): PublicDocument {
    if (!page) throw new Error("Published document is unavailable.");
    const identity = safeIdentity(page.slug, page.route, page.pageType);
    const translation = page.translations[0];
    if (!translation) throw new Error("Published document translation is unavailable.");
    const heroSection = page.sections.find((section) => section.sectionType.toLowerCase() === "hero");
    const heroTranslation = heroSection?.translations[0];
    if (!heroSection || !heroTranslation) throw new Error("Published document hero is incomplete.");

    const bodySections = page.sections
        .filter((section) => section.sectionType.toLowerCase() !== "hero")
        .map((section) => {
            if (section.sectionType.toLowerCase() !== "richtext") {
                throw new Error("Published document contains an unsupported Section type.");
            }
            const value = section.translations[0];
            if (!value) throw new Error("Published document Section translation is unavailable.");
            const description = requiredText(value.description, `${section.key}.description`);
            return {
                key: requiredText(section.key, "section.key", 120),
                type: "richText" as const,
                title: requiredText(value.title, `${section.key}.title`, 160),
                subtitle: value.subtitle ? requiredText(value.subtitle, `${section.key}.subtitle`, 240) : null,
                paragraphs: description
                    .split(/\r?\n\s*\r?\n/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean),
            };
        });
    if (bodySections.length === 0) throw new Error("Published document body is unavailable.");

    return {
        ...identity,
        title: requiredText(translation.title, "document.title", 160),
        description: requiredText(translation.seoDescription, "document.description", 500),
        metadata: {
            title: requiredText(translation.seoTitle, "document.seoTitle", 160),
            description: requiredText(translation.seoDescription, "document.seoDescription", 500),
            keywords: page.seoKeywords
                .filter((keyword) => keyword.length > 0 && keyword.length <= 60)
                .slice(0, 20),
        },
        hero: {
            title: requiredText(heroTranslation.title, "hero.title", 160),
            description: requiredText(heroTranslation.description, "hero.description", 500),
        },
        sections: bodySections,
    };
}

export async function getPublicDocument(
    type: PublicDocumentType,
    slug: string,
    language: PublicLanguage,
): Promise<PublicDocument> {
    if (!SAFE_SLUG.test(slug)) throw new Error("Document slug is invalid.");
    return mapPublicDocument(await loadDocumentSnapshot(type, slug, language));
}

export async function listPublicDocuments(
    type: PublicDocumentType,
    language: PublicLanguage,
): Promise<PublicDocumentSummary[]> {
    const pages = await loadDocumentListSnapshot(type, language);
    return mapPublicDocumentList(pages);
}

export function mapPublicDocumentList(
    pages: Awaited<ReturnType<typeof findPublicDocumentListSnapshot>>,
): PublicDocumentSummary[] {
    return pages.map((page) => {
        const identity = safeIdentity(page.slug, page.route, page.pageType);
        const translation = page.translations[0];
        if (!translation) throw new Error("Published document summary translation is unavailable.");
        return {
            ...identity,
            title: requiredText(translation.title, "summary.title", 160),
            description: requiredText(translation.seoDescription, "summary.description", 500),
        };
    });
}

export async function searchPublicContent(
    rawQuery: string,
    language: PublicLanguage,
): Promise<PublicSearchResult[]> {
    return mapPublicSearchResults(await loadSearchSnapshot(language), rawQuery, language);
}

export function mapPublicSearchResults(
    pages: Awaited<ReturnType<typeof findPublicSearchSnapshot>>,
    rawQuery: string,
    language: PublicLanguage,
): PublicSearchResult[] {
    const query = rawQuery.trim().toLocaleLowerCase(language === "fa" ? "fa" : "en");
    if (query.length < 2 || query.length > 100) return [];
    return pages.flatMap((page) => {
        if (!SAFE_SLUG.test(page.slug) || !SAFE_ROUTE.test(page.route)) return [];
        const translation = page.translations[0];
        if (!translation) return [];
        const haystack = [
            translation.title,
            translation.seoTitle,
            translation.seoDescription,
            ...page.seoKeywords,
            ...page.sections.flatMap((section) => [
                section.translations[0]?.title ?? "",
                section.translations[0]?.subtitle ?? "",
                section.translations[0]?.description ?? "",
                ...section.cards.flatMap((card) => [
                    card.translations[0]?.title ?? "",
                    card.translations[0]?.subtitle ?? "",
                    card.translations[0]?.description ?? "",
                ]),
            ]),
        ].join(" ").toLocaleLowerCase(language === "fa" ? "fa" : "en");
        if (!haystack.includes(query)) return [];
        return [{
            slug: page.slug,
            route: page.route,
            pageType: page.pageType,
            title: requiredText(translation.title, "search.title", 160),
            description: requiredText(translation.seoDescription, "search.description", 500),
        }];
    }).slice(0, 50);
}
