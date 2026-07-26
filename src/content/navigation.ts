export type Language = "en" | "fa";

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
  en: {
    links: {
      overview: "Overview",
      capabilities: "Capabilities",
      contact: "Contact",
    },
    languageSwitch: {
      en: "EN",
      fa: "FA",
    },
  },
  fa: {
    links: {
      overview: "معرفی",
      capabilities: "توانمندی‌ها",
      contact: "تماس",
    },
    languageSwitch: {
      en: "EN",
      fa: "FA",
    },
  },
};

export function getNavigationContent(lang?: string | null) {
  return navigationContent[lang === "fa" ? "fa" : "en"];
}
