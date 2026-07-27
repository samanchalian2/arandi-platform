import type { CompanyContent, Language } from "../company";
import type { FooterContent } from "../footer";
import type { MetadataContent } from "../metadata";
import type { NavigationContent } from "../navigation";
import type { ChatSectionSchema, FeaturesSectionSchema, HeroSectionSchema } from "./schemas";

export type AppPageContent = {
  language: Language;
  company: CompanyContent;
  navigation: NavigationContent;
  hero: HeroSectionSchema;
  features: FeaturesSectionSchema;
  chat: ChatSectionSchema;
  footer: FooterContent;
  metadata: MetadataContent;
};

export interface ContentAdapter {
  getPageContent(lang?: string | null): AppPageContent;
  getMetadata(lang?: string | null): MetadataContent;
}
