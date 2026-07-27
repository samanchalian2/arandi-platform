import type { Language } from "../company";
import type { ChatContent } from "../chat";
import type { FeatureContent } from "../features";
import type { HeroContent } from "../hero";

export type CmsSource = "local" | "payload" | "strapi" | "directus" | "rest" | "graphql";

export type SectionVisibility = {
  enabled: boolean;
  hiddenReason?: string;
};

export type SectionAppearance = {
  theme?: string;
  variant?: string;
  spacing?: {
    top?: string;
    bottom?: string;
  };
};

export type CmsMetadata = {
  id?: string;
  source?: CmsSource;
  version?: number;
  updatedAt?: string;
  locale?: Language;
};

export type SectionSchema<TContent> = {
  id: string;
  visibility: SectionVisibility;
  order: number;
  content: TContent;
  appearance: SectionAppearance;
  cms: CmsMetadata;
};

export type HeroSectionSchema = SectionSchema<HeroContent>;
export type FeaturesSectionSchema = SectionSchema<FeatureContent>;
export type ChatSectionSchema = SectionSchema<ChatContent>;

export type EditableHomepageSection = HeroSectionSchema | FeaturesSectionSchema | ChatSectionSchema;
