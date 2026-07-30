import type { ReactNode } from "react";

type AdminModalProps = {
    title: string;
    description?: string;
    open?: boolean;
    children?: ReactNode;
};

export function AdminModal({ title, description, open = false, children }: AdminModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--elevation-3)]">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
                {children ? <div className="mt-4">{children}</div> : null}
            </div>
        </div>
    );
}
