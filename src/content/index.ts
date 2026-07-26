export { companyContent, getCompanyContent } from "./company";
export type { CompanyContent, Language as CompanyLanguage } from "./company";

export { navigationContent, getNavigationContent } from "./navigation";
export type { NavigationContent, Language as NavigationLanguage } from "./navigation";

export { heroContent, getHeroContent } from "./hero";
export type { HeroContent, Language as HeroLanguage } from "./hero";

export { featureContent, getFeatureContent } from "./features";
export type { FeatureContent, Language as FeatureLanguage } from "./features";

export { chatContent, getChatContent } from "./chat";
export type { ChatContent, Language as ChatLanguage } from "./chat";

export { footerContent, getFooterContent } from "./footer";
export type { FooterContent, Language as FooterLanguage } from "./footer";

export { metadataContent, getMetadataContent } from "./metadata";
export type { MetadataContent, Language as MetadataLanguage } from "./metadata";

export { contentProvider, createContentProvider, type AppPageContent, type ContentProvider, LocalContentProvider } from "./provider";
export { createContentAdapter, type AdapterType } from "./adapters/factory";
export type { ContentAdapter } from "./adapters/types";
export type { AppPageContent as AdapterPageContent } from "./adapters/types";

export type { Language } from "./company";
