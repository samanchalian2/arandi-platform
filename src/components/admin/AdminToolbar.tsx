import type { ReactNode } from "react";

type AdminToolbarProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
};

export function AdminToolbar({ title, description, actions }: AdminToolbarProps) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)] md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
    );
}
