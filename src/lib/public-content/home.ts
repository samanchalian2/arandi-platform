import "server-only";

import { unstable_cache } from "next/cache";

import type { AppPageContent } from "@/content/adapters/types";
import type {
    ChatSectionSchema,
    FeaturesSectionSchema,
    HeroSectionSchema,
} from "@/content/adapters/schemas";
import { contentProvider } from "@/content/provider";
import { prisma } from "@/lib/prisma";

import {
    PUBLIC_CONTENT_TAG,
    PUBLIC_HOME_TAG,
    PUBLIC_NAVIGATION_TAG,
    PUBLIC_SETTINGS_TAG,
} from "./cache";
import { findPublishedPageBySlug } from "./pages";

type PublicLanguage = "en" | "fa";
export type PublicChromeContent = Pick<AppPageContent, "company" | "footer" | "navigation">;
type PublishedPage = NonNullable<Awaited<ReturnType<typeof findPublishedPageBySlug>>>;
type PublishedSection = PublishedPage["sections"][number];

function asRecord(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function requiredText(record: Record<string, unknown>, key: string): string {
    const value = record[key];
    if (typeof value !== "string" || value.trim().length === 0 || value.length > 4_000) {
        throw new Error(`Published Home field ${key} is invalid.`);
    }
    return value;
}

function isoTimestamp(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error("Published content contains an invalid timestamp.");
    }
    return date.toISOString();
}

function localizedCompany(
    value: unknown,
    language: PublicLanguage,
): Pick<AppPageContent, "company" | "footer"> {
    const root = asRecord(value);
    const localized = root ? asRecord(root[language]) : null;
    if (!localized) {
        throw new Error(`Published company settings are incomplete for ${language}.`);
    }
    return {
        company: {
            name: requiredText(localized, "name"),
            shortName: requiredText(localized, "shortName"),
            assistantName: requiredText(localized, "assistantName"),
            assistantLabel: requiredText(localized, "assistantLabel"),
        },
        footer: {
            tagline: requiredText(localized, "footerTagline"),
        },
    };
}

const loadPublishedHomePage = unstable_cache(
    (language: PublicLanguage) => findPublishedPageBySlug("home", language),
    ["arandi-public-home-page-v4"],
    {
        tags: [PUBLIC_CONTENT_TAG, PUBLIC_HOME_TAG],
        revalidate: 3_600,
    },
);

const loadPublicChromeSnapshot = unstable_cache(
    async (language: PublicLanguage) => {
        const [navigation, companySetting] = await Promise.all([
            prisma.navigation.findMany({
                orderBy: [{ order: "asc" }, { id: "asc" }],
                include: {
                    translations: {
                        where: { languageCode: language },
                    },
                },
            }),
            prisma.setting.findFirst({
                where: {
                    key: "site.company",
                    isPublic: true,
                },
                select: { value: true },
            }),
        ]);
        return { navigation, companySetting };
    },
    ["arandi-public-chrome-v1"],
    {
        tags: [PUBLIC_CONTENT_TAG, PUBLIC_NAVIGATION_TAG, PUBLIC_SETTINGS_TAG],
        revalidate: 3_600,
    },
);

export async function getPublicChromeContent(
    language: PublicLanguage,
): Promise<PublicChromeContent> {
    const { navigation, companySetting } = await loadPublicChromeSnapshot(language);
    if (!companySetting) throw new Error("Public company settings are unavailable.");
    const navigationLabels = Object.fromEntries(
        navigation.map((item) => [item.key, item.translations[0]?.label]),
    );
    for (const key of ["company", "services", "solutions", "industries", "projects", "contact"]) {
        if (typeof navigationLabels[key] !== "string" || navigationLabels[key].length === 0) {
            throw new Error(`Published navigation item ${key} is incomplete for ${language}.`);
        }
    }
    return {
        ...localizedCompany(companySetting.value, language),
        navigation: {
            links: {
                overview: language === "fa" ? "معرفی" : "Overview",
                capabilities: language === "fa" ? "توانمندی‌ها" : "Capabilities",
                contact: navigationLabels.contact,
            },
            enterpriseLinks: {
                company: navigationLabels.company,
                services: navigationLabels.services,
                solutions: navigationLabels.solutions,
                industries: navigationLabels.industries,
                projects: navigationLabels.projects,
                contact: navigationLabels.contact,
            },
            languageSwitch: { en: "EN", fa: "FA" },
        },
    };
}

