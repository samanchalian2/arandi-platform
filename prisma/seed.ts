import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { getDomainContentModel } from "../src/content/domain";
import { getEnterpriseContent } from "../src/content/enterprise";
import type {
    PageSectionEntity,
    ServiceEntity,
} from "../src/content/domain";

const prisma = new PrismaClient();

function sectionTitle(section: PageSectionEntity): string {
    if (section.type === "hero") {
        return section.title;
    }
    if (section.type === "features") {
        return section.title;
    }
    return section.heading;
}

function sectionSubtitle(section: PageSectionEntity): string | null {
    if (section.type === "hero") {
        return section.badge;
    }
    if (section.type === "features") {
        return section.eyebrow;
    }
    return section.badge;
}

function sectionDescription(section: PageSectionEntity): string {
    if (section.type === "hero") {
        return section.description;
    }
    if (section.type === "features") {
        return section.description;
    }
    return section.description;
}

function toSectionPayload(section: PageSectionEntity): Record<string, unknown> {
    return section as unknown as Record<string, unknown>;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
}

function findServiceBySlug(services: ServiceEntity[], slug: string): ServiceEntity | undefined {
    return services.find((service) => service.slug === slug);
}

async function seedLanguages() {
    const languages = [
        { code: "en", name: "English", isDefault: true, isActive: true },
        { code: "fa", name: "Persian", isDefault: false, isActive: true },
    ];

    for (const language of languages) {
        await prisma.language.upsert({
            where: { code: language.code },
            update: {
                name: language.name,
                isDefault: language.isDefault,
                isActive: language.isActive,
            },
            create: language,
        });
    }
}

async function seedTheme() {
    await prisma.theme.upsert({
        where: { slug: "default" },
        update: {
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
            },
            semanticTokens: {
                surface: "var(--background)",
                text: "var(--foreground)",
                accent: "var(--primary)",
            },
            componentOverrides: {},
        },
        create: {
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
            },
            semanticTokens: {
                surface: "var(--background)",
                text: "var(--foreground)",
                accent: "var(--primary)",
            },
            componentOverrides: {},
        },
    });
}

