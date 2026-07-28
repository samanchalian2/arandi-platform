import type { Language } from "../company";
import type { ContentAdapter, AppPageContent } from "./types";
import type { MetadataContent } from "../metadata";
import type { ChatSectionSchema, FeaturesSectionSchema, HeroSectionSchema } from "./schemas";
import { getDomainContentModel } from "../domain";
import { getEnterpriseContent } from "../enterprise";

function normalizeLanguage(lang?: string | null): Language {
  return lang === "fa" ? "fa" : "en";
}

function createHeroSchema(language: Language): HeroSectionSchema {
  const homePage = getDomainContentModel(language).pages.find((page) => page.slug === "home");
  const section = homePage?.sections.find((item) => item.type === "hero");

  if (!section || section.type !== "hero") {
    throw new Error("Home hero section is not configured in domain content.");
  }

  return {
    id: "hero",
    visibility: { enabled: section.enabled },
    order: section.order,
    content: {
      badge: section.badge,
      title: section.title,
      description: section.description,
      primaryCta: section.primaryCta,
      secondaryCta: section.secondaryCta,
    },
    appearance: { theme: "hero", variant: "default" },
    cms: { id: "hero-section", source: "local", version: 1, locale: language },
  };
}

function createFeaturesSchema(language: Language): FeaturesSectionSchema {
  const model = getDomainContentModel(language);
  const homePage = model.pages.find((page) => page.slug === "home");
  const section = homePage?.sections.find((item) => item.type === "features");

  if (!section || section.type !== "features") {
    throw new Error("Home features section is not configured in domain content.");
  }

  const cards = section.serviceCardIds
    .map((serviceId) => model.services.find((service) => service.id === serviceId))
    .filter((service): service is NonNullable<typeof service> => Boolean(service))
    .map((service) => ({
      title: service.title,
      description: service.summary,
      label: service.label,
    }));

  return {
    id: "features",
    visibility: { enabled: section.enabled },
    order: section.order,
    content: {
      eyebrow: section.eyebrow,
      title: section.title,
      description: section.description,
      cards,
    },
    appearance: { theme: "features", variant: "default" },
    cms: { id: "features-section", source: "local", version: 1, locale: language },
  };
}

function createChatSchema(language: Language): ChatSectionSchema {
  const model = getDomainContentModel(language);
  const homePage = model.pages.find((page) => page.slug === "home");
  const section = homePage?.sections.find((item) => item.type === "chat");

  if (!section || section.type !== "chat") {
    throw new Error("Home chat section is not configured in domain content.");
  }

  return {
    id: "chat",
    visibility: { enabled: section.enabled },
    order: section.order,
    content: {
      badge: section.badge,
      heading: section.heading,
      description: section.description,
      placeholder: section.placeholder,
      initialMessage: section.initialMessage,
      emptyStateTitle: section.emptyStateTitle,
      emptyStateDescription: section.emptyStateDescription,
      inputLabel: section.inputLabel,
      inputPlaceholder: section.inputPlaceholder,
      inputAriaLabel: section.inputAriaLabel,
      loadingText: section.loadingText,
      assistantReply: section.assistantReply,
      assistantHint: section.assistantHint,
    },
    appearance: { theme: "chat", variant: "default" },
    cms: { id: "chat-section", source: "local", version: 1, locale: language },
  };
}

export class LocalContentAdapter implements ContentAdapter {
  getPageContent(lang?: string | null): AppPageContent {
    const language = normalizeLanguage(lang);
    const model = getDomainContentModel(language);
    const enterpriseNavigation = getEnterpriseContent(language).navigation;
    const homePage = model.pages.find((page) => page.slug === "home");

    if (!homePage) {
      throw new Error("Home page is not configured in domain content.");
    }

    return {
      language,
      company: {
        name: model.company.legalName,
        shortName: model.company.shortName,
        assistantName: model.company.assistant.name,
        assistantLabel: model.company.assistant.label,
      },
      navigation: {
        links: {
          overview: homePage.navigation.overviewLabel,
          capabilities: homePage.navigation.capabilitiesLabel,
          contact: homePage.navigation.contactLabel,
        },
        enterpriseLinks: {
          company: enterpriseNavigation.company,
          services: enterpriseNavigation.services,
          solutions: enterpriseNavigation.solutions,
          industries: enterpriseNavigation.industries,
          projects: enterpriseNavigation.projects,
          contact: enterpriseNavigation.contact,
        },
        languageSwitch: {
          en: "EN",
          fa: "FA",
        },
      },
      hero: createHeroSchema(language),
      features: createFeaturesSchema(language),
      chat: createChatSchema(language),
      footer: {
        tagline: homePage.footerTagline,
      },
      metadata: {
        title: homePage.seo.title,
        description: homePage.seo.description,
        keywords: homePage.seo.keywords,
      },
    };
  }

  getMetadata(lang?: string | null): MetadataContent {
    const homePage = getDomainContentModel(normalizeLanguage(lang)).pages.find((page) => page.slug === "home");

    if (!homePage) {
      throw new Error("Home page is not configured in domain content.");
    }

    return {
      title: homePage.seo.title,
      description: homePage.seo.description,
      keywords: homePage.seo.keywords,
    };
  }

  getDomainContent(lang?: string | null) {
    return getDomainContentModel(normalizeLanguage(lang));
  }
}
