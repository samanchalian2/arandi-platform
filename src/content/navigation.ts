export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";

export type NavigationContent = {
  links: {
    overview: string;
    capabilities: string;
    contact: string;
  };
  languageSwitch: {
    en: string;
    fa: string;
  };
};

export const navigationContent: Record<Language, NavigationContent> = {
  en: getNavigationContent("en"),
  fa: getNavigationContent("fa"),
};

export function getNavigationContent(lang?: string | null) {
  const page = getDomainContentModel(lang).pages.find((item) => item.slug === "home");

  if (!page) {
    throw new Error("Home page is not configured in domain content.");
  }

  return {
    links: {
      overview: page.navigation.overviewLabel,
      capabilities: page.navigation.capabilitiesLabel,
      contact: page.navigation.contactLabel,
    },
    languageSwitch: {
      en: "EN",
      fa: "FA",
    },
  };
}
