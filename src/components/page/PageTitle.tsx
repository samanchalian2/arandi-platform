import type { HTMLAttributes, ReactNode } from "react";

import { SectionReveal } from "@/components/ui/SectionReveal";
import { cn } from "@/lib/utils";

type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  descriptionClassName?: string;
  actions?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">;

export function PageTitle({
  eyebrow,
  title,
  description,
  align = "start",
  as = "h2",
  className,
  descriptionClassName,
  actions,
  ...props
}: PageTitleProps) {
  const HeadingTag = as;

  return (
    <SectionReveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        align === "start" && "text-left rtl:text-right",
        className,
      )}
    >
      <div {...props}>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        ) : null}
        <HeadingTag
          className={cn(
            "font-semibold tracking-[-0.03em] text-foreground",
            as === "h1" && "mt-4 text-4xl leading-[1.02] sm:text-5xl lg:text-6xl",
            as === "h2" && "mt-4 text-3xl sm:text-4xl",
            as === "h3" && "mt-3 text-2xl sm:text-3xl",
            as === "h4" && "mt-3 text-xl sm:text-2xl",
          )}
        >
          {title}
        </HeadingTag>
        {description ? (
          <p className={cn("mt-4 text-lg leading-8 text-muted-foreground", descriptionClassName)}>{description}</p>
        ) : null}
        {actions ? <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </SectionReveal>
  );
}