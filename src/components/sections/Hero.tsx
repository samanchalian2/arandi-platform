import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { cn } from "@/lib/utils";

type HeroContent = {
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
};

type HeroProps = {
  content: HeroContent;
  lang: "en" | "fa";
};

export function Hero({ content, lang }: HeroProps) {
  return (
    <section
      id="hero"
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="ds-hero-surface relative overflow-hidden border-b border-border/70"
    >
      <div className="ds-hero-float pointer-events-none absolute -top-14 left-[10%] size-36 rounded-full bg-primary/12 blur-2xl" />
      <div className="ds-hero-float pointer-events-none absolute -bottom-16 right-[8%] size-44 rounded-full bg-accent/24 blur-3xl" />
      <div className="ds-hero-overlay absolute inset-0" />
      <Container className="relative ds-section-padding">
        <SectionReveal className={cn("mx-auto max-w-3xl", lang === "fa" ? "text-right" : "text-center")}>
          <div className="ds-eyebrow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-primary ds-subtle-ring">
            <Sparkles className="size-4" />
            {content.badge}
          </div>

          <h1 className="ds-heading-1 mt-6 font-semibold text-foreground">
            {content.title}
          </h1>

          <p className="ds-body-lg mx-auto mt-6 max-w-2xl text-muted-foreground">
            {content.description}
          </p>

          <div className="hero-actions mt-9 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
            <Link
              href="#assistant"
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "no-underline")}
            >
              <span>{content.primaryCta}</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "no-underline")}
            >
              {content.secondaryCta}
            </Link>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
