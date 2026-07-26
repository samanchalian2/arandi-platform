export type Language = "en" | "fa";

export type HeroContent = {
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
};

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

export type HeaderContent = {
  brand: string;
  navigation: {
    overview: string;
    capabilities: string;
    contact: string;
  };
  languageSwitch: {
    en: string;
    fa: string;
  };
};

export type FooterContent = {
  brand: string;
  tagline: string;
};

export type SiteContent = {
  language: Language;
  header: HeaderContent;
  hero: HeroContent;
  chat: ChatContent;
  features: FeatureContent;
  footer: FooterContent;
};

export const siteContent: Record<Language, SiteContent> = {
  en: {
    language: "en",
    header: {
      brand: "Jupiter AI",
      navigation: {
        overview: "Overview",
        capabilities: "Capabilities",
        contact: "Contact",
      },
      languageSwitch: {
        en: "EN",
        fa: "FA",
      },
    },
    hero: {
      badge: "Enterprise AI assistant",
      title: "Jupiter AI helps ambitious teams shape intelligent operating models.",
      description:
        "A premium bilingual experience for enterprise strategy, transformation guidance, and AI-ready foundations.",
      primaryCta: "Explore Jupiter AI",
      secondaryCta: "View capabilities",
    },
    chat: {
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
    features: {
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
    footer: {
      brand: "Arandi Platform",
      tagline: "AI-ready enterprise foundation",
    },
  },
  fa: {
    language: "fa",
    header: {
      brand: "جپتر ای‌آی",
      navigation: {
        overview: "معرفی",
        capabilities: "توانمندی‌ها",
        contact: "تماس",
      },
      languageSwitch: {
        en: "EN",
        fa: "FA",
      },
    },
    hero: {
      badge: "دستیار هوش مصنوعی سازمانی",
      title: "جپتر ای‌آی به تیم‌های ambitious کمک می‌کند مدل‌های عملیاتی هوشمند بسازند.",
      description:
        "یک تجربه مدرن و دو زبانه برای راهبرد سازمانی، راهنمای تحول دیجیتال و زیرساخت‌های آماده برای هوش مصنوعی.",
      primaryCta: "کاوش در Jupiter AI",
      secondaryCta: "مشاهده توانمندی‌ها",
    },
    chat: {
      badge: "جپتر ای‌آی",
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
    features: {
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
    footer: {
      brand: "پلتفرم آرندی",
      tagline: "بنیاد سازمانی آماده برای هوش مصنوعی",
    },
  },
};

export function getSiteContent(lang?: string | null) {
  if (lang === "fa" || lang === "ar") {
    return siteContent.fa;
  }

  return siteContent.en;
}
