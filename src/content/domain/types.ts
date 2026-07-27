import type { Language } from "../company";
import type { CmsMetadata } from "../adapters/schemas";

export type ContentStatus = "draft" | "published" | "archived";

export type LocalizedEntity = {
    id: string;
    slug: string;
    locale: Language;
    status: ContentStatus;
    cms: CmsMetadata;
};

export type CompanyEntity = LocalizedEntity & {
    legalName: string;
    shortName: string;
    assistant: {
        name: string;
        label: string;
    };
};

export type ServiceEntity = LocalizedEntity & {
    title: string;
    summary: string;
    label: string;
};

export type SolutionEntity = LocalizedEntity & {
    title: string;
    summary: string;
    relatedServiceIds: string[];
};

export type IndustryEntity = LocalizedEntity & {
    title: string;
    summary: string;
};

export type ProjectEntity = LocalizedEntity & {
    title: string;
    summary: string;
    industryIds: string[];
    solutionIds: string[];
    featured: boolean;
};

export type ArticleEntity = LocalizedEntity & {
    title: string;
    excerpt: string;
    publishedAt: string;
    tags: string[];
};

export type KnowledgeBaseEntity = LocalizedEntity & {
    question: string;
    answer: string;
    topics: string[];
};

export type ContactEntity = LocalizedEntity & {
    primaryEmail: string;
    primaryPhone: string;
    address: string;
};

export type CareersEntity = LocalizedEntity & {
    title: string;
    summary: string;
    openings: Array<{
        id: string;
        title: string;
        location: string;
        type: "full-time" | "part-time" | "contract";
    }>;
};

export type HeroPageSectionEntity = {
    id: string;
    type: "hero";
    order: number;
    enabled: boolean;
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
};

export type ChatPageSectionEntity = {
    id: string;
    type: "chat";
    order: number;
    enabled: boolean;
    badge: string;
    heading: string;
    description: string;
    placeholder: string;
    initialMessage: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
    inputLabel: string;
    inputPlaceholder: string;
    inputAriaLabel: string;
    loadingText: string;
    assistantReply: string;
    assistantHint: string;
};

export type FeaturesPageSectionEntity = {
    id: string;
    type: "features";
    order: number;
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    serviceCardIds: string[];
};

export type PageSectionEntity = HeroPageSectionEntity | ChatPageSectionEntity | FeaturesPageSectionEntity;

export type PageEntity = LocalizedEntity & {
    title: string;
    route: string;
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
    navigation: {
        overviewLabel: string;
        capabilitiesLabel: string;
        contactLabel: string;
    };
    footerTagline: string;
    sections: PageSectionEntity[];
};

export type DomainContentModel = {
    language: Language;
    company: CompanyEntity;
    services: ServiceEntity[];
    solutions: SolutionEntity[];
    industries: IndustryEntity[];
    projects: ProjectEntity[];
    articles: ArticleEntity[];
    knowledgeBase: KnowledgeBaseEntity[];
    contact: ContactEntity;
    careers: CareersEntity;
    pages: PageEntity[];
};
