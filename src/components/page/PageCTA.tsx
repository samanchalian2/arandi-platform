import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { cn } from "@/lib/utils";

import { PageTitle } from "./PageTitle";

type PageCTAAction = {
    label: string;
    href?: string;
    target?: string;
    rel?: string;
    icon?: ReactNode;
} & Omit<ComponentProps<typeof Button>, "children">;

type PageCTAProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    titleAs?: "h2" | "h3" | "h4";
    primaryAction?: PageCTAAction;
    secondaryAction?: PageCTAAction;
    actions?: ReactNode;
    aside?: ReactNode;
    className?: string;
};

function renderAction(action: PageCTAAction, defaultVariant: "default" | "outline") {
    const { label, variant = defaultVariant, size = "lg", href, target, rel, icon, ...props } = action;

    const content = (
        <>
            {icon ? <span data-icon="inline-start">{icon}</span> : null}
            <span>{label}</span>
        </>
    );

    if (href) {
        return (
            <Button
                key={label}
                variant={variant}
                size={size}
                nativeButton={false}
                render={<a href={href} target={target} rel={rel} />}
                {...props}
            >
                {content}
            </Button>
        );
    }

    return (
        <Button key={label} variant={variant} size={size} {...props}>
            {content}
        </Button>
    );
}

export function PageCTA({
    eyebrow,
    title,
    description,
    titleAs = "h2",
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
                <PageTitle
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    as={titleAs}
                    actions={actionNodes}
                    className="max-w-2xl"
                />
            </div>
            {aside ? <div>{aside}</div> : null}
        </SectionReveal>
    );
}