import type { Language } from "../company";
import type { DomainContentModel, PageEntity, ServiceEntity } from "../domain";
import { getEnterpriseContent } from "../enterprise";
import type {
    CmsAuditInfo,
    CmsCardModel,
    CmsEntityCollection,
    CmsLocaleCode,
    CmsNavigationMenuModel,
    CmsPageBlockModel,
    CmsPageModel,
    CmsPageSectionModel,
    CmsPageVersionModel,
    CmsPermissionModel,
    CmsRoleModel,
    CmsSiteModel,
    CmsThemeModel,
    CmsTranslatableField,
    CmsTranslationModel,
    TranslationStatus,
} from "./types";

const SITE_ID = "site-arandi-bonyan";

function buildAudit(updatedAt?: string): CmsAuditInfo {
    return {
        version: 1,
        updatedAt,
        publishedAt: updatedAt,
    };
}

function translatable(value: string, locale: CmsLocaleCode, status: TranslationStatus = "published"): CmsTranslatableField {
    return {
        fallbackLocale: locale,
        values: {
            [locale]: {
                value,
                status,
            },
        },
    };
}

function mapServiceToCard(service: ServiceEntity, locale: Language): CmsCardModel {
    return {
        id: `card-${service.id}`,
        siteId: SITE_ID,
        locale,
        variant: "serviceCard",
        title: translatable(service.title, locale),
        description: translatable(service.summary, locale),
        statusBadge: translatable(service.label, locale),
        tags: ["service"],
        metrics: {},
        payload: {
            sourceId: service.id,
            sourceType: "service",
        },
        publishState: "published",
        audit: buildAudit(service.cms.updatedAt),
    };
}

function mapPage(page: PageEntity, locale: Language): CmsPageModel {
    return {
        id: `cms-page-${page.id}`,
        siteId: SITE_ID,
        locale,
        slug: page.slug,
        route: page.route,
        pageType: "standard",
        title: translatable(page.title, locale),
        seoTitle: translatable(page.seo.title, locale),
        seoDescription: translatable(page.seo.description, locale),
        seoKeywords: page.seo.keywords,
        publishState: page.status === "published" ? "published" : page.status,
        audit: buildAudit(page.cms.updatedAt),
    };
}

function mapPageVersion(page: PageEntity, locale: Language): CmsPageVersionModel {
    return {
        id: `cms-page-version-${page.id}-v1`,
        pageId: `cms-page-${page.id}`,
        locale,
        versionNumber: 1,
        isPublished: page.status === "published",
        snapshotHash: `${page.id}:v1`,
        audit: buildAudit(page.cms.updatedAt),
    };
}

function mapPageSections(page: PageEntity): CmsPageSectionModel[] {
    return page.sections.map((section) => ({
        id: `cms-section-${page.id}-${section.id}`,
        pageVersionId: `cms-page-version-${page.id}-v1`,
        key: section.id,
        sectionType: section.type,
        order: section.order,
        style: {
            variant: "default",
        },
        visibility: {
            enabled: section.enabled,
        },
        cardIds: section.type === "features" ? section.serviceCardIds.map((serviceId) => `card-${serviceId}`) : [],
        payload: {
            sourceSectionId: section.id,
            sourceType: section.type,
            data: section,
        },
        audit: buildAudit(),
    }));
}

function mapPageBlocks(page: PageEntity): CmsPageBlockModel[] {
    return page.sections.map((section) => ({
        id: `cms-block-${page.id}-${section.id}`,
        sectionId: `cms-section-${page.id}-${section.id}`,
        blockType: section.type,
        schemaVersion: 1,
        order: section.order,
        styleVariant: "default",
        bindings: {},
        payload: {
            sourceSectionId: section.id,
            sourceType: section.type,
            data: section,
        },
        audit: buildAudit(),
    }));
}

function mapMainMenu(locale: Language): CmsNavigationMenuModel {
    const nav = getEnterpriseContent(locale).navigation;
    const labels = [
        { key: "company", href: `/company?lang=${locale}`, label: nav.company },
        { key: "services", href: `/services?lang=${locale}`, label: nav.services },
        { key: "solutions", href: `/solutions?lang=${locale}`, label: nav.solutions },
        { key: "industries", href: `/industries?lang=${locale}`, label: nav.industries },
        { key: "projects", href: `/projects?lang=${locale}`, label: nav.projects },
        { key: "contact", href: `/contact?lang=${locale}`, label: nav.contact },
    ];

    return {
        id: `menu-main-${locale}`,
        siteId: SITE_ID,
        key: "main",
        locale,
        items: labels.map((item, index) => ({
            id: `menu-item-${item.key}-${locale}`,
            key: item.key,
            href: item.href,
            order: index + 1,
            isExternal: false,
            openInNewTab: false,
            label: translatable(item.label, locale),
        })),
        audit: buildAudit(),
    };
}

