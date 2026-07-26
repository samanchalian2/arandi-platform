export type Language = "en" | "fa";

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
  en: {
    badge: "Jupiter AI",
    heading: "Explore AI-ready infrastructure and transformation pathways.",
    description:
      "A polished interaction surface for future conversational workflows, designed for enterprise clarity.",
    placeholder: "Start a conversation with Jupiter AI",
    initialMessage:
      "I can help outline enterprise AI strategy, infrastructure planning, and transformation priorities.",
    emptyStateTitle: "Start with a focused question.",
    emptyStateDescription:
      "Ask about delivery priorities, enterprise architecture, or AI positioning.",
    inputLabel: "Ask Jupiter AI",
    inputPlaceholder: "Ask about infrastructure, AI, or transformation...",
    inputAriaLabel: "Send message",
    loadingText: "Preparing an enterprise response...",
    assistantReply: "A focused response will be prepared here for future AI integration.",
    assistantHint: "Ask about architecture, delivery, or AI readiness",
  },
  fa: {
    badge: "ژوپیتر",
    heading: "راهکارهای زیرساختی و مسیرهای تحول با هوش مصنوعی را khám کنید.",
    description:
      "یک تجربه تعاملی منظم برای جریان‌های آینده‌ی گفت‌وگوی هوش مصنوعی، طراحی‌شده برای شفافیت سازمانی.",
    placeholder: "با Jupiter AI گفتگو را آغاز کنید",
    initialMessage:
      "می‌توانم در زمینه استراتژی هوش مصنوعی سازمانی، برنامه‌ریزی زیرساخت و اولویت‌های تحول راهنمایی کنم.",
    emptyStateTitle: "با یک پرسش متمرکز شروع کنید.",
    emptyStateDescription:
      "در مورد اولویت‌های اجرایی، معماری سازمانی یا موقعیت هوش مصنوعی بپرسید.",
    inputLabel: "از Jupiter AI بپرسید",
    inputPlaceholder: "در مورد زیرساخت، هوش مصنوعی یا تحول بپرسید...",
    inputAriaLabel: "ارسال پیام",
    loadingText: "در حال آماده‌سازی پاسخ سازمانی...",
    assistantReply: "پاسخی متمرکز برای ادغام آینده‌ای هوش مصنوعی آماده می‌شود.",
    assistantHint: "در مورد معماری، اجرا یا آمادگی هوش مصنوعی بپرسید",
  },
};

export function getChatContent(lang?: string | null) {
  return chatContent[lang === "fa" ? "fa" : "en"];
}
