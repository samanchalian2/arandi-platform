export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";

export type HeroContent = {
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  backgroundVideo?: {
    url: string;
    posterUrl: string | null;
  };
};

export const heroContent: Record<Language, HeroContent> = {
  en: getHeroContent("en"),
  fa: getHeroContent("fa"),
};

export function getHeroContent(lang?: string | null) {
  const page = getDomainContentModel(lang).pages.find((item) => item.slug === "home");
  const section = page?.sections.find((item) => item.type === "hero");

  if (!section || section.type !== "hero") {
    throw new Error("Hero section is not configured in domain page content.");
  }

  return {
    badge: section.badge,
    title: section.title,
    description: section.description,
    primaryCta: section.primaryCta,
    secondaryCta: section.secondaryCta,
  };
}
