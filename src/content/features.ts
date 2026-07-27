export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";

export type FeatureContent = {
  eyebrow: string;
  title: string;
  description: string;
  cards: Array<{
    title: string;
    description: string;
    label: string;
  }>;
};

export const featureContent: Record<Language, FeatureContent> = {
  en: getFeatureContent("en"),
  fa: getFeatureContent("fa"),
};

export function getFeatureContent(lang?: string | null) {
  const model = getDomainContentModel(lang);
  const page = model.pages.find((item) => item.slug === "home");
  const section = page?.sections.find((item) => item.type === "features");

  if (!section || section.type !== "features") {
    throw new Error("Features section is not configured in domain page content.");
  }

  return {
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    cards: section.serviceCardIds
      .map((serviceId) => model.services.find((service) => service.id === serviceId))
      .filter((service): service is NonNullable<typeof service> => Boolean(service))
      .map((service) => ({
        title: service.title,
        description: service.summary,
        label: service.label,
      })),
  };
}
