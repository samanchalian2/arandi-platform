import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PageContainer } from "./PageContainer";
import { PageTitle } from "./PageTitle";

type PageSectionProps = ComponentPropsWithoutRef<"section"> & {
    eyebrow?: string;
    title?: string;
    description?: string;
    titleAs?: "h2" | "h3" | "h4";
    align?: "start" | "center";
    headerActions?: ReactNode;
    contentClassName?: string;
    containerClassName?: string;
    surfaceClassName?: string;
};

export function PageSection({
    eyebrow,
    title,
    description,
    titleAs = "h2",
    align = "start",
    headerActions,
    className,
    contentClassName,
    containerClassName,
    surfaceClassName,
    children,
    ...props
}: PageSectionProps) {
    return (
        <PageContainer className={containerClassName} surfaceClassName={surfaceClassName}>
            <section className={className} {...props}>
                {title ? (
                    <PageTitle
                        eyebrow={eyebrow}
                        title={title}
                        description={description}
                        as={titleAs}
                        align={align}
                        actions={headerActions}
                    />
                ) : null}
                <div className={cn(title ? "ds-content-gap" : "", contentClassName)}>{children}</div>
            </section>
        </PageContainer>
    );
}