import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { cn } from "@/lib/utils";

import { PageContainer } from "./PageContainer";
import { PageTitle } from "./PageTitle";

type PageHeroAction = {
    label: string;
    href?: string;
    target?: string;
    rel?: string;
    icon?: ReactNode;
} & Omit<ComponentProps<typeof Button>, "children">;

type PageHeroProps = {
    badge?: string;
    title: string;
    description?: string;
    align?: "start" | "center";
    primaryAction?: PageHeroAction;
    secondaryAction?: PageHeroAction;
    actions?: ReactNode;
    aside?: ReactNode;
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
    surfaceClassName?: string;
};

function renderAction(action: PageHeroAction, defaultVariant: "default" | "outline") {
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

export function PageHero({
    badge,
    title,
    description,
    align = "start",
    primaryAction,
    secondaryAction,
    actions,
    aside,
    children,
    className,
    contentClassName,
    surfaceClassName,
}: PageHeroProps) {
    const actionNodes = actions ??
        ((primaryAction || secondaryAction) ? (
            <>
                {primaryAction ? renderAction(primaryAction, "default") : null}
                {secondaryAction ? renderAction(secondaryAction, "outline") : null}
            </>
        ) : null);

    return (
        <PageContainer
            className={cn(
                "relative overflow-hidden ds-section-padding",
                aside ? "grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-center" : "",
                className,
            )}
            surfaceClassName={cn(
                "ds-hero-surface",
                surfaceClassName,
            )}
        >
            <div className="ds-hero-overlay absolute inset-0" />

            <SectionReveal className={cn("relative z-10", align === "center" && !aside && "mx-auto max-w-3xl", contentClassName)}>
                <PageTitle
                    eyebrow={badge}
                    title={title}
                    description={description}
                    align={align}
                    as="h1"
                    actions={actionNodes}
                />
                {children ? <div className="ds-content-gap-sm">{children}</div> : null}
            </SectionReveal>

            {aside ? <div className="relative z-10">{aside}</div> : null}
        </PageContainer>
    );
}