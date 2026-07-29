import type {
    CmsCardModel,
    CmsEntityCollection,
    CmsLocaleCode,
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

export interface CmsSiteRepository {
    getSite(): CmsSiteModel;
}

export interface CmsPageRepository {
    findBySlug(slug: string, locale: CmsLocaleCode): CmsPageModel | undefined;
    listByLocale(locale: CmsLocaleCode): CmsPageModel[];
    listVersions(pageId: string): CmsPageVersionModel[];
    listSections(pageVersionId: string): CmsPageSectionModel[];
}

export interface CmsCardRepository {
    listByIds(cardIds: string[]): CmsCardModel[];
    listByLocale(locale: CmsLocaleCode): CmsCardModel[];
}

export interface CmsThemeRepository {
    getDefault(siteId: string): CmsThemeModel | undefined;
    findBySlug(siteId: string, slug: string): CmsThemeModel | undefined;
}

export interface CmsNavigationRepository {
    findMenu(siteId: string, key: string, locale: CmsLocaleCode): CmsNavigationMenuModel | undefined;
}

export interface CmsTranslationRepository {
    findByEntity(entityType: string, entityId: string): CmsTranslationModel[];
}

export interface CmsMediaRepository {
    findById(mediaId: string): CmsMediaModel | undefined;
}

export interface CmsAccessRepository {
    listRoles(): CmsRoleModel[];
    listPermissions(): CmsPermissionModel[];
}

export interface CmsRepositories {
    site: CmsSiteRepository;
    page: CmsPageRepository;
    card: CmsCardRepository;
    theme: CmsThemeRepository;
    navigation: CmsNavigationRepository;
    translation: CmsTranslationRepository;
    media: CmsMediaRepository;
    access: CmsAccessRepository;
}

export interface CmsSeedRepository {
    getAll(): CmsEntityCollection;
}
