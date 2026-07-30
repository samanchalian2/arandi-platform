type AdminEmptyStateProps = {
    title: string;
    description: string;
};

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
