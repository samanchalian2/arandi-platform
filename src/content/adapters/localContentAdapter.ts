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

function normalizeLanguage(lang?: string | null): Language {
  return lang === "fa" ? "fa" : "en";
}

export class LocalContentAdapter implements ContentAdapter {
  getPageContent(lang?: string | null): AppPageContent {
    const language = normalizeLanguage(lang);

    return {
      language,
      company: getCompanyContent(language),
      navigation: getNavigationContent(language),
      hero: getHeroContent(language),
      features: getFeatureContent(language),
      chat: getChatContent(language),
      footer: getFooterContent(language),
      metadata: getMetadataContent(language),
    };
  }

  getMetadata(lang?: string | null): MetadataContent {
    return getMetadataContent(normalizeLanguage(lang));
  }
}
