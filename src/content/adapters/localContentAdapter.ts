import { getChatContent } from "../chat";
import { getCompanyContent } from "../company";
import { getFeatureContent } from "../features";
import { getFooterContent } from "../footer";
import { getHeroContent } from "../hero";
import { getMetadataContent } from "../metadata";
import { getNavigationContent } from "../navigation";
import type { Language } from "../company";
import type { ContentAdapter, AppPageContent } from "./types";
import type { MetadataContent } from "../metadata";
import type { ChatSectionSchema, FeaturesSectionSchema, HeroSectionSchema } from "./schemas";

function normalizeLanguage(lang?: string | null): Language {
  return lang === "fa" ? "fa" : "en";
}

function createHeroSchema(language: Language): HeroSectionSchema {
  const content = getHeroContent(language);

  return {
    id: "hero",
    visibility: { enabled: true },
    order: 1,
    content,
    appearance: { theme: "hero", variant: "default" },
    cms: { id: "hero-section", source: "local", version: 1, locale: language },
  };
}

function createFeaturesSchema(language: Language): FeaturesSectionSchema {
  const content = getFeatureContent(language);

  return {
    id: "features",
    visibility: { enabled: true },
    order: 2,
    content,
    appearance: { theme: "features", variant: "default" },
    cms: { id: "features-section", source: "local", version: 1, locale: language },
  };
}

function createChatSchema(language: Language): ChatSectionSchema {
  const content = getChatContent(language);

  return {
    id: "chat",
    visibility: { enabled: true },
    order: 3,
    content,
    appearance: { theme: "chat", variant: "default" },
    cms: { id: "chat-section", source: "local", version: 1, locale: language },
  };
}

export class LocalContentAdapter implements ContentAdapter {
  getPageContent(lang?: string | null): AppPageContent {
    const language = normalizeLanguage(lang);

    return {
      language,
      company: getCompanyContent(language),
      navigation: getNavigationContent(language),
      hero: createHeroSchema(language),
      features: createFeaturesSchema(language),
      chat: createChatSchema(language),
      footer: getFooterContent(language),
      metadata: getMetadataContent(language),
    };
  }

  getMetadata(lang?: string | null): MetadataContent {
    return getMetadataContent(normalizeLanguage(lang));
  }
}
