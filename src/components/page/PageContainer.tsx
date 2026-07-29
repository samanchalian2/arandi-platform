import type { ComponentPropsWithoutRef } from "react";

import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

type PageContainerProps = ComponentPropsWithoutRef<typeof Container> & {
    surfaceClassName?: string;
};

export function PageContainer({ className, surfaceClassName, children, ...props }: PageContainerProps) {
    return (
        <section className={cn("border-b border-border/70 bg-background", surfaceClassName)}>
            <Container className={cn("ds-section-padding", className)} {...props}>
                {children}
            </Container>
        </section>
    );
}