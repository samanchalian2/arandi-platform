export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";
import { getEnterpriseContent } from "./enterprise";

export type NavigationContent = {
  links: {
    overview: string;
    capabilities: string;
    contact: string;
  };
  enterpriseLinks: {
    company: string;
    services: string;
    solutions: string;
    industries: string;
    projects: string;
    contact: string;
  };
  languageSwitch: {
    en: string;
    fa: string;
  };
};

export type EnterpriseNavigationItem = {
  path: string;
  href: string;
  label: string;
};

type EnterpriseLinks = NavigationContent["enterpriseLinks"];

export const navigationContent: Record<Language, NavigationContent> = {
  en: getNavigationContent("en"),
  fa: getNavigationContent("fa"),
};

export function getNavigationContent(lang?: string | null) {
  const normalizedLang = lang === "fa" ? "fa" : "en";
  const page = getDomainContentModel(normalizedLang).pages.find((item) => item.slug === "home");
  const enterpriseNavigation = getEnterpriseContent(normalizedLang).navigation;

  if (!page) {
    throw new Error("Home page is not configured in domain content.");
  }

  return {
    links: {
      overview: page.navigation.overviewLabel,
      capabilities: page.navigation.capabilitiesLabel,
      contact: page.navigation.contactLabel,
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
  };
}

export function buildEnterpriseNavigationItems(enterpriseLinks: EnterpriseLinks, lang: Language): EnterpriseNavigationItem[] {
  return [
    { path: "/company", href: `/company?lang=${lang}`, label: enterpriseLinks.company },
    { path: "/services", href: `/services?lang=${lang}`, label: enterpriseLinks.services },
    { path: "/solutions", href: `/solutions?lang=${lang}`, label: enterpriseLinks.solutions },
    { path: "/industries", href: `/industries?lang=${lang}`, label: enterpriseLinks.industries },
    { path: "/projects", href: `/projects?lang=${lang}`, label: enterpriseLinks.projects },
    { path: "/contact", href: `/contact?lang=${lang}`, label: enterpriseLinks.contact },
  ];
}

export function getLocalizedHomeLabel(lang: Language): string {
  return getEnterpriseContent(lang).navigation.home;
}
