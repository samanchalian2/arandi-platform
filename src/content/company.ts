export type Language = "en" | "fa";

export type CompanyContent = {
  name: string;
  shortName: string;
  assistantName: string;
  assistantLabel: string;
};

export const companyContent: Record<Language, CompanyContent> = {
  en: {
    name: "Arandi Bonyan",
    shortName: "Arandi Bonyan",
    assistantName: "Jupiter",
    assistantLabel: "Jupiter AI",
  },
  fa: {
    name: "آرن دی بنیان",
    shortName: "آرن دی بنیان",
    assistantName: "ژوپیتر",
    assistantLabel: "ژوپیتر",
  },
};

export function getCompanyContent(lang?: string | null) {
  return companyContent[lang === "fa" ? "fa" : "en"];
}
