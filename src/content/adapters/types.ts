import type { ChatContent } from "../chat";
import type { CompanyContent, Language } from "../company";
import type { FeatureContent } from "../features";
import type { FooterContent } from "../footer";
import type { HeroContent } from "../hero";
import type { MetadataContent } from "../metadata";
import type { NavigationContent } from "../navigation";

export type AppPageContent = {
  language: Language;
  company: CompanyContent;
  navigation: NavigationContent;
  hero: HeroContent;
  features: FeatureContent;
  chat: ChatContent;
  footer: FooterContent;
  metadata: MetadataContent;
};

export interface ContentAdapter {
  getPageContent(lang?: string | null): AppPageContent;
  getMetadata(lang?: string | null): MetadataContent;
}
