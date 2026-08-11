import { Prisma, PrismaClient } from "@prisma/client";

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

type EnterpriseCollectionKey = "services" | "solutions" | "industries" | "projects";
type FixedEnterprisePageKey = "company" | "contact";

function enterprisePagePayload(
    key: EnterpriseCollectionKey,
    language: "en" | "fa",
): Record<string, unknown> {
    switch (key) {
        case "services": {
            const page = getEnterpriseContent(language).pages.services;
            return {
                breadcrumbLabel: page.breadcrumbLabel,
                hero: page.hero,
                section: page.section,
                cta: page.cta,
            };
        }
        case "solutions": {
            const page = getEnterpriseContent(language).pages.solutions;
            return {
                breadcrumbLabel: page.breadcrumbLabel,
                hero: page.hero,
                catalog: {
                    eyebrow: page.catalog.eyebrow,
                    title: page.catalog.title,
                    description: page.catalog.description,
                },
                delivery: page.delivery,
                cta: page.cta,
            };
        }
        case "industries": {
            const page = getEnterpriseContent(language).pages.industries;
            return {
                breadcrumbLabel: page.breadcrumbLabel,
                hero: page.hero,
                section: {
                    eyebrow: page.section.eyebrow,
                    title: page.section.title,
                    description: page.section.description,
                },
                cta: page.cta,
            };
        }
        case "projects": {
            const page = getEnterpriseContent(language).pages.projects;
            return {
                breadcrumbLabel: page.breadcrumbLabel,
                hero: page.hero,
                section: {
                    eyebrow: page.section.eyebrow,
                    title: page.section.title,
                    description: page.section.description,
                },
                cta: page.cta,
            };
        }
    }
}

type SeedEnterpriseCard = {
    id: string;
    title: string;
    description: string;
    secondary: string | null;
    badge: string | null;
};

function enterpriseCards(
    key: EnterpriseCollectionKey,
    language: "en" | "fa",
): SeedEnterpriseCard[] {
    switch (key) {
        case "services": {
            const page = getEnterpriseContent(language).pages.services;
            return page.cards.map((card) => ({
                id: card.id,
                title: card.title,
                description: card.summary,
                secondary: null,
                badge: card.label,
            }));
        }
        case "solutions": {
            const page = getEnterpriseContent(language).pages.solutions;
            return page.catalog.cards.map((card) => ({
                id: card.id,
                title: card.title,
                description: card.summary,
                secondary: card.outcome,
                badge: null,
            }));
        }
        case "industries": {
            const page = getEnterpriseContent(language).pages.industries;
            return page.section.cards.map((card) => ({
                id: card.id,
                title: card.title,
                description: card.summary,
                secondary: null,
                badge: null,
            }));
        }
        case "projects": {
            const page = getEnterpriseContent(language).pages.projects;
            return page.section.cards.map((card) => ({
                id: card.id,
                title: card.title,
                description: card.summary,
                secondary: card.impact,
                badge: null,
            }));
        }
    }
}

