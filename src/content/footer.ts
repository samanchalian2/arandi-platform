export type Language = "en" | "fa";

export type FooterContent = {
  tagline: string;
};

export const footerContent: Record<Language, FooterContent> = {
  en: {
    tagline: "AI-ready enterprise foundation",
  },
  fa: {
    tagline: "بنیاد سازمانی آماده برای هوش مصنوعی",
  },
};

export function getFooterContent(lang?: string | null) {
  return footerContent[lang === "fa" ? "fa" : "en"];
}
