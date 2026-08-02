import type {
    Card,
    CardTranslation,
    Media,
    Navigation,
    NavigationTranslation,
    Page,
    PageTranslation,
    Section,
    SectionTranslation,
    Theme,
} from "@prisma/client";

import type { CmsLang } from "./validation";

function pickTranslation<T extends { languageCode: string }>(translations: T[], lang: CmsLang): T | undefined {
    return translations.find((item) => item.languageCode === lang) ?? translations[0];
}

export function mapPage(
    page: Page & { translations: PageTranslation[] },
    lang: CmsLang,
    includeTranslations: boolean,
) {
    const translation = pickTranslation(page.translations, lang);

    return {
        id: page.id,
        slug: page.slug,
        route: page.route,
        pageType: page.pageType,
        status: page.publishState,
        ordering: page.updatedAt,
        language: lang,
        metadata: {
            seoTitle: translation?.seoTitle ?? "",
            seoDescription: translation?.seoDescription ?? "",
            seoKeywords: page.seoKeywords,
        },
        translation: translation
            ? {
                languageCode: translation.languageCode,
                title: translation.title,
                seoTitle: translation.seoTitle,
                seoDescription: translation.seoDescription,
            }
            : null,
        translations: includeTranslations
            ? page.translations.map((item) => ({
                languageCode: item.languageCode,
                title: item.title,
                seoTitle: item.seoTitle,
                seoDescription: item.seoDescription,
            }))
            : undefined,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
    };
}

export function mapSection(
    section: Section & { translations: SectionTranslation[] },
    lang: CmsLang,
    includeTranslations: boolean,
) {
    const translation = pickTranslation(section.translations, lang);

    return {
        id: section.id,
        pageId: section.pageId,
        key: section.key,
        type: section.sectionType,
        order: section.order,
        visibility: {
            enabled: section.enabled,
        },
        style: section.style,
        payload: section.payload,
        language: lang,
        translation: translation
            ? {
                languageCode: translation.languageCode,
                title: translation.title,
                subtitle: translation.subtitle,
                description: translation.description,
                data: translation.data,
            }
            : null,
        translations: includeTranslations
            ? section.translations.map((item) => ({
                languageCode: item.languageCode,
                title: item.title,
                subtitle: item.subtitle,
                description: item.description,
                data: item.data,
            }))
            : undefined,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
    };
}

export function mapCard(
    card: Card & { translations: CardTranslation[]; media: Media | null },
    lang: CmsLang,
    includeTranslations: boolean,
) {
    const translation = pickTranslation(card.translations, lang);

    return {
        id: card.id,
        key: card.key,
        sectionId: card.sectionId,
        variant: card.variant,
        order: card.order,
        active: card.publishState === "published",
        status: card.publishState,
        publishState: card.publishState,
        image: card.media
            ? {
                id: card.media.id,
                url: card.media.url,
                type: card.media.type,
                width: card.media.width,
                height: card.media.height,
                alt: card.media.alt,
                caption: card.media.caption,
            }
            : null,
        tags: card.tags,
        metrics: card.metrics,
        payload: card.payload,
        language: lang,
        translation: translation
            ? {
                languageCode: translation.languageCode,
                title: translation.title,
                subtitle: translation.subtitle,
                description: translation.description,
                statusBadge: translation.statusBadge,
                ctaLabel: translation.ctaLabel,
                ctaHref: translation.ctaHref,
            }
            : null,
        translations: includeTranslations
            ? card.translations.map((item) => ({
                languageCode: item.languageCode,
                title: item.title,
                subtitle: item.subtitle,
                description: item.description,
                statusBadge: item.statusBadge,
                ctaLabel: item.ctaLabel,
                ctaHref: item.ctaHref,
            }))
            : undefined,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
    };
}

export function mapTheme(theme: Theme) {
    const tokens = (theme.tokens as Record<string, unknown>) ?? {};

    return {
        id: theme.id,
        slug: theme.slug,
        name: theme.name,
        isDefault: theme.isDefault,
        colors: (tokens.colors as Record<string, string>) ?? {},
        typography: (tokens.typography as Record<string, string>) ?? {},
        spacing: (tokens.spacing as Record<string, string>) ?? {},
        radius: (tokens.radius as Record<string, string>) ?? {},
        shadows: (tokens.shadows as Record<string, string>) ?? {},
        semanticTokens: theme.semanticTokens,
        componentOverrides: theme.componentOverrides,
        createdAt: theme.createdAt,
        updatedAt: theme.updatedAt,
    };
}

export function mapNavigation(
    navigation: Navigation & { translations: NavigationTranslation[] },
    lang: CmsLang,
    includeTranslations: boolean,
) {
    const translation = pickTranslation(navigation.translations, lang);

    return {
        id: navigation.id,
        key: navigation.key,
        href: navigation.href,
        order: navigation.order,
        isExternal: navigation.isExternal,
        openInNewTab: navigation.openInNewTab,
        label: translation?.label ?? "",
        language: lang,
        translations: includeTranslations
            ? navigation.translations.map((item) => ({
                languageCode: item.languageCode,
                label: item.label,
            }))
            : undefined,
        createdAt: navigation.createdAt,
        updatedAt: navigation.updatedAt,
    };
}
