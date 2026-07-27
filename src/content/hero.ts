export type Language = "en" | "fa";

export type HeroContent = {
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
};

export const heroContent: Record<Language, HeroContent> = {
  en: {
    badge: "Enterprise AI assistant",
    title: "Jupiter; Your smart companion in the digital world",
    description:
      "A modern perspective on organizational technology strategy; a clear path to digital transformation and infrastructure ready for the AI-powered future.",
    primaryCta: "Explore Jupiter AI",
    secondaryCta: "View capabilities",
  },
  fa: {
    badge: "دستیار هوش مصنوعی سازمانی",
    title: "ژوپیتر؛ همراه هوشمند شما در دنیای دیجیتال",
    description:
      "نگاهی نو به راهبرد فناوری سازمان‌ها؛ مسیری روشن برای تحول دیجیتال و زیرساختی آماده برای آینده‌ی هوش مصنوعی.",
    primaryCta: "کاوش در Jupiter AI",
    secondaryCta: "مشاهده توانمندی‌ها",
  },
};

export function getHeroContent(lang?: string | null) {
  return heroContent[lang === "fa" ? "fa" : "en"];
}
