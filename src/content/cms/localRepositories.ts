import { getDomainContentModel } from "../domain";
import type { Language } from "../company";
import { mapDomainToCmsCollection } from "./localMappers";
import type {
    CmsCardModel,
    CmsEntityCollection,
    CmsNavigationMenuModel,
    CmsPageModel,
    CmsPageSectionModel,
    CmsPageVersionModel,
    CmsPermissionModel,
    CmsRoleModel,
    CmsSiteModel,
    CmsThemeModel,
    CmsTranslationModel,
    CmsMediaModel,
} from "./types";
import type { CmsRepositories } from "./repositories";

function normalizeLocale(locale?: string | null): Language {
    return locale === "fa" ? "fa" : "en";
}

function mergeCollections(collections: CmsEntityCollection[]): CmsEntityCollection {
    const [first] = collections;
    if (!first) {
        throw new Error("CMS seed collection is empty.");
    }

    return {
        site: first.site,
        themes: collections.flatMap((collection) => collection.themes),
        pages: collections.flatMap((collection) => collection.pages),
        pageVersions: collections.flatMap((collection) => collection.pageVersions),
        sections: collections.flatMap((collection) => collection.sections),
        blocks: collections.flatMap((collection) => collection.blocks),
        cards: collections.flatMap((collection) => collection.cards),
        menus: collections.flatMap((collection) => collection.menus),
        media: collections.flatMap((collection) => collection.media),
        translations: collections.flatMap((collection) => collection.translations),
        roles: first.roles,
        permissions: first.permissions,
    };
}

function createSeedCollection(): CmsEntityCollection {
    return mergeCollections([
        mapDomainToCmsCollection(getDomainContentModel("en")),
        mapDomainToCmsCollection(getDomainContentModel("fa")),
    ]);
}

class LocalCmsStore {
    constructor(private readonly collection: CmsEntityCollection) { }

    get site(): CmsSiteModel {
        return this.collection.site;
    }

    get pages(): CmsPageModel[] {
        return this.collection.pages;
    }

    get pageVersions(): CmsPageVersionModel[] {
        return this.collection.pageVersions;
    }

    get sections(): CmsPageSectionModel[] {
        return this.collection.sections;
    }

    get cards(): CmsCardModel[] {
        return this.collection.cards;
    }

    get themes(): CmsThemeModel[] {
        return this.collection.themes;
    }

    get menus(): CmsNavigationMenuModel[] {
        return this.collection.menus;
    }

    get translations(): CmsTranslationModel[] {
        return this.collection.translations;
    }

    get media(): CmsMediaModel[] {
        return this.collection.media;
    }

    get roles(): CmsRoleModel[] {
        return this.collection.roles;
    }

    get permissions(): CmsPermissionModel[] {
        return this.collection.permissions;
    }

    get all(): CmsEntityCollection {
        return this.collection;
    }
}

export function createCmsRepositoriesFromCollection(collection: CmsEntityCollection): CmsRepositories {
    const store = new LocalCmsStore(collection);

    return {
        site: {
            getSite: () => store.site,
        },
        page: {
            findBySlug: (slug, locale) => {
                const normalized = normalizeLocale(String(locale));
                return store.pages.find((page) => page.slug === slug && page.locale === normalized);
            },
            listByLocale: (locale) => {
                const normalized = normalizeLocale(String(locale));
                return store.pages.filter((page) => page.locale === normalized);
            },
            listVersions: (pageId) => store.pageVersions.filter((version) => version.pageId === pageId),
            listSections: (pageVersionId) =>
                store.sections.filter((section) => section.pageVersionId === pageVersionId).sort((a, b) => a.order - b.order),
        },
        card: {
            listByIds: (cardIds) => {
                const idSet = new Set(cardIds);
                return store.cards.filter((card) => idSet.has(card.id));
            },
            listByLocale: (locale) => {
                const normalized = normalizeLocale(String(locale));
                return store.cards.filter((card) => card.locale === normalized);
            },
        },
        theme: {
            getDefault: (siteId) => store.themes.find((theme) => theme.siteId === siteId && theme.isDefault),
            findBySlug: (siteId, slug) => store.themes.find((theme) => theme.siteId === siteId && theme.slug === slug),
        },
        navigation: {
            findMenu: (siteId, key, locale) => {
                const normalized = normalizeLocale(String(locale));
                return store.menus.find((menu) => menu.siteId === siteId && menu.key === key && menu.locale === normalized);
            },
        },
        translation: {
            findByEntity: (entityType, entityId) =>
                store.translations.filter((translation) => translation.entityType === entityType && translation.entityId === entityId),
        },
        media: {
            findById: (mediaId) => store.media.find((asset) => asset.id === mediaId),
        },
        access: {
            listRoles: () => store.roles,
            listPermissions: () => store.permissions,
        },
    };
}

export function createLocalCmsRepositories(): CmsRepositories {
    return createCmsRepositoriesFromCollection(createSeedCollection());
}
