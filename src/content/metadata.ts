export type Language = "en" | "fa";

export type MetadataContent = {
  title: string;
  description: string;
  keywords: string[];
};

export const metadataContent: Record<Language, MetadataContent> = {
  en: {
    title: "Arandi Bonyan | Enterprise AI Assistant",
    description:
      "Arandi Bonyan presents a bilingual enterprise experience centered on Jupiter AI and future-ready digital services.",
    keywords: ["Arandi Bonyan", "enterprise AI", "Jupiter AI", "digital transformation"],
  },
  fa: {
    title: "آرن دی بنیان | دستیار هوش مصنوعی سازمانی",
    description:
      "آرن دی بنیان تجربه‌ای دوزبانه و سازمانی برای ژوپیتر و خدمات دیجیتال آماده‌ی آینده ارائه می‌دهد.",
    keywords: ["آرن دی بنیان", "هوش مصنوعی سازمانی", "ژوپیتر", "تحول دیجیتال"],
  },
};

export function getMetadataContent(lang?: string | null) {
  return metadataContent[lang === "fa" ? "fa" : "en"];
}
