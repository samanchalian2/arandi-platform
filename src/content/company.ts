export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";

export type CompanyContent = {
  name: string;
  shortName: string;
  assistantName: string;
  assistantLabel: string;
};

export const companyContent: Record<Language, CompanyContent> = {
  en: getCompanyContent("en"),
  fa: getCompanyContent("fa"),
};

export function getCompanyContent(lang?: string | null) {
  const model = getDomainContentModel(lang);

  return {
    name: model.company.legalName,
    shortName: model.company.shortName,
    assistantName: model.company.assistant.name,
    assistantLabel: model.company.assistant.label,
  };
}
