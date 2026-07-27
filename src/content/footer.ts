export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";

export type FooterContent = {
  tagline: string;
};

export const footerContent: Record<Language, FooterContent> = {
  en: getFooterContent("en"),
  fa: getFooterContent("fa"),
};

export function getFooterContent(lang?: string | null) {
  const page = getDomainContentModel(lang).pages.find((item) => item.slug === "home");

  if (!page) {
    throw new Error("Home page is not configured in domain content.");
  }

  return {
    tagline: page.footerTagline,
  };
}
