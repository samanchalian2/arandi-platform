import { Container } from "@/components/layout/Container";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Cpu, Network, Sparkles } from "lucide-react";

const featureCards = [
  {
    icon: Sparkles,
    title: "Artificial Intelligence",
    description: "Placeholder foundation for AI-enabled services and advisory work.",
  },
  {
    icon: Network,
    title: "Enterprise IT Infrastructure",
    description: "Placeholder foundation for modern infrastructure strategy and delivery.",
  },
  {
    icon: Cpu,
    title: "Digital Transformation",
    description: "Placeholder foundation for transformation programs and technology adoption.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border/70 bg-background">
      <Container className="py-20 md:py-24 lg:py-28">
        <SectionReveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Capabilities</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Structured foundation for future services and solutions.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            This section provides an initial information architecture for upcoming offerings and
            partner engagement areas.
          </p>
        </SectionReveal>

        <div className="feature-grid mt-10 grid gap-6 md:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <SectionReveal key={feature.title} className="h-full">
                <article className="flex h-full flex-col rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                  <div className="mt-auto pt-6 text-sm font-medium text-primary">
                    {index + 1}. Focus area
                  </div>
                </article>
              </SectionReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
