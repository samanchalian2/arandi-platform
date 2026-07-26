import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(85,125,255,0.16),_transparent_36%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(241,247,255,0.94))]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.45)_45%,transparent_100%)]" />
      <Container className="relative py-16 md:py-20 lg:py-24">
        <SectionReveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Enterprise technology partner
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Advanced infrastructure, AI, and digital transformation for ambitious organizations.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Arandi Platform helps enterprises design resilient systems and accelerate intelligent operations with clarity.
          </p>

          <div className="hero-actions mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="#assistant"
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "no-underline")}
            >
              <span>Explore AI assistant</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "no-underline")}
            >
              View capabilities
            </Link>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