async function seedPagesAndSections() {
    const enModel = getDomainContentModel("en");
    const faModel = getDomainContentModel("fa");

    for (const enPage of enModel.pages) {
        const faPage = faModel.pages.find((page) => page.slug === enPage.slug);
        if (!faPage) {
            continue;
        }

        const page = await prisma.page.upsert({
            where: { slug: enPage.slug },
            update: {
                route: enPage.route,
                pageType: "standard",
                publishState: enPage.status,
                seoKeywords: enPage.seo.keywords,
            },
            create: {
                slug: enPage.slug,
                route: enPage.route,
                pageType: "standard",
                publishState: enPage.status,
                seoKeywords: enPage.seo.keywords,
            },
        });

        await prisma.pageTranslation.upsert({
            where: {
                pageId_languageCode: {
                    pageId: page.id,
                    languageCode: "en",
                },
            },
            update: {
                title: enPage.title,
                seoTitle: enPage.seo.title,
                seoDescription: enPage.seo.description,
            },
            create: {
                pageId: page.id,
                languageCode: "en",
                title: enPage.title,
                seoTitle: enPage.seo.title,
                seoDescription: enPage.seo.description,
            },
        });

        await prisma.pageTranslation.upsert({
            where: {
                pageId_languageCode: {
                    pageId: page.id,
                    languageCode: "fa",
                },
            },
            update: {
                title: faPage.title,
                seoTitle: faPage.seo.title,
                seoDescription: faPage.seo.description,
            },
            create: {
                pageId: page.id,
                languageCode: "fa",
                title: faPage.title,
                seoTitle: faPage.seo.title,
                seoDescription: faPage.seo.description,
            },
        });

        for (const enSection of enPage.sections) {
            const faSection = faPage.sections.find((section) => section.id === enSection.id || section.type === enSection.type);
            if (!faSection) {
                continue;
            }

            const section = await prisma.section.upsert({
                where: {
                    pageId_key: {
                        pageId: page.id,
                        key: enSection.id,
                    },
                },
                update: {
                    sectionType: enSection.type,
                    order: enSection.order,
                    enabled: enSection.enabled,
                    style: toJsonValue({ variant: "default" }),
                    payload: toJsonValue(toSectionPayload(enSection)),
                },
                create: {
                    pageId: page.id,
                    key: enSection.id,
                    sectionType: enSection.type,
                    order: enSection.order,
                    enabled: enSection.enabled,
                    style: toJsonValue({ variant: "default" }),
                    payload: toJsonValue(toSectionPayload(enSection)),
                },
            });

            await prisma.sectionTranslation.upsert({
                where: {
                    sectionId_languageCode: {
                        sectionId: section.id,
                        languageCode: "en",
                    },
                },
                update: {
                    title: sectionTitle(enSection),
                    subtitle: sectionSubtitle(enSection),
                    description: sectionDescription(enSection),
                    data: toJsonValue(toSectionPayload(enSection)),
                },
                create: {
                    sectionId: section.id,
                    languageCode: "en",
                    title: sectionTitle(enSection),
                    subtitle: sectionSubtitle(enSection),
                    description: sectionDescription(enSection),
                    data: toJsonValue(toSectionPayload(enSection)),
                },
            });

            await prisma.sectionTranslation.upsert({
                where: {
                    sectionId_languageCode: {
                        sectionId: section.id,
                        languageCode: "fa",
                    },
                },
                update: {
                    title: sectionTitle(faSection),
                    subtitle: sectionSubtitle(faSection),
                    description: sectionDescription(faSection),
                    data: toJsonValue(toSectionPayload(faSection)),
                },
                create: {
                    sectionId: section.id,
                    languageCode: "fa",
                    title: sectionTitle(faSection),
                    subtitle: sectionSubtitle(faSection),
                    description: sectionDescription(faSection),
                    data: toJsonValue(toSectionPayload(faSection)),
                },
            });
        }
    }
}

async function seedCards() {
    const enModel = getDomainContentModel("en");
    const faModel = getDomainContentModel("fa");

    const homePage = await prisma.page.findUnique({ where: { slug: "home" } });
    if (!homePage) {
        return;
    }

    const featuresSection = await prisma.section.findUnique({
        where: {
            pageId_key: {
                pageId: homePage.id,
                key: "features",
            },
        },
    });

    for (const enService of enModel.services) {
        const faService = findServiceBySlug(faModel.services, enService.slug);
        if (!faService) {
            continue;
        }

        const card = await prisma.card.upsert({
            where: { key: `service:${enService.slug}` },
            update: {
                sectionId: featuresSection?.id,
                variant: "serviceCard",
                order: 0,
                publishState: enService.status,
                tags: ["service"],
                metrics: toJsonValue({}),
                payload: toJsonValue({
                    sourceId: enService.id,
                    sourceType: "service",
                }),
            },
            create: {
                key: `service:${enService.slug}`,
                sectionId: featuresSection?.id,
                variant: "serviceCard",
                order: 0,
                publishState: enService.status,
                tags: ["service"],
                metrics: toJsonValue({}),
                payload: toJsonValue({
                    sourceId: enService.id,
                    sourceType: "service",
                }),
            },
        });

        await prisma.cardTranslation.upsert({
            where: {
                cardId_languageCode: {
                    cardId: card.id,
                    languageCode: "en",
                },
            },
            update: {
                title: enService.title,
                description: enService.summary,
                statusBadge: enService.label,
            },
            create: {
                cardId: card.id,
                languageCode: "en",
                title: enService.title,
                description: enService.summary,
                statusBadge: enService.label,
            },
        });

        await prisma.cardTranslation.upsert({
            where: {
                cardId_languageCode: {
                    cardId: card.id,
                    languageCode: "fa",
                },
            },
            update: {
                title: faService.title,
                description: faService.summary,
                statusBadge: faService.label,
            },
            create: {
                cardId: card.id,
                languageCode: "fa",
                title: faService.title,
                description: faService.summary,
                statusBadge: faService.label,
            },
        });
    }
}

