export const PAGE_TEMPLATE_KEYS = [
    "standard",
    "service",
    "solution",
    "industry",
    "project",
    "article",
    "knowledge",
    "legal",
    "contact",
] as const;

export type PageTemplateKey = typeof PAGE_TEMPLATE_KEYS[number];

export type StarterSectionTemplate = {
    key: string;
    sectionType: string;
    labels: { en: string; fa: string };
};

export type PageTemplateDefinition = {
    key: PageTemplateKey;
    label: string;
    description: string;
    sections: StarterSectionTemplate[];
};

const hero = (labels: { en: string; fa: string }): StarterSectionTemplate => ({
    key: "hero",
    sectionType: "hero",
    labels,
});

export const PAGE_TEMPLATES: PageTemplateDefinition[] = [
    {
        key: "standard",
        label: "Standard page",
        description: "Blank bilingual page without starter sections.",
        sections: [],
    },
    {
        key: "service",
        label: "Service",
        description: "Service detail with hero, overview, and capabilities.",
        sections: [
            hero({ en: "Service", fa: "خدمت" }),
            { key: "overview", sectionType: "content", labels: { en: "Overview", fa: "معرفی" } },
            { key: "capabilities", sectionType: "features", labels: { en: "Capabilities", fa: "قابلیت‌ها" } },
        ],
    },
    {
        key: "solution",
        label: "Solution",
        description: "Solution detail with overview and outcomes.",
        sections: [
            hero({ en: "Solution", fa: "راهکار" }),
            { key: "overview", sectionType: "content", labels: { en: "Overview", fa: "معرفی" } },
            { key: "outcomes", sectionType: "features", labels: { en: "Outcomes", fa: "دستاوردها" } },
        ],
    },
    {
        key: "industry",
        label: "Industry",
        description: "Industry detail with challenges and solutions.",
        sections: [
            hero({ en: "Industry", fa: "صنعت" }),
            { key: "challenges", sectionType: "content", labels: { en: "Challenges", fa: "چالش‌ها" } },
            { key: "solutions", sectionType: "features", labels: { en: "Solutions", fa: "راهکارها" } },
        ],
    },
    {
        key: "project",
        label: "Project",
        description: "Project case study with overview and results.",
        sections: [
            hero({ en: "Project", fa: "پروژه" }),
            { key: "overview", sectionType: "content", labels: { en: "Project overview", fa: "معرفی پروژه" } },
            { key: "results", sectionType: "metrics", labels: { en: "Results", fa: "نتایج" } },
        ],
    },
    {
        key: "article",
        label: "Article",
        description: "Editorial article with hero and long-form body.",
        sections: [
            hero({ en: "Article", fa: "مقاله" }),
            { key: "article-body", sectionType: "richText", labels: { en: "Article body", fa: "متن مقاله" } },
        ],
    },
    {
        key: "knowledge",
        label: "Knowledge document",
        description: "Approved knowledge content for public use and future AI grounding.",
        sections: [
            hero({ en: "Knowledge", fa: "دانش‌نامه" }),
            { key: "knowledge-body", sectionType: "richText", labels: { en: "Knowledge body", fa: "متن دانش‌نامه" } },
        ],
    },
    {
        key: "legal",
        label: "Legal page",
        description: "Privacy, terms, or another long-form legal document.",
        sections: [
            hero({ en: "Legal", fa: "حقوقی" }),
            { key: "legal-body", sectionType: "richText", labels: { en: "Legal text", fa: "متن حقوقی" } },
        ],
    },
    {
        key: "contact",
        label: "Contact page",
        description: "Contact introduction and managed contact-form section.",
        sections: [
            hero({ en: "Contact", fa: "تماس" }),
            { key: "contact-form", sectionType: "contactForm", labels: { en: "Contact form", fa: "فرم تماس" } },
        ],
    },
];

export function getPageTemplate(key: PageTemplateKey): PageTemplateDefinition {
    return PAGE_TEMPLATES.find((template) => template.key === key)!;
}