function mapTheme(): CmsThemeModel {
    return {
        id: "theme-default",
        siteId: SITE_ID,
        slug: "default",
        name: "Default Enterprise Theme",
        isDefault: true,
        tokens: {
            colors: {
                "--background": "var(--background)",
                "--foreground": "var(--foreground)",
                "--primary": "var(--primary)",
            },
            typography: {
                "--font-body": "var(--font-body)",
                "--font-heading": "var(--font-heading)",
            },
            spacing: {
                "--space-section-y": "var(--space-section-y)",
            },
            radius: {
                "--radius-xl": "var(--radius-xl)",
            },
            elevation: {
                "--elevation-1": "var(--elevation-1)",
            },
            motion: {
                "--duration-base": "var(--duration-base)",
                "--ease-standard": "var(--ease-standard)",
            },
        },
        semanticTokens: {
            surface: "var(--background)",
            text: "var(--foreground)",
            accent: "var(--primary)",
        },
        componentOverrides: {},
        audit: buildAudit(),
    };
}

function buildAccess(): { roles: CmsRoleModel[]; permissions: CmsPermissionModel[] } {
    const permissions: CmsPermissionModel[] = [
        { id: "perm-page-read", key: "page.read", resource: "page", action: "read" },
        { id: "perm-page-write", key: "page.write", resource: "page", action: "write" },
        { id: "perm-page-publish", key: "page.publish", resource: "page", action: "publish" },
        { id: "perm-theme-write", key: "theme.write", resource: "theme", action: "write" },
        { id: "perm-locale-manage", key: "locale.manage", resource: "locale", action: "manage" },
        { id: "perm-menu-write", key: "menu.write", resource: "menu", action: "write" },
        { id: "perm-user-manage", key: "user.manage", resource: "user", action: "manage" },
    ];

    const role = (id: string, key: CmsRoleModel["key"], permissionKeys: string[], name: string): CmsRoleModel => ({
        id,
        key,
        name,
        permissionIds: permissions.filter((permission) => permissionKeys.includes(permission.key)).map((permission) => permission.id),
    });

    return {
        permissions,
        roles: [
            role("role-super-admin", "super_admin", permissions.map((item) => item.key), "Super Admin"),
            role("role-cms-admin", "cms_admin", ["page.read", "page.write", "page.publish", "theme.write", "locale.manage", "menu.write"], "CMS Admin"),
            role("role-editor", "editor", ["page.read", "page.write", "page.publish", "menu.write"], "Editor"),
            role("role-author", "author", ["page.read", "page.write"], "Author"),
            role("role-translator", "translator", ["page.read", "locale.manage"], "Translator"),
            role("role-reviewer", "reviewer", ["page.read", "page.publish"], "Reviewer"),
            role("role-viewer", "viewer", ["page.read"], "Viewer"),
        ],
    };
}

function buildTranslations(locale: Language, model: DomainContentModel): CmsTranslationModel[] {
    return model.pages.flatMap((page) => [
        {
            id: `translation-${page.id}-title-${locale}`,
            entityType: "page",
            entityId: `cms-page-${page.id}`,
            field: "title",
            locale,
            value: page.title,
            status: "published",
            updatedAt: page.cms.updatedAt,
        },
        {
            id: `translation-${page.id}-seo-title-${locale}`,
            entityType: "page",
            entityId: `cms-page-${page.id}`,
            field: "seo.title",
            locale,
            value: page.seo.title,
            status: "published",
            updatedAt: page.cms.updatedAt,
        },
    ]);
}

export function mapDomainToCmsCollection(model: DomainContentModel): CmsEntityCollection {
    const locale = model.language;
    const site: CmsSiteModel = {
        id: SITE_ID,
        slug: "arandi-bonyan",
        defaultLocale: "en",
        locales: ["en", "fa"],
        title: model.company.shortName,
        audit: buildAudit(),
    };

    const pages = model.pages.map((page) => mapPage(page, locale));
    const pageVersions = model.pages.map((page) => mapPageVersion(page, locale));
    const sections = model.pages.flatMap((page) => mapPageSections(page));
    const blocks = model.pages.flatMap((page) => mapPageBlocks(page));
    const cards = model.services.map((service) => mapServiceToCard(service, locale));
    const menus = [mapMainMenu(locale)];
    const themes = [mapTheme()];
    const access = buildAccess();

    return {
        site,
        themes,
        pages,
        pageVersions,
        sections,
        blocks,
        cards,
        menus,
        media: [],
        translations: buildTranslations(locale, model),
        roles: access.roles,
        permissions: access.permissions,
    };
}
