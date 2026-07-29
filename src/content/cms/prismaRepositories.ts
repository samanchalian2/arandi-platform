import { PrismaClient } from "@prisma/client";

import { createCmsRepositoriesFromCollection } from "./localRepositories";
import type { CmsRepositories } from "./repositories";
import type {
    CmsCardModel,
    CmsEntityCollection,
    CmsLocaleCode,
    CmsNavigationMenuModel,
    CmsPermissionModel,
    CmsRoleModel,
    CmsSiteModel,
    CmsTranslatableField,
    CmsTranslationModel,
} from "./types";

function toTranslatable(
    values: Array<{ locale: CmsLocaleCode; value: string }>,
    fallbackLocale: CmsLocaleCode,
): CmsTranslatableField {
    return {
        fallbackLocale,
        values: values.reduce<CmsTranslatableField["values"]>((acc, item) => {
            acc[item.locale] = {
                value: item.value,
                status: "published",
            };
            return acc;
        }, {}),
    };
}

function asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return value as Record<string, unknown>;
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

export async function loadCmsCollectionFromPrisma(prisma: PrismaClient): Promise<CmsEntityCollection> {
    const [languages, pages, cards, navigations, themes, media] = await Promise.all([
        prisma.language.findMany({ where: { isActive: true } }),
        prisma.page.findMany({ include: { translations: true, sections: { include: { translations: true } } } }),
        prisma.card.findMany({ include: { translations: true } }),
        prisma.navigation.findMany({ include: { translations: true } }),
        prisma.theme.findMany(),
        prisma.media.findMany(),
    ]);

    const defaultLanguage = languages.find((language) => language.isDefault)?.code ?? "en";
    const localeCodes = languages.map((language) => language.code);
    const siteId = "site-arandi-bonyan";

    const site: CmsSiteModel = {
        id: siteId,
        slug: "arandi-bonyan",
        defaultLocale: defaultLanguage,
        locales: localeCodes,
        title: "Arandi Bonyan",
        audit: {
            version: 1,
            updatedAt: new Date().toISOString(),
        },
    };

    const cmsPages = pages.flatMap((page) =>
        localeCodes.map((locale) => {
            const translation = page.translations.find((item) => item.languageCode === locale) ?? page.translations[0];
            if (!translation) {
                return null;
            }

            return {
                id: `cms-page-${page.id}-${locale}`,
                siteId,
                locale,
                slug: page.slug,
                route: page.route,
                pageType: page.pageType as "standard" | "landing" | "system",
                title: toTranslatable([{ locale, value: translation.title }], locale),
                seoTitle: toTranslatable([{ locale, value: translation.seoTitle }], locale),
                seoDescription: toTranslatable([{ locale, value: translation.seoDescription }], locale),
                seoKeywords: page.seoKeywords,
                publishState: page.publishState as "draft" | "in_review" | "approved" | "published" | "archived",
                audit: {
                    version: 1,
                    createdAt: page.createdAt.toISOString(),
                    updatedAt: page.updatedAt.toISOString(),
                },
            };
        }),
    ).filter((page): page is NonNullable<typeof page> => Boolean(page));

    const pageVersions = cmsPages.map((page) => ({
        id: `cms-page-version-${page.id}-v1`,
        pageId: page.id,
        locale: page.locale,
        versionNumber: 1,
        isPublished: page.publishState === "published",
        snapshotHash: `${page.id}:v1`,
        audit: {
            version: 1,
            updatedAt: page.audit.updatedAt,
        },
    }));

    const pageSections = pages.flatMap((page) =>
        localeCodes.flatMap((locale) =>
            page.sections.map((section) => {
                const translation = section.translations.find((item) => item.languageCode === locale) ?? section.translations[0];

                return {
                    id: `cms-section-${section.id}-${locale}`,
                    pageVersionId: `cms-page-version-cms-page-${page.id}-${locale}-v1`,
                    key: section.key,
                    sectionType: section.sectionType,
                    order: section.order,
                    style: asRecord(section.style),
                    visibility: {
                        enabled: section.enabled,
                    },
                    cardIds: cards
                        .filter((card) => card.sectionId === section.id)
                        .map((card) => `card-${card.id}-${locale}`),
                    payload: asRecord(translation?.data ?? section.payload),
                    audit: {
                        version: 1,
                        createdAt: section.createdAt.toISOString(),
                        updatedAt: section.updatedAt.toISOString(),
                    },
                };
            }),
        ),
    );

    const cmsCards: CmsCardModel[] = cards.flatMap((card) =>
        localeCodes.flatMap((locale) => {
            const translation = card.translations.find((item) => item.languageCode === locale) ?? card.translations[0];
            if (!translation) {
                return [];
            }

            return [{
                id: `card-${card.id}-${locale}`,
                siteId,
                locale,
                variant: card.variant as CmsCardModel["variant"],
                title: toTranslatable([{ locale, value: translation.title }], locale),
                subtitle: translation.subtitle ? toTranslatable([{ locale, value: translation.subtitle }], locale) : undefined,
                description: translation.description ? toTranslatable([{ locale, value: translation.description }], locale) : undefined,
                mediaId: card.mediaId ?? undefined,
                cta: translation.ctaLabel && translation.ctaHref
                    ? {
                        label: toTranslatable([{ locale, value: translation.ctaLabel }], locale),
                        href: translation.ctaHref,
                    }
                    : undefined,
                tags: card.tags,
                metrics: asRecord(card.metrics) as Record<string, string | number>,
                statusBadge: translation.statusBadge ? toTranslatable([{ locale, value: translation.statusBadge }], locale) : undefined,
                payload: asRecord(card.payload),
                publishState: card.publishState as CmsCardModel["publishState"],
                audit: {
                    version: 1,
                    createdAt: card.createdAt.toISOString(),
                    updatedAt: card.updatedAt.toISOString(),
                },
            }];
        }),
    );

    const menus: CmsNavigationMenuModel[] = localeCodes.map((locale) => ({
        id: `menu-main-${locale}`,
        siteId,
        key: "main",
        locale,
        items: navigations
            .map((navigation) => {
                const translation = navigation.translations.find((item) => item.languageCode === locale) ?? navigation.translations[0];
                if (!translation) {
                    return null;
                }

                return {
                    id: `menu-item-${navigation.id}-${locale}`,
                    key: navigation.key,
                    href: navigation.href,
                    order: navigation.order,
                    isExternal: navigation.isExternal,
                    openInNewTab: navigation.openInNewTab,
                    label: toTranslatable([{ locale, value: translation.label }], locale),
                };
            })
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .sort((a, b) => a.order - b.order),
        audit: {
            version: 1,
            updatedAt: new Date().toISOString(),
        },
    }));

    const translations: CmsTranslationModel[] = [
        ...pages.flatMap((page) =>
            page.translations.flatMap((translation) => [
                {
                    id: `translation-page-title-${translation.id}`,
                    entityType: "page",
                    entityId: page.id,
                    field: "title",
                    locale: translation.languageCode,
                    value: translation.title,
                    status: "published" as const,
                    updatedAt: translation.updatedAt.toISOString(),
                },
                {
                    id: `translation-page-seo-title-${translation.id}`,
                    entityType: "page",
                    entityId: page.id,
                    field: "seo.title",
                    locale: translation.languageCode,
                    value: translation.seoTitle,
                    status: "published" as const,
                    updatedAt: translation.updatedAt.toISOString(),
                },
            ]),
        ),
        ...cards.flatMap((card) =>
            card.translations.map((translation) => ({
                id: `translation-card-title-${translation.id}`,
                entityType: "card",
                entityId: card.id,
                field: "title",
                locale: translation.languageCode,
                value: translation.title,
                status: "published" as const,
                updatedAt: translation.updatedAt.toISOString(),
            })),
        ),
        ...navigations.flatMap((navigation) =>
            navigation.translations.map((translation) => ({
                id: `translation-navigation-label-${translation.id}`,
                entityType: "navigation",
                entityId: navigation.id,
                field: "label",
                locale: translation.languageCode,
                value: translation.label,
                status: "published" as const,
                updatedAt: translation.updatedAt.toISOString(),
            })),
        ),
    ];

    const access = buildAccess();

    return {
        site,
        themes: themes.map((theme) => ({
            id: theme.id,
            siteId,
            slug: theme.slug,
            name: theme.name,
            isDefault: theme.isDefault,
            tokens: (theme.tokens as Record<string, unknown>) ?? {},
            semanticTokens: (theme.semanticTokens as Record<string, string>) ?? {},
            componentOverrides: (theme.componentOverrides as Record<string, Record<string, string>>) ?? {},
            audit: {
                version: 1,
                createdAt: theme.createdAt.toISOString(),
                updatedAt: theme.updatedAt.toISOString(),
            },
        })),
        pages: cmsPages,
        pageVersions,
        sections: pageSections,
        blocks: pageSections.map((section) => ({
            id: `cms-block-${section.id}`,
            sectionId: section.id,
            blockType: section.sectionType,
            schemaVersion: 1,
            order: section.order,
            styleVariant: String((section.style as { variant?: string }).variant ?? "default"),
            bindings: {},
            payload: section.payload,
            audit: {
                version: 1,
                updatedAt: section.audit.updatedAt,
            },
        })),
        cards: cmsCards,
        menus,
        media: media.map((asset) => ({
            id: asset.id,
            siteId,
            key: `media-${asset.id}`,
            url: asset.url,
            mimeType: asset.type,
            width: asset.width ?? undefined,
            height: asset.height ?? undefined,
            alt: asset.alt ? toTranslatable([{ locale: defaultLanguage, value: asset.alt }], defaultLanguage) : undefined,
            tags: [],
            audit: {
                version: 1,
                createdAt: asset.createdAt.toISOString(),
                updatedAt: asset.updatedAt.toISOString(),
            },
        })),
        translations,
        roles: access.roles,
        permissions: access.permissions,
    };
}

export async function createPrismaCmsRepositories(prisma?: PrismaClient): Promise<CmsRepositories> {
    const client = prisma ?? new PrismaClient();
    const collection = await loadCmsCollectionFromPrisma(client);
    return createCmsRepositoriesFromCollection(collection);
}
