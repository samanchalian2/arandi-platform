import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { cn } from "@/lib/utils";

type PageCTAAction = {
  label: string;
} & Omit<ComponentProps<typeof Button>, "children">;

type PageCTAProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: PageCTAAction;
  secondaryAction?: PageCTAAction;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

function renderAction(action: PageCTAAction, defaultVariant: "default" | "outline") {
  const { label, variant = defaultVariant, size = "lg", ...props } = action;

  return (
    <Button key={label} variant={variant} size={size} {...props}>
      {label}
    </Button>
  );
}

export function PageCTA({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  actions,
  aside,
  className,
}: PageCTAProps) {
  const actionNodes = actions ??
    ((primaryAction || secondaryAction) ? (
      <>
        {primaryAction ? renderAction(primaryAction, "default") : null}
        {secondaryAction ? renderAction(secondaryAction, "outline") : null}
      </>
    ) : null);

  return (
    <SectionReveal
      className={cn(
        "rounded-[1.75rem] border border-border/70 bg-card p-8 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)] md:p-10",
        aside && "grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p> : null}
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h2>
        {description ? <p className="mt-4 text-lg leading-8 text-muted-foreground">{description}</p> : null}
        {actionNodes ? <div className="mt-8 flex flex-wrap items-center gap-3">{actionNodes}</div> : null}
      </div>
      {aside ? <div>{aside}</div> : null}
    </SectionReveal>
  );
}