import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminCardProps = {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
};

export function AdminCard({ title, description, children, className }: AdminCardProps) {
    return (
        <section className={cn("rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--elevation-1)]", className)}>
            {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            <div className={cn(title || description ? "mt-4" : undefined)}>{children}</div>
        </section>
    );
}
