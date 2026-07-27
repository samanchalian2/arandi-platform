export type Language = "en" | "fa";

import { getDomainContentModel } from "./domain";

export type ChatContent = {
  badge: string;
  heading: string;
  description: string;
  placeholder: string;
  initialMessage: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputAriaLabel: string;
  loadingText: string;
  assistantReply: string;
  assistantHint: string;
};

export const chatContent: Record<Language, ChatContent> = {
  en: getChatContent("en"),
  fa: getChatContent("fa"),
};

export function getChatContent(lang?: string | null) {
  const model = getDomainContentModel(lang);
  const page = model.pages.find((item) => item.slug === "home");
  const section = page?.sections.find((item) => item.type === "chat");

  if (!section || section.type !== "chat") {
    throw new Error("Chat section is not configured in domain page content.");
  }

  return {
    badge: section.badge,
    heading: section.heading,
    description: section.description,
    placeholder: section.placeholder,
    initialMessage: section.initialMessage,
    emptyStateTitle: section.emptyStateTitle,
    emptyStateDescription: section.emptyStateDescription,
    inputLabel: section.inputLabel,
    inputPlaceholder: section.inputPlaceholder,
    inputAriaLabel: section.inputAriaLabel,
    loadingText: section.loadingText,
    assistantReply: section.assistantReply,
    assistantHint: section.assistantHint,
  };
}