async function seedEnterpriseCollectionPages() {
    const keys: EnterpriseCollectionKey[] = ["services", "solutions", "industries", "projects"];
    const variants: Record<EnterpriseCollectionKey, string> = {
        services: "serviceCard",
        solutions: "solutionCard",
        industries: "industryCard",
        projects: "projectCard",
    };
    const pageTypes: Record<EnterpriseCollectionKey, string> = {
        services: "service",
        solutions: "solution",
        industries: "industry",
        projects: "project",
    };

    for (const key of keys) {
        const existing = await prisma.page.findUnique({ where: { slug: key }, select: { id: true } });
        if (existing) continue;

        const enPage = getEnterpriseContent("en").pages[key];
        const faPage = getEnterpriseContent("fa").pages[key];
        const enCards = enterpriseCards(key, "en");
        const faCards = new Map(enterpriseCards(key, "fa").map((card) => [card.id, card]));

        await prisma.$transaction(async (tx) => {
            const page = await tx.page.create({
                data: {
                    slug: key,
                    route: `/${key}`,
                    pageType: pageTypes[key],
                    publishState: "published",
                    seoKeywords: [key, "enterprise"],
                    translations: {
                        create: [
                            {
                                languageCode: "en",
                                title: enPage.breadcrumbLabel,
                                seoTitle: enPage.metadata.title,
                                seoDescription: enPage.metadata.description,
                            },
                            {
                                languageCode: "fa",
                                title: faPage.breadcrumbLabel,
                                seoTitle: faPage.metadata.title,
                                seoDescription: faPage.metadata.description,
                            },
                        ],
                    },
                },
            });

            const section = await tx.section.create({
                data: {
                    pageId: page.id,
                    key: `${key}-catalog`,
                    sectionType: "cards",
                    order: 1,
                    enabled: true,
                    style: toJsonValue({ variant: key }),
                    payload: toJsonValue({ schema: "enterprise-collection", version: 1 }),
                    translations: {
                        create: [
                            {
                                languageCode: "en",
                                title: enPage.breadcrumbLabel,
                                description: enPage.metadata.description,
                                data: toJsonValue(enterprisePagePayload(key, "en")),
                            },
                            {
                                languageCode: "fa",
                                title: faPage.breadcrumbLabel,
                                description: faPage.metadata.description,
                                data: toJsonValue(enterprisePagePayload(key, "fa")),
                            },
                        ],
                    },
                },
            });

            for (const [index, enCard] of enCards.entries()) {
                const faCard = faCards.get(enCard.id);
                if (!faCard) throw new Error(`Missing Persian ${key} Card ${enCard.id}.`);
                await tx.card.create({
                    data: {
                        key: `enterprise:${key}:${enCard.id}`,
                        sectionId: section.id,
                        variant: variants[key],
                        order: index + 1,
                        publishState: "published",
                        tags: [key],
                        metrics: toJsonValue({}),
                        payload: toJsonValue({
                            sourceKey: enCard.id,
                            schemaVersion: 1,
                        }),
                        translations: {
                            create: [
                                {
                                    languageCode: "en",
                                    title: enCard.title,
                                    description: enCard.description,
                                    subtitle: enCard.secondary,
                                    statusBadge: enCard.badge,
                                },
                                {
                                    languageCode: "fa",
                                    title: faCard.title,
                                    description: faCard.description,
                                    subtitle: faCard.secondary,
                                    statusBadge: faCard.badge,
                                },
                            ],
                        },
                    },
                });
            }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
    }
}

async function seedFixedEnterprisePages() {
    const keys: FixedEnterprisePageKey[] = ["company", "contact"];
    for (const key of keys) {
        const existing = await prisma.page.findUnique({ where: { slug: key }, select: { id: true } });
        if (existing) continue;

        const enPage = getEnterpriseContent("en").pages[key];
        const faPage = getEnterpriseContent("fa").pages[key];
        const { metadata: _enMetadata, ...enPayload } = enPage;
        const { metadata: _faMetadata, ...faPayload } = faPage;
        void _enMetadata;
        void _faMetadata;

        await prisma.$transaction(async (tx) => {
            const page = await tx.page.create({
                data: {
                    slug: key,
                    route: `/${key}`,
                    pageType: key,
                    publishState: "published",
                    seoKeywords: [key, "enterprise"],
                    translations: {
                        create: [
                            {
                                languageCode: "en",
                                title: enPage.breadcrumbLabel,
                                seoTitle: enPage.metadata.title,
                                seoDescription: enPage.metadata.description,
                            },
                            {
                                languageCode: "fa",
                                title: faPage.breadcrumbLabel,
                                seoTitle: faPage.metadata.title,
                                seoDescription: faPage.metadata.description,
                            },
                        ],
                    },
                },
            });

            await tx.section.create({
                data: {
                    pageId: page.id,
                    key: `${key}-content`,
                    sectionType: key,
                    order: 1,
                    enabled: true,
                    style: toJsonValue({ variant: key }),
                    payload: toJsonValue({ schema: "enterprise-fixed-page", version: 1 }),
                    translations: {
                        create: [
                            {
                                languageCode: "en",
                                title: enPage.breadcrumbLabel,
                                description: enPage.metadata.description,
                                data: toJsonValue(enPayload),
                            },
                            {
                                languageCode: "fa",
                                title: faPage.breadcrumbLabel,
                                description: faPage.metadata.description,
                                data: toJsonValue(faPayload),
                            },
                        ],
                    },
                },
            });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
    }
}

type SeedPublicDocument = {
    pageType: "article" | "knowledge" | "legal";
    slug: string;
    route: string;
    keywords: string[];
    en: { title: string; seoTitle: string; seoDescription: string; bodyTitle: string; body: string };
    fa: { title: string; seoTitle: string; seoDescription: string; bodyTitle: string; body: string };
};

async function seedPublicDocuments() {
    const documents: SeedPublicDocument[] = [
        {
            pageType: "article",
            slug: "building-an-ai-ready-enterprise",
            route: "/articles/building-an-ai-ready-enterprise",
            keywords: ["artificial intelligence", "enterprise", "data"],
            en: {
                title: "Building an AI-ready enterprise",
                seoTitle: "Building an AI-ready enterprise | Arandi Bonyan",
                seoDescription: "A practical overview of the foundations organizations need before deploying reliable enterprise artificial intelligence.",
                bodyTitle: "From isolated experiments to dependable capability",
                body: "Successful enterprise AI begins with a clear business problem, accountable ownership, and trustworthy data. Model selection matters, but it cannot compensate for fragmented processes or undefined outcomes.\n\nOrganizations should establish governed data access, measurable success criteria, security review, and human oversight before scaling a pilot. These foundations make AI systems easier to evaluate, operate, and improve.\n\nA staged delivery model reduces risk: validate the use case, test with representative data, monitor quality and cost, and expand only when the evidence supports it.",
            },
            fa: {
                title: "ساخت سازمان آماده برای هوش مصنوعی",
                seoTitle: "ساخت سازمان آماده برای هوش مصنوعی | آرن‌دی بنیان",
                seoDescription: "مروری کاربردی بر زیرساخت‌ها و حاکمیتی که سازمان‌ها پیش از استقرار قابل اتکای هوش مصنوعی به آن نیاز دارند.",
                bodyTitle: "از آزمایش‌های پراکنده تا یک قابلیت قابل اتکا",
                body: "هوش مصنوعی سازمانی موفق با یک مسئله روشن کسب‌وکار، مالکیت پاسخ‌گو و داده قابل اعتماد آغاز می‌شود. انتخاب مدل مهم است، اما نمی‌تواند فرایندهای گسسته یا نتیجه‌های تعریف‌نشده را جبران کند.\n\nسازمان باید پیش از توسعه پایلوت، دسترسی حاکمیت‌شده به داده، معیارهای قابل اندازه‌گیری، بازبینی امنیتی و نظارت انسانی را برقرار کند. این پایه‌ها ارزیابی، بهره‌برداری و بهبود سامانه‌های هوشمند را ساده‌تر می‌کنند.\n\nتحویل مرحله‌ای ریسک را کاهش می‌دهد: کاربرد را اعتبارسنجی کنید، با داده نماینده آزمایش کنید، کیفیت و هزینه را پایش کنید و تنها زمانی توسعه دهید که شواهد آن را تأیید می‌کنند.",
            },
        },
        {
            pageType: "knowledge",
            slug: "responsible-ai-foundations",
            route: "/knowledge/responsible-ai-foundations",
            keywords: ["responsible ai", "governance", "security"],
            en: {
                title: "Responsible AI foundations",
                seoTitle: "Responsible AI foundations | Arandi Bonyan",
                seoDescription: "An approved knowledge note covering governance, privacy, security, evaluation, and human oversight for enterprise AI.",
                bodyTitle: "Controls that should exist before production",
                body: "Responsible AI is an operating discipline, not a one-time checklist. Every production use case needs a named owner, documented purpose, permitted data boundary, and an escalation path.\n\nEvaluation must cover factual quality, harmful behavior, privacy, security, latency, and cost using representative scenarios. Results should be recorded and repeated when the model, prompt, data source, or surrounding workflow changes.\n\nHuman review remains necessary wherever an automated response can materially affect people, money, access, safety, or legal obligations.",
            },
            fa: {
                title: "پایه‌های هوش مصنوعی مسئولانه",
                seoTitle: "پایه‌های هوش مصنوعی مسئولانه | آرن‌دی بنیان",
                seoDescription: "یادداشت دانشی تأییدشده درباره حاکمیت، حریم خصوصی، امنیت، ارزیابی و نظارت انسانی در هوش مصنوعی سازمانی.",
                bodyTitle: "کنترل‌هایی که پیش از تولید باید برقرار باشند",
                body: "هوش مصنوعی مسئولانه یک انضباط عملیاتی است، نه یک چک‌لیست یک‌باره. هر کاربرد تولیدی به مالک مشخص، هدف مستند، مرز مجاز داده و مسیر ارجاع نیاز دارد.\n\nارزیابی باید کیفیت واقعی، رفتار آسیب‌زا، حریم خصوصی، امنیت، تأخیر و هزینه را با سناریوهای نماینده پوشش دهد. نتایج باید ثبت شوند و با تغییر مدل، پرامپت، منبع داده یا فرایند پیرامونی دوباره ارزیابی شوند.\n\nهرجا پاسخ خودکار بتواند بر افراد، پول، دسترسی، ایمنی یا تعهدات حقوقی اثر معنادار بگذارد، بازبینی انسانی همچنان ضروری است.",
            },
        },
        {
            pageType: "legal",
            slug: "privacy",
            route: "/legal/privacy",
            keywords: ["privacy", "data protection"],
            en: {
                title: "Privacy notice",
                seoTitle: "Privacy notice | Arandi Bonyan",
                seoDescription: "The Arandi Bonyan website privacy notice describing limited data collection, purpose, protection, and contact rights.",
                bodyTitle: "How website information is handled",
                body: "We collect only the information needed to respond to requests, operate the website, protect its security, and meet applicable obligations. We do not sell personal information.\n\nAccess to submitted information is limited to authorized personnel and service providers that need it for an approved purpose. Reasonable technical and organizational safeguards are used to reduce unauthorized access, loss, or misuse.\n\nYou may contact us to ask about information you submitted through this website. This notice may be updated when website capabilities or applicable requirements change.",
            },
            fa: {
                title: "اطلاعیه حریم خصوصی",
                seoTitle: "اطلاعیه حریم خصوصی | آرن‌دی بنیان",
                seoDescription: "اطلاعیه حریم خصوصی وب‌سایت آرن‌دی بنیان درباره جمع‌آوری محدود داده، هدف استفاده، حفاظت و حقوق تماس.",
                bodyTitle: "نحوه پردازش اطلاعات وب‌سایت",
                body: "ما فقط اطلاعات لازم برای پاسخ به درخواست‌ها، بهره‌برداری از وب‌سایت، حفاظت امنیتی و انجام الزامات قابل اجرا را جمع‌آوری می‌کنیم. اطلاعات شخصی فروخته نمی‌شود.\n\nدسترسی به اطلاعات ارسالی به کارکنان و ارائه‌دهندگان مجازی محدود است که برای یک هدف تأییدشده به آن نیاز دارند. برای کاهش دسترسی غیرمجاز، از دست رفتن یا سوءاستفاده، تدابیر فنی و سازمانی متناسب اعمال می‌شود.\n\nبرای پرسش درباره اطلاعاتی که از طریق این وب‌سایت ارسال کرده‌اید می‌توانید با ما تماس بگیرید. این اطلاعیه ممکن است هم‌زمان با تغییر قابلیت‌های سایت یا الزامات مربوط به‌روزرسانی شود.",
            },
        },
    ];

    for (const document of documents) {
        if (await prisma.page.findUnique({ where: { slug: document.slug }, select: { id: true } })) {
            continue;
        }
        await prisma.$transaction(async (tx) => {
            const page = await tx.page.create({
                data: {
                    slug: document.slug,
                    route: document.route,
                    pageType: document.pageType,
                    publishState: "published",
                    seoKeywords: document.keywords,
                    translations: {
                        create: (["en", "fa"] as const).map((languageCode) => ({
                            languageCode,
                            title: document[languageCode].title,
                            seoTitle: document[languageCode].seoTitle,
                            seoDescription: document[languageCode].seoDescription,
                        })),
                    },
                },
            });
            const sections = [
                {
                    key: "hero",
                    sectionType: "hero",
                    en: { title: document.en.title, description: document.en.seoDescription },
                    fa: { title: document.fa.title, description: document.fa.seoDescription },
                },
                {
                    key: `${document.pageType}-body`,
                    sectionType: "richText",
                    en: { title: document.en.bodyTitle, description: document.en.body },
                    fa: { title: document.fa.bodyTitle, description: document.fa.body },
                },
            ];
            for (const [index, section] of sections.entries()) {
                await tx.section.create({
                    data: {
                        pageId: page.id,
                        key: section.key,
                        sectionType: section.sectionType,
                        order: index + 1,
                        enabled: true,
                        style: toJsonValue({ variant: document.pageType }),
                        payload: toJsonValue({ template: document.pageType, version: 1 }),
                        translations: {
                            create: (["en", "fa"] as const).map((languageCode) => ({
                                languageCode,
                                title: section[languageCode].title,
                                description: section[languageCode].description,
                                data: toJsonValue({}),
                            })),
                        },
                    },
                });
            }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
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

    for (const [index, enService] of enModel.services.entries()) {
        const faService = findServiceBySlug(faModel.services, enService.slug);
        if (!faService) {
            continue;
        }

        const card = await prisma.card.upsert({
            where: { key: `service:${enService.slug}` },
            update: {
                sectionId: featuresSection?.id,
                variant: "serviceCard",
                order: index + 1,
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
                order: index + 1,
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
    const enModel = getDomainContentModel("en");
    const faModel = getDomainContentModel("fa");

    await prisma.media.upsert({
        where: { url: "/brand/arandi-lockup.png" },
        update: {
            title: "Arandi Logo Lockup",
            alt: "Arandi Bonyan",
            caption: "Primary brand logo",
            type: "image/png",
            width: 1316,
            height: 600,
            metadata: toJsonValue({}),
        },
        create: {
            title: "Arandi Logo Lockup",
            alt: "Arandi Bonyan",
            caption: "Primary brand logo",
            url: "/brand/arandi-lockup.png",
            type: "image/png",
            width: 1316,
            height: 600,
            metadata: toJsonValue({}),
        },
    });

    await prisma.media.upsert({
        where: { url: "/brand/arandi-symbol.png" },
        update: {
            title: "Arandi Brand Symbol",
            alt: "Arandi Bonyan symbol",
            caption: "Compact brand symbol",
            type: "image/png",
            width: 1254,
            height: 1254,
            metadata: toJsonValue({}),
        },
        create: {
            title: "Arandi Brand Symbol",
            alt: "Arandi Bonyan symbol",
            caption: "Compact brand symbol",
            url: "/brand/arandi-symbol.png",
            type: "image/png",
            width: 1254,
            height: 1254,
            metadata: toJsonValue({}),
        },
    });

    const settings = [
        { key: "theme.default", value: { slug: "default" }, group: "theme", isPublic: true },
        {
            key: "site.company",
            value: {
                en: {
                    name: enModel.company.legalName,
                    shortName: enModel.company.shortName,
                    assistantName: enModel.company.assistant.name,
                    assistantLabel: enModel.company.assistant.label,
                    footerTagline: enModel.pages[0]?.footerTagline ?? "",
                },
                fa: {
                    name: faModel.company.legalName,
                    shortName: faModel.company.shortName,
                    assistantName: faModel.company.assistant.name,
                    assistantLabel: faModel.company.assistant.label,
                    footerTagline: faModel.pages[0]?.footerTagline ?? "",
                },
            },
            group: "company",
            isPublic: true,
        },
        { key: "site.social", value: { linkedin: "", x: "" }, group: "social", isPublic: true },
        { key: "site.seo", value: { title: "Arandi Bonyan" }, group: "seo", isPublic: true },
        {
            key: "site.contact",
            value: {
                en: {
                    email: enModel.contact.primaryEmail,
                    phone: enModel.contact.primaryPhone,
                    address: enModel.contact.address,
                },
                fa: {
                    email: faModel.contact.primaryEmail,
                    phone: faModel.contact.primaryPhone,
                    address: faModel.contact.address,
                },
            },
            group: "contact",
            isPublic: true,
        },
        { key: "site.logo", value: { mediaUrl: "/brand/arandi-lockup.png" }, group: "branding", isPublic: true },
        {
            key: "ai.runtime",
            value: { provider: "openai", model: "gpt-5.6-sol" },
            group: "ai",
            isPublic: false,
        },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {
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

async function seedRoles() {
    const roles = [
        {
            key: "SuperAdmin",
            name: "Super Admin",
            permissions: [
                "page.read", "page.write", "page.delete",
                "section.read", "section.write", "section.delete",
                "card.read", "card.write", "card.translate", "card.delete",
                "media.read", "media.write", "media.delete",
                "theme.read", "theme.write",
                "user.read", "user.write", "security_event.read", "session.revoke",
                "navigation.read", "navigation.write", "navigation.translate", "navigation.delete",
                "setting.read", "setting.write",
            ],
        },
        {
            key: "Admin",
            name: "Admin",
            permissions: [
                "page.read", "page.write", "page.delete",
                "section.read", "section.write", "section.delete",
                "card.read", "card.write", "card.translate", "card.delete",
                "media.read", "media.write",
                "theme.read", "theme.write",
                "user.read", "security_event.read",
                "navigation.read", "navigation.write", "navigation.translate", "navigation.delete",
                "setting.read", "setting.write",
            ],
        },
        {
            key: "Editor",
            name: "Editor",
            permissions: [
                "page.read", "page.write",
                "section.read", "section.write",
                "card.read", "card.write",
                "media.read", "theme.read",
                "navigation.read", "navigation.write",
            ],
        },
        {
            key: "Translator",
            name: "Translator",
            permissions: [
                "page.read",
                "section.read", "section.write",
                "card.read", "card.translate",
                "media.read", "theme.read",
                "navigation.read", "navigation.translate",
            ],
        },
        {
            key: "Viewer",
            name: "Viewer",
            permissions: ["page.read", "section.read", "card.read", "media.read", "theme.read"],
        },
        {
            key: "Customer",
            name: "Customer",
            permissions: ["account.read", "account.write", "service_request.create", "service_request.read"],
        },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { key: role.key },
            update: {
                name: role.name,
                permissions: role.permissions,
                isSystem: true,
            },
            create: {
                ...role,
                isSystem: true,
            },
        });
    }
}

async function main() {
    await seedLanguages();
    await seedTheme();
    await seedPagesAndSections();
    await seedEnterpriseCollectionPages();
    await seedFixedEnterprisePages();
    await seedPublicDocuments();
    await seedCards();
    await seedNavigation();
    await seedMediaAndSettings();
    await seedRoles();
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