async function seedNavigation() {
    const enNav = getEnterpriseContent("en").navigation;
    const faNav = getEnterpriseContent("fa").navigation;

    const items = [
        { key: "company", href: "/company" },
        { key: "services", href: "/services" },
        { key: "solutions", href: "/solutions" },
        { key: "industries", href: "/industries" },
        { key: "projects", href: "/projects" },
        { key: "contact", href: "/contact" },
    ];

    const enLabels: Record<string, string> = {
        company: enNav.company,
        services: enNav.services,
        solutions: enNav.solutions,
        industries: enNav.industries,
        projects: enNav.projects,
        contact: enNav.contact,
    };

    const faLabels: Record<string, string> = {
        company: faNav.company,
        services: faNav.services,
        solutions: faNav.solutions,
        industries: faNav.industries,
        projects: faNav.projects,
        contact: faNav.contact,
    };

    for (let index = 0; index < items.length; index += 1) {
        const item = items[index];

        const navigation = await prisma.navigation.upsert({
            where: { key: item.key },
            update: {
                href: item.href,
                order: index + 1,
                isExternal: false,
                openInNewTab: false,
            },
            create: {
                key: item.key,
                href: item.href,
                order: index + 1,
                isExternal: false,
                openInNewTab: false,
            },
        });

        await prisma.navigationTranslation.upsert({
            where: {
                navigationId_languageCode: {
                    navigationId: navigation.id,
                    languageCode: "en",
                },
            },
            update: {
                label: enLabels[item.key],
            },
            create: {
                navigationId: navigation.id,
                languageCode: "en",
                label: enLabels[item.key],
            },
        });

        await prisma.navigationTranslation.upsert({
            where: {
                navigationId_languageCode: {
                    navigationId: navigation.id,
                    languageCode: "fa",
                },
            },
            update: {
                label: faLabels[item.key],
            },
            create: {
                navigationId: navigation.id,
                languageCode: "fa",
                label: faLabels[item.key],
            },
        });
    }
}

async function seedMediaAndSettings() {
    await prisma.media.upsert({
        where: { url: "/logo.svg" },
        update: {
            title: "Arandi Logo",
            alt: "Arandi Bonyan",
            caption: "Primary brand logo",
            type: "image/svg+xml",
            width: null,
            height: null,
            metadata: toJsonValue({}),
        },
        create: {
            title: "Arandi Logo",
            alt: "Arandi Bonyan",
            caption: "Primary brand logo",
            url: "/logo.svg",
            type: "image/svg+xml",
            metadata: toJsonValue({}),
        },
    });

    const settings = [
        { key: "theme.default", value: { slug: "default" }, group: "theme", isPublic: true },
        { key: "site.company", value: { name: "Arandi Bonyan" }, group: "company", isPublic: true },
        { key: "site.social", value: { linkedin: "", x: "" }, group: "social", isPublic: true },
        { key: "site.seo", value: { title: "Arandi Bonyan" }, group: "seo", isPublic: true },
        { key: "site.contact", value: { email: "hello@arandibonyan.com" }, group: "contact", isPublic: true },
        { key: "site.logo", value: { mediaUrl: "/logo.svg" }, group: "branding", isPublic: true },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {
                value: toJsonValue(setting.value),
                group: setting.group,
                isPublic: setting.isPublic,
            },
            create: {
                key: setting.key,
                value: toJsonValue(setting.value),
                group: setting.group,
                isPublic: setting.isPublic,
            },
        });
    }
}

async function main() {
    await seedLanguages();
    await seedTheme();
    await seedPagesAndSections();
    await seedCards();
    await seedNavigation();
    await seedMediaAndSettings();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
