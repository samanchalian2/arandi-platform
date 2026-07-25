import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  {
    label: "Enterprise readiness",
    description: "Reliable systems architecture for demanding environments.",
  },
  {
    label: "AI strategy",
    description: "Practical integration pathways for intelligent operations.",
  },
  {
    label: "Transformation delivery",
    description: "Guided execution from vision to measurable impact.",
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(89,145,255,0.18),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(243,247,255,0.92))]"
    >
      <Container className="grid gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-24 lg:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Enterprise technology partner
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Advanced infrastructure, AI, and digital transformation for ambitious organizations.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Arandi Platform helps enterprises design resilient systems, accelerate intelligent
            operations, and move from strategy to delivery with clarity.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#features"
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "no-underline")}
            >
              <span>Explore capabilities</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="mailto:hello@arandi.platform"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "no-underline")}
            >
              Speak with the team
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Platform foundation</p>
              <p className="text-sm text-muted-foreground">Prepared for enterprise-grade delivery</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