function createHeroSection(
    section: PublishedSection,
    language: PublicLanguage,
): HeroSectionSchema {
    const translation = section.translations[0];
    const data = asRecord(translation?.data);
    if (!translation || !data) throw new Error(`Published hero translation is missing for ${language}.`);
    return {
        id: section.key,
        visibility: { enabled: true },
        order: section.order,
        content: {
            badge: requiredText(data, "badge"),
            title: requiredText(data, "title"),
            description: requiredText(data, "description"),
            primaryCta: requiredText(data, "primaryCta"),
            secondaryCta: requiredText(data, "secondaryCta"),
        },
        appearance: { theme: "hero", variant: "default" },
        cms: {
            id: section.id,
            source: "prisma",
            version: 1,
            updatedAt: isoTimestamp(section.updatedAt),
            locale: language,
        },
    };
}

function createChatSection(
    section: PublishedSection,
    language: PublicLanguage,
): ChatSectionSchema {
    const translation = section.translations[0];
    const data = asRecord(translation?.data);
    if (!translation || !data) throw new Error(`Published chat translation is missing for ${language}.`);
    return {
        id: section.key,
        visibility: { enabled: true },
        order: section.order,
        content: {
            badge: requiredText(data, "badge"),
            heading: requiredText(data, "heading"),
            description: requiredText(data, "description"),
            placeholder: requiredText(data, "placeholder"),
            initialMessage: requiredText(data, "initialMessage"),
            emptyStateTitle: requiredText(data, "emptyStateTitle"),
            emptyStateDescription: requiredText(data, "emptyStateDescription"),
            inputLabel: requiredText(data, "inputLabel"),
            inputPlaceholder: requiredText(data, "inputPlaceholder"),
            inputAriaLabel: requiredText(data, "inputAriaLabel"),
            loadingText: requiredText(data, "loadingText"),
            assistantReply: requiredText(data, "assistantReply"),
            assistantHint: requiredText(data, "assistantHint"),
        },
        appearance: { theme: "chat", variant: "default" },
        cms: {
            id: section.id,
            source: "prisma",
            version: 1,
            updatedAt: isoTimestamp(section.updatedAt),
            locale: language,
        },
    };
}

function createFeaturesSection(
    section: PublishedSection,
    language: PublicLanguage,
): FeaturesSectionSchema {
    const translation = section.translations[0];
    const data = asRecord(translation?.data);
    if (!translation || !data) throw new Error(`Published features translation is missing for ${language}.`);
    return {
        id: section.key,
        visibility: { enabled: true },
        order: section.order,
        content: {
            eyebrow: requiredText(data, "eyebrow"),
            title: requiredText(data, "title"),
            description: requiredText(data, "description"),
            cards: section.cards.map((card) => {
                const cardTranslation = card.translations[0];
                if (!cardTranslation) {
                    throw new Error(`Published Card translation is missing for ${language}.`);
                }
                return {
                    title: cardTranslation.title,
                    description: cardTranslation.description ?? "",
                    label: cardTranslation.statusBadge ?? "",
                };
            }),
        },
        appearance: { theme: "features", variant: "default" },
        cms: {
            id: section.id,
            source: "prisma",
            version: 1,
            updatedAt: isoTimestamp(section.updatedAt),
            locale: language,
        },
    };
}

async function buildPublishedHomepage(language: PublicLanguage): Promise<AppPageContent> {
    const [page, chrome] = await Promise.all([
        loadPublishedHomePage(language),
        getPublicChromeContent(language),
    ]);
    if (!page) throw new Error("Published Home is unavailable.");
    const pageTranslation = page.translations[0];
    if (!pageTranslation) throw new Error(`Published Home translation is missing for ${language}.`);

    const heroSection = page.sections.find((section) => section.sectionType === "hero");
    const featuresSection = page.sections.find((section) => section.sectionType === "features");
    const chatSection = page.sections.find((section) => section.sectionType === "chat");
    if (!heroSection || !featuresSection || !chatSection) {
        throw new Error("Published Home requires hero, features, and chat Sections.");
    }

    const hero = createHeroSection(heroSection, language);
    const features = createFeaturesSection(featuresSection, language);
    const chat = createChatSection(chatSection, language);

    return {
        language,
        ...chrome,
        hero,
        features,
        chat,
        metadata: {
            title: pageTranslation.seoTitle,
            description: pageTranslation.seoDescription,
            keywords: page.seoKeywords,
        },
    };
}

export async function getPublicHomepageContent(
    language: PublicLanguage,
): Promise<AppPageContent> {
    try {
        return await buildPublishedHomepage(language);
    } catch {
        if (
            process.env.NODE_ENV !== "production"
            && process.env.ARANDI_PUBLIC_CONTENT_SOURCE === "local"
        ) {
            console.warn("Using the explicitly selected local public-content provider.");
            return contentProvider.getPageContent(language);
        }
        throw new Error("Published Home content is unavailable.");
    }
}
