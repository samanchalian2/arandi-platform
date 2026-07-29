import type { Language } from "../company";
import type { CmsRepositories } from "./repositories";
import type {
    CmsCardModel,
    CmsLocaleCode,
    CmsNavigationMenuModel,
    CmsPageModel,
    CmsPageSectionModel,
    CmsPageVersionModel,
    CmsSiteModel,
    CmsThemeModel,
    CmsTranslatableField,
    CmsTranslationModel,
} from "./types";

export type CmsLocaleResolution = {
    requestedLocale: CmsLocaleCode;
    resolvedLocale: CmsLocaleCode;
    defaultLocale: CmsLocaleCode;
};

export type CmsResolvedPage = {
    locale: CmsLocaleResolution;
    page: CmsPageModel;
    version: CmsPageVersionModel;
    sections: CmsPageSectionModel[];
    cards: CmsCardModel[];
};

export type CmsPageBuilderModel = {
    pageId: string;
    pageVersionId: string;
    locale: CmsLocaleCode;
    sections: Array<{
        section: CmsPageSectionModel;
        cards: CmsCardModel[];
    }>;
};

export type CmsRuntimeSnapshot = {
    site: CmsSiteModel;
    theme?: CmsThemeModel;
    menu?: CmsNavigationMenuModel;
    resolvedPage?: CmsResolvedPage;
};

function normalizeLocale(locale?: string | null): Language {
    return locale === "fa" ? "fa" : "en";
}

function pickLocalizedValue(field: CmsTranslatableField, locale: CmsLocaleCode): string {
    const localized = field.values[locale];
    if (localized?.value) {
        return localized.value;
    }

    const fallback = field.values[field.fallbackLocale];
    if (fallback?.value) {
        return fallback.value;
    }

    const first = Object.values(field.values).find((value) => Boolean(value?.value));
    return first?.value ?? "";
}

export class CmsContentService {
    constructor(private readonly repositories: CmsRepositories) { }

    resolveLocale(requestedLocale?: string | null): CmsLocaleResolution {
        const site = this.repositories.site.getSite();
        const normalized = normalizeLocale(requestedLocale);
        const available = site.locales.map((locale) => String(locale));
        const resolvedLocale = available.includes(normalized) ? normalized : site.defaultLocale;

        return {
            requestedLocale: requestedLocale ?? site.defaultLocale,
            resolvedLocale,
            defaultLocale: site.defaultLocale,
        };
    }

    getPageBySlug(slug: string, requestedLocale?: string | null): CmsResolvedPage {
        const locale = this.resolveLocale(requestedLocale);
        const page = this.repositories.page.findBySlug(slug, locale.resolvedLocale);

        if (!page) {
            throw new Error(`CMS page not found for slug: ${slug} (${locale.resolvedLocale}).`);
        }

        const versions = this.repositories.page.listVersions(page.id);
        const publishedVersion = versions.find((version) => version.isPublished) ?? versions[0];

        if (!publishedVersion) {
            throw new Error(`No page version found for page: ${page.id}.`);
        }

        const sections = this.repositories.page.listSections(publishedVersion.id);
        const cards = this.repositories.card.listByLocale(locale.resolvedLocale);

        return {
            locale,
            page,
            version: publishedVersion,
            sections,
            cards,
        };
    }

    buildPageBuilderModel(slug: string, requestedLocale?: string | null): CmsPageBuilderModel {
        const resolvedPage = this.getPageBySlug(slug, requestedLocale);

        return {
            pageId: resolvedPage.page.id,
            pageVersionId: resolvedPage.version.id,
            locale: resolvedPage.locale.resolvedLocale,
            sections: resolvedPage.sections.map((section) => ({
                section,
                cards: this.repositories.card.listByIds(section.cardIds),
            })),
        };
    }

    getNavigationMenu(key: string, requestedLocale?: string | null): CmsNavigationMenuModel | undefined {
        const locale = this.resolveLocale(requestedLocale);
        const site = this.repositories.site.getSite();
        return this.repositories.navigation.findMenu(site.id, key, locale.resolvedLocale);
    }

    getActiveTheme(themeSlug?: string): CmsThemeModel | undefined {
        const site = this.repositories.site.getSite();
        if (themeSlug) {
            return this.repositories.theme.findBySlug(site.id, themeSlug);
        }

        return this.repositories.theme.getDefault(site.id);
    }

    getTranslations(entityType: string, entityId: string): CmsTranslationModel[] {
        return this.repositories.translation.findByEntity(entityType, entityId);
    }

    createRuntimeSnapshot(slug: string, requestedLocale?: string | null): CmsRuntimeSnapshot {
        const site = this.repositories.site.getSite();
        return {
            site,
            theme: this.getActiveTheme(),
            menu: this.getNavigationMenu("main", requestedLocale),
            resolvedPage: this.getPageBySlug(slug, requestedLocale),
        };
    }

    // Utility for mapping translatable fields in adapters/services.
    readText(field: CmsTranslatableField, requestedLocale?: string | null): string {
        const locale = this.resolveLocale(requestedLocale);
        return pickLocalizedValue(field, locale.resolvedLocale);
    }
}
