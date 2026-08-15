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
import { sectionVisibility } from "./visibility";

type PublicLanguage = "en" | "fa";
export type PublicSocialLinks = Record<"instagram" | "telegram" | "whatsapp" | "bale", string | null>;
export type PublicFooterContent = {
    tagline: string;
    contact: { email: string; phone: string; address: string; mapUrl: string | null };
    social: PublicSocialLinks;
};
type PublicHeroMedia = {
    url: string;
    posterUrl: string | null;
};
export type PublicChromeContent = Omit<Pick<AppPageContent, "company" | "navigation">, "footer"> & { footer: PublicFooterContent };
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

function optionalUrl(value: unknown, allowedHosts: readonly string[]): string | null {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string" || value.length > 2_048) return null;
    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
        if (url.protocol !== "https:" || !allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) return null;
        return url.toString();
    } catch {
        return null;
    }
}

function googleMapsUrl(value: unknown): string | null {
    if (typeof value !== "string" || value.length === 0 || value.length > 2_048) return null;
    return /^https:\/\/(?:www\.)?google\.com\/maps\//i.test(value) ? value : null;
}

function safeRootRelativeAsset(value: unknown, extensions: readonly string[]): string | null {
    if (typeof value !== "string" || value.length === 0 || value.length > 500) return null;
    if (!value.startsWith("/") || value.startsWith("//") || value.includes("..") || value.includes("?") || value.includes("#")) return null;
    const normalized = value.toLowerCase();
    return extensions.some((extension) => normalized.endsWith(extension)) ? value : null;
}

function localizedHeroMedia(value: unknown): PublicHeroMedia | null {
    const record = asRecord(value);
    if (!record || record.enabled !== true) return null;
    const url = safeRootRelativeAsset(record.videoUrl, [".webm", ".mp4"]);
    const posterUrl = safeRootRelativeAsset(record.posterUrl, [".jpg", ".jpeg", ".png", ".webp"]);
    return url ? { url, posterUrl } : null;
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
): Pick<AppPageContent, "company"> & { footer: Pick<PublicFooterContent, "tagline"> } {
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

function localizedFooterDetails(contactValue: unknown, socialValue: unknown, language: PublicLanguage): Pick<PublicFooterContent, "contact" | "social"> {
    const contact = asRecord(asRecord(contactValue)?.[language]);
    if (!contact) throw new Error(`Published contact settings are incomplete for ${language}.`);
    const social = asRecord(socialValue) ?? {};
    return {
        contact: {
            email: requiredText(contact, "email"),
            phone: requiredText(contact, "phone"),
            address: requiredText(contact, "address"),
            mapUrl: googleMapsUrl(contact.mapUrl),
        },
        social: {
            instagram: optionalUrl(social.instagram, ["instagram.com"]),
            telegram: optionalUrl(social.telegram, ["t.me", "telegram.me", "telegram.org"]),
            whatsapp: optionalUrl(social.whatsapp, ["wa.me", "whatsapp.com"]),
            bale: optionalUrl(social.bale, ["ble.ir", "bale.ai"]),
        },
    };
}

const loadPublishedHomePage = unstable_cache(
    (language: PublicLanguage) => prisma.page.findFirst({
        where: {
            slug: "home",
            publishState: "published",
        },
        include: {
            translations: { where: { languageCode: language } },
            // Home needs the complete section set so an Admin can disable an
            // individual section without making the page data invalid. The
            // page component applies each section's visibility flag.
            sections: {
                orderBy: [{ order: "asc" }, { id: "asc" }],
                include: {
                    translations: { where: { languageCode: language } },
                    cards: {
                        where: { publishState: "published" },
                        orderBy: [{ order: "asc" }, { id: "asc" }],
                        include: {
                            translations: { where: { languageCode: language } },
                            media: true,
                        },
                    },
                },
            },
        },
    }),
    ["arandi-public-home-page-v4"],
    {
        tags: [PUBLIC_CONTENT_TAG, PUBLIC_HOME_TAG],
        revalidate: 3_600,
    },
);

const loadPublishedHeroMedia = unstable_cache(
    async () => prisma.setting.findFirst({
        where: { key: "site.heroMedia", isPublic: true },
        select: { value: true },
    }),
    ["arandi-public-hero-media-v2"],
    {
        tags: [PUBLIC_CONTENT_TAG, PUBLIC_HOME_TAG, PUBLIC_SETTINGS_TAG],
        revalidate: 3_600,
    },
);

const loadPublicChromeSnapshot = unstable_cache(
    async (language: PublicLanguage) => {
        const [navigation, companySetting, contactSetting, socialSetting] = await Promise.all([
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
            prisma.setting.findFirst({ where: { key: "site.contact", isPublic: true }, select: { value: true } }),
            prisma.setting.findFirst({ where: { key: "site.social", isPublic: true }, select: { value: true } }),
        ]);
        return { navigation, companySetting, contactSetting, socialSetting };
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
    const { navigation, companySetting, contactSetting, socialSetting } = await loadPublicChromeSnapshot(language);
    if (!companySetting || !contactSetting || !socialSetting) throw new Error("Public chrome settings are unavailable.");
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
        footer: {
            ...localizedCompany(companySetting.value, language).footer,
            ...localizedFooterDetails(contactSetting.value, socialSetting.value, language),
        },
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
    backgroundVideo: PublicHeroMedia | null,
): HeroSectionSchema {
    const translation = section.translations[0];
    const data = asRecord(translation?.data);
    if (!translation || !data) throw new Error(`Published hero translation is missing for ${language}.`);
    return {
        id: section.key,
        visibility: sectionVisibility(section.enabled),
        order: section.order,
        content: {
            badge: requiredText(data, "badge"),
            title: requiredText(data, "title"),
            description: requiredText(data, "description"),
            primaryCta: requiredText(data, "primaryCta"),
            secondaryCta: requiredText(data, "secondaryCta"),
            ...(backgroundVideo ? { backgroundVideo } : {}),
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
        visibility: sectionVisibility(section.enabled),
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
        visibility: sectionVisibility(section.enabled),
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
    const [page, chrome, heroMediaSetting] = await Promise.all([
        loadPublishedHomePage(language),
        getPublicChromeContent(language),
        loadPublishedHeroMedia(),
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

    const hero = createHeroSection(heroSection, language, localizedHeroMedia(heroMediaSetting?.value));
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
