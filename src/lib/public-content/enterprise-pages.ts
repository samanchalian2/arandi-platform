import { unstable_cache } from "next/cache";

import { getEnterpriseContent, type EnterpriseContentModel } from "@/content/enterprise";

import { PUBLIC_CONTENT_TAG } from "./cache";
import { findPublishedPageBySlug } from "./pages";

export type EnterpriseCollectionKey = "services" | "solutions" | "industries" | "projects";
export type EnterpriseCollectionPage<K extends EnterpriseCollectionKey> =
    EnterpriseContentModel["pages"][K];

type PublicLanguage = "en" | "fa";
type PublishedPage = NonNullable<Awaited<ReturnType<typeof findPublishedPageBySlug>>>;
type PublishedCard = PublishedPage["sections"][number]["cards"][number];

export function publicPageTag(slug: string): string {
    return `public-page:${slug}`;
}

const pageLoaders: Record<
    EnterpriseCollectionKey,
    (language: PublicLanguage) => Promise<Awaited<ReturnType<typeof findPublishedPageBySlug>>>
> = {
    services: unstable_cache(
        (language: PublicLanguage) => findPublishedPageBySlug("services", language),
        ["arandi-public-services-v3"],
        { tags: [PUBLIC_CONTENT_TAG, publicPageTag("services")], revalidate: 3_600 },
    ),
    solutions: unstable_cache(
        (language: PublicLanguage) => findPublishedPageBySlug("solutions", language),
        ["arandi-public-solutions-v1"],
        { tags: [PUBLIC_CONTENT_TAG, publicPageTag("solutions")], revalidate: 3_600 },
    ),
    industries: unstable_cache(
        (language: PublicLanguage) => findPublishedPageBySlug("industries", language),
        ["arandi-public-industries-v1"],
        { tags: [PUBLIC_CONTENT_TAG, publicPageTag("industries")], revalidate: 3_600 },
    ),
    projects: unstable_cache(
        (language: PublicLanguage) => findPublishedPageBySlug("projects", language),
        ["arandi-public-projects-v2"],
        { tags: [PUBLIC_CONTENT_TAG, publicPageTag("projects")], revalidate: 3_600 },
    ),
};

function asRecord(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`${field} must be a published object.`);
    }
    return value as Record<string, unknown>;
}

function text(record: Record<string, unknown>, key: string, field: string): string {
    const value = record[key];
    if (typeof value !== "string" || value.trim().length === 0 || value.length > 4_000) {
        throw new Error(`${field}.${key} is invalid.`);
    }
    return value;
}

function textObject<const K extends readonly string[]>(
    value: unknown,
    field: string,
    keys: K,
): { [P in K[number]]: string } {
    const record = asRecord(value, field);
    return Object.fromEntries(
        keys.map((key) => [key, text(record, key, field)]),
    ) as { [P in K[number]]: string };
}

function sourceKey(card: PublishedCard): string {
    const payload = asRecord(card.payload, "Card.payload");
    const value = payload.sourceKey;
    if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
        throw new Error("Published Card sourceKey is invalid.");
    }
    return value;
}

function basePayload(page: PublishedPage) {
    const translation = page.translations[0];
    const section = page.sections.find((item) => item.key === `${page.slug}-catalog`);
    const sectionTranslation = section?.translations[0];
    if (!translation || !section || !sectionTranslation) {
        throw new Error(`Published ${page.slug} content is incomplete.`);
    }
    const data = asRecord(sectionTranslation.data, `${page.slug}.data`);
    const breadcrumbLabel = text(data, "breadcrumbLabel", page.slug);
    const hero = textObject(
        data.hero,
        `${page.slug}.hero`,
        ["badge", "title", "description", "primaryAction", "secondaryAction"],
    );
    const cta = textObject(
        data.cta,
        `${page.slug}.cta`,
        ["eyebrow", "title", "description", "action"],
    );
    return {
        metadata: {
            title: translation.seoTitle,
            description: translation.seoDescription,
        },
        breadcrumbLabel,
        hero,
        cta,
        section,
        data,
    };
}

function cardText(card: PublishedCard, language: PublicLanguage) {
    const translation = card.translations[0];
    if (!translation || !translation.title || !translation.description) {
        throw new Error(`Published Card translation is incomplete for ${language}.`);
    }
    return {
        id: sourceKey(card),
        title: translation.title,
        summary: translation.description,
        subtitle: translation.subtitle,
        badge: translation.statusBadge,
        mediaUrl: card.media?.url,
        mediaAlt: card.media?.alt ?? translation.title,
    };
}

