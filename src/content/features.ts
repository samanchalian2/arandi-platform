export type Language = "en" | "fa";

export type FeatureContent = {
  eyebrow: string;
  title: string;
  description: string;
  cards: Array<{
    title: string;
    description: string;
    label: string;
  }>;
};

export const featureContent: Record<Language, FeatureContent> = {
  en: {
    eyebrow: "Capabilities",
    title: "Structured foundation for future services and solutions.",
    description:
      "This section provides an initial information architecture for upcoming offerings and partner engagement areas.",
    cards: [
      {
        title: "Artificial Intelligence",
        description: "Foundation for AI-enabled advisory, automation, and decision support journeys.",
        label: "1. Focus area",
      },
      {
        title: "Enterprise IT Infrastructure",
        description: "Foundation for modern infrastructure strategy, delivery, and operational resilience.",
        label: "2. Focus area",
      },
      {
        title: "Digital Transformation",
        description: "Foundation for transformation programs, technology adoption, and change enablement.",
        label: "3. Focus area",
      },
    ],
  },
  fa: {
    eyebrow: "توانمندی‌ها",
    title: "بنیان ساختاریافته برای خدمات و راه‌حل‌های آینده.",
    description:
      "این بخش یک معماری اولیه‌ی اطلاعات برای ارائه‌های آینده و حوزه‌های همکاری با شرکای تجاری فراهم می‌کند.",
    cards: [
      {
        title: "هوش مصنوعی",
        description: "بنیان برای مسیرهای مشاوره، خودکارسازی و پشتیبانی از تصمیمات با هوش مصنوعی.",
        label: "۱. حوزه تمرکز",
      },
      {
        title: "زیرساخت فناوری سازمانی",
        description: "بنیان برای استراتژی زیرساخت مدرن، اجرا و پایداری عملیاتی.",
        label: "۲. حوزه تمرکز",
      },
      {
        title: "تحول دیجیتال",
        description: "بنیان برای برنامه‌های تحول، پذیرش فناوری و توانمندسازی تغییر.",
        label: "۳. حوزه تمرکز",
      },
    ],
  },
};

export function getFeatureContent(lang?: string | null) {
  return featureContent[lang === "fa" ? "fa" : "en"];
}
