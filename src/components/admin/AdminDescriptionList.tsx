import type { ReactNode } from "react";

type AdminDescriptionItem = {
    term: string;
    description: ReactNode;
};

type AdminDescriptionListProps = {
    items: AdminDescriptionItem[];
};

export function AdminDescriptionList({ items }: AdminDescriptionListProps) {
    return (
        <dl className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
                <div key={item.term} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <dt className="text-xs font-semibold text-muted-foreground uppercase">{item.term}</dt>
                    <dd className="pt-1 text-sm">{item.description}</dd>
                </div>
            ))}
        </dl>
    );
}
