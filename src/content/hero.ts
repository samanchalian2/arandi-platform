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
    title: "Jupiter AI helps ambitious teams shape intelligent operating models.",
    description:
      "A premium bilingual experience for enterprise strategy, transformation guidance, and AI-ready foundations.",
    primaryCta: "Explore Jupiter AI",
    secondaryCta: "View capabilities",
  },
  fa: {
    badge: "دستیار هوش مصنوعی سازمانی",
    title: "جپتر ای‌آی به تیم‌های ambitious کمک می‌کند مدل‌های عملیاتی هوشمند بسازند.",
    description:
      "یک تجربه مدرن و دو زبانه برای راهبرد سازمانی، راهنمای تحول دیجیتال و زیرساخت‌های آماده برای هوش مصنوعی.",
    primaryCta: "کاوش در Jupiter AI",
    secondaryCta: "مشاهده توانمندی‌ها",
  },
};

export function getHeroContent(lang?: string | null) {
  return heroContent[lang === "fa" ? "fa" : "en"];
}
