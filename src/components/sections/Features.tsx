import { Cpu, Network, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { SectionReveal } from "@/components/ui/SectionReveal";

type FeatureContent = {
  eyebrow: string;
  title: string;
  description: string;
  cards: Array<{
    title: string;
    description: string;
    label: string;
  }>;
};

type FeaturesProps = {
  content: FeatureContent;
  lang: "en" | "fa";
};

const icons = [Sparkles, Network, Cpu];

export function Features({ content, lang }: FeaturesProps) {
  return (
    <section id="features" dir={lang === "fa" ? "rtl" : "ltr"} className="border-b border-border/70 bg-background">
      <Container className="ds-section-padding">
        <SectionReveal className="max-w-2xl">
          <p className="ds-eyebrow text-primary">{content.eyebrow}</p>
          <h2 className="ds-heading-2 mt-4 font-semibold text-foreground">
            {content.title}
          </h2>
          <p className="ds-body-lg mt-5 text-muted-foreground">{content.description}</p>
        </SectionReveal>

        <div className="feature-grid ds-grid ds-content-gap ds-motion-stagger grid gap-6 md:grid-cols-3">
          {content.cards.map((feature, index) => {
            const Icon = icons[index] ?? Sparkles;

            return (
              <SectionReveal key={feature.title} className="h-full">
                <article className="ds-card ds-subtle-ring ds-padding-card flex h-full flex-col">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--elevation-1)]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                  <div className="mt-auto pt-6 text-sm font-medium text-primary">{feature.label}</div>
                </article>
              </SectionReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