export function mapPublishedEnterprisePage<K extends EnterpriseCollectionKey>(
    key: K,
    page: PublishedPage,
    language: PublicLanguage,
): EnterpriseCollectionPage<K> {
    const base = basePayload(page);
    switch (key) {
        case "services": {
            const section = textObject(
                base.data.section,
                "services.section",
                ["eyebrow", "title", "description"],
            );
            const cards = base.section.cards.map((card) => {
                const mapped = cardText(card, language);
                if (!mapped.badge) throw new Error("Published Service Card label is missing.");
                return {
                    id: mapped.id,
                    label: mapped.badge,
                    title: mapped.title,
                    summary: mapped.summary,
                };
            });
            return {
                metadata: base.metadata,
                breadcrumbLabel: base.breadcrumbLabel,
                hero: base.hero,
                section,
                cards,
                cta: base.cta,
            } as EnterpriseCollectionPage<K>;
        }
        case "solutions": {
            const catalog = textObject(
                base.data.catalog,
                "solutions.catalog",
                ["eyebrow", "title", "description"],
            );
            const deliveryRecord = asRecord(base.data.delivery, "solutions.delivery");
            const rawSteps = deliveryRecord.steps;
            if (!Array.isArray(rawSteps) || rawSteps.length === 0 || rawSteps.length > 20) {
                throw new Error("solutions.delivery.steps is invalid.");
            }
            const delivery = {
                eyebrow: text(deliveryRecord, "eyebrow", "solutions.delivery"),
                title: text(deliveryRecord, "title", "solutions.delivery"),
                steps: rawSteps.map((step, index) => {
                    const value = textObject(
                        step,
                        `solutions.delivery.steps.${index}`,
                        ["key", "label", "text"],
                    );
                    return { key: value.key, label: value.label, text: value.text };
                }),
            };
            const cards = base.section.cards.map((card) => {
                const mapped = cardText(card, language);
                if (!mapped.subtitle) throw new Error("Published Solution Card outcome is missing.");
                return {
                    id: mapped.id,
                    title: mapped.title,
                    summary: mapped.summary,
                    outcome: mapped.subtitle,
                };
            });
            return {
                metadata: base.metadata,
                breadcrumbLabel: base.breadcrumbLabel,
                hero: base.hero,
                catalog: { ...catalog, cards },
                delivery,
                cta: base.cta,
            } as EnterpriseCollectionPage<K>;
        }
        case "industries": {
            const sectionText = textObject(
                base.data.section,
                "industries.section",
                ["eyebrow", "title", "description"],
            );
            const cards = base.section.cards.map((card) => {
                const mapped = cardText(card, language);
                return { id: mapped.id, title: mapped.title, summary: mapped.summary };
            });
            return {
                metadata: base.metadata,
                breadcrumbLabel: base.breadcrumbLabel,
                hero: base.hero,
                section: { ...sectionText, cards },
                cta: base.cta,
            } as EnterpriseCollectionPage<K>;
        }
        case "projects": {
            const section = textObject(
                base.data.section,
                "projects.section",
                ["eyebrow", "title", "description"],
            );
            const cards = base.section.cards.map((card) => {
                const mapped = cardText(card, language);
                if (!mapped.subtitle) throw new Error("Published Project Card impact is missing.");
                return {
                    id: mapped.id,
                    title: mapped.title,
                    summary: mapped.summary,
                    impact: mapped.subtitle,
                    mediaUrl: mapped.mediaUrl,
                    mediaAlt: mapped.mediaAlt,
                };
            });
            return {
                metadata: base.metadata,
                breadcrumbLabel: base.breadcrumbLabel,
                hero: base.hero,
                section: { ...section, cards },
                cta: base.cta,
            } as EnterpriseCollectionPage<K>;
        }
    }
}

export async function getPublicEnterprisePage<K extends EnterpriseCollectionKey>(
    key: K,
    language: PublicLanguage,
): Promise<EnterpriseCollectionPage<K>> {
    try {
        const page = await pageLoaders[key](language);
        if (!page) throw new Error(`Published ${key} Page is unavailable.`);
        return mapPublishedEnterprisePage(key, page, language);
    } catch {
        if (
            process.env.NODE_ENV !== "production"
            && process.env.ARANDI_PUBLIC_CONTENT_SOURCE === "local"
        ) {
            return getEnterpriseContent(language).pages[key];
        }
        throw new Error(`Published ${key} content is unavailable.`);
    }
}
