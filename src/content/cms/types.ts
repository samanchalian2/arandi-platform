import type { Language } from "../company";

export type CmsLocaleCode = Language | string;

export type CmsPublishState = "draft" | "in_review" | "approved" | "published" | "archived";

export type TranslationStatus = "missing" | "draft" | "reviewed" | "published";

export type CmsAuditInfo = {
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    publishedAt?: string;
    archivedAt?: string;
    version: number;
};

export type CmsLocalizedText = {
    value: string;
    status: TranslationStatus;
};

export type CmsTranslationMap = Partial<Record<CmsLocaleCode, CmsLocalizedText>>;

export type CmsTranslatableField = {
    fallbackLocale: CmsLocaleCode;
    values: CmsTranslationMap;
};

export type CmsThemeTokenSet = {
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    spacing?: Record<string, string>;
    radius?: Record<string, string>;
    elevation?: Record<string, string>;
    motion?: Record<string, string>;
};

export type CmsThemeComponentOverrides = Record<string, Record<string, string>>;

export type CmsThemeModel = {
    id: string;
    siteId: string;
    slug: string;
    name: string;
    isDefault: boolean;
    tokens: CmsThemeTokenSet;
    semanticTokens: Record<string, string>;
    componentOverrides: CmsThemeComponentOverrides;
    audit: CmsAuditInfo;
};

export type CmsMediaModel = {
    id: string;
    siteId: string;
    key: string;
    url: string;
    mimeType: string;
    width?: number;
    height?: number;
    alt?: CmsTranslatableField;
    tags: string[];
    audit: CmsAuditInfo;
};

export type CmsNavigationItemModel = {
    id: string;
    key: string;
    href: string;
    order: number;
    isExternal: boolean;
    openInNewTab: boolean;
    label: CmsTranslatableField;
};

export type CmsNavigationMenuModel = {
    id: string;
    siteId: string;
    key: string;
    locale: CmsLocaleCode;
    items: CmsNavigationItemModel[];
    audit: CmsAuditInfo;
};

export type CmsCardVariant =
    | "serviceCard"
    | "solutionCard"
    | "industryCard"
    | "projectCard"
    | "articleCard"
    | "contactCard"
    | "genericCard";

export type CmsCardCta = {
    label: CmsTranslatableField;
    href: string;
};

export type CmsCardModel = {
    id: string;
    siteId: string;
    locale: CmsLocaleCode;
    variant: CmsCardVariant;
    title: CmsTranslatableField;
    subtitle?: CmsTranslatableField;
    description?: CmsTranslatableField;
    mediaId?: string;
    cta?: CmsCardCta;
    tags: string[];
    metrics: Record<string, string | number>;
    statusBadge?: CmsTranslatableField;
    payload: Record<string, unknown>;
    publishState: CmsPublishState;
    audit: CmsAuditInfo;
};

export type CmsSectionVisibilityRules = {
    enabled: boolean;
    publishAt?: string;
    unpublishAt?: string;
};

export type CmsSectionStyle = {
    themeKey?: string;
    variant?: string;
    spacingTop?: string;
    spacingBottom?: string;
};

export type CmsPageSectionModel = {
    id: string;
    pageVersionId: string;
    key: string;
    sectionType: string;
    order: number;
    style: CmsSectionStyle;
    visibility: CmsSectionVisibilityRules;
    cardIds: string[];
    payload: Record<string, unknown>;
    audit: CmsAuditInfo;
};

export type CmsPageBlockModel = {
    id: string;
    sectionId: string;
    blockType: string;
    schemaVersion: number;
    order: number;
    styleVariant?: string;
    bindings: Record<string, string>;
    payload: Record<string, unknown>;
    audit: CmsAuditInfo;
};

export type CmsPageModel = {
    id: string;
    siteId: string;
    locale: CmsLocaleCode;
    slug: string;
    route: string;
    pageType: "standard" | "landing" | "system";
    title: CmsTranslatableField;
    seoTitle: CmsTranslatableField;
    seoDescription: CmsTranslatableField;
    seoKeywords: string[];
    publishState: CmsPublishState;
    audit: CmsAuditInfo;
};

export type CmsPageVersionModel = {
    id: string;
    pageId: string;
    locale: CmsLocaleCode;
    versionNumber: number;
    isPublished: boolean;
    publishAt?: string;
    unpublishAt?: string;
    snapshotHash: string;
    audit: CmsAuditInfo;
};

export type CmsSiteModel = {
    id: string;
    slug: string;
    defaultLocale: CmsLocaleCode;
    locales: CmsLocaleCode[];
    title: string;
    audit: CmsAuditInfo;
};

export type CmsPermissionModel = {
    id: string;
    key: string;
    resource: string;
    action: string;
};

export type CmsRoleModel = {
    id: string;
    key: "super_admin" | "cms_admin" | "editor" | "author" | "translator" | "reviewer" | "viewer";
    name: string;
    permissionIds: string[];
};

export type CmsTranslationModel = {
    id: string;
    entityType: string;
    entityId: string;
    field: string;
    locale: CmsLocaleCode;
    value: string;
    status: TranslationStatus;
    updatedAt?: string;
    updatedBy?: string;
};

export type CmsEntityCollection = {
    site: CmsSiteModel;
    themes: CmsThemeModel[];
    pages: CmsPageModel[];
    pageVersions: CmsPageVersionModel[];
    sections: CmsPageSectionModel[];
    blocks: CmsPageBlockModel[];
    cards: CmsCardModel[];
    menus: CmsNavigationMenuModel[];
    media: CmsMediaModel[];
    translations: CmsTranslationModel[];
    roles: CmsRoleModel[];
    permissions: CmsPermissionModel[];
};
