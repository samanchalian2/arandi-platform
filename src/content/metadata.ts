export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";

export type MetadataContent = {
  title: string;
  description: string;
  keywords: string[];
};

export const metadataContent: Record<Language, MetadataContent> = {
  en: getMetadataContent("en"),
  fa: getMetadataContent("fa"),
};

export function getMetadataContent(lang?: string | null) {
  const page = getDomainContentModel(lang).pages.find((item) => item.slug === "home");

  if (!page) {
    throw new Error("Home page is not configured in domain content.");
  }

  return {
    title: page.seo.title,
    description: page.seo.description,
    keywords: page.seo.keywords,
  };
}
