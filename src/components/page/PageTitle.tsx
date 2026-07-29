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
                "max-w-3xl fade-enter",
                align === "center" && "mx-auto text-center",
                align === "start" && "text-left rtl:text-right",
                className,
            )}
        >
            <div {...props}>
                {eyebrow ? (
                    <p className="ds-eyebrow text-primary">{eyebrow}</p>
                ) : null}
                <HeadingTag
                    className={cn(
                        "font-semibold text-foreground",
                        as === "h1" && "mt-4 ds-heading-1",
                        as === "h2" && "mt-4 ds-heading-2",
                        as === "h3" && "mt-3 ds-heading-3",
                        as === "h4" && "mt-3 text-2xl",
                    )}
                >
                    {title}
                </HeadingTag>
                {description ? (
                    <p className={cn("mt-5 ds-body-lg text-muted-foreground", descriptionClassName)}>{description}</p>
                ) : null}
                {actions ? <div className="mt-9 flex flex-wrap items-center gap-3.5">{actions}</div> : null}
            </div>
        </SectionReveal>
    );
}