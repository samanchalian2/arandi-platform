export function AdminLoading() {
    return (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--elevation-1)]">
            <p className="text-sm text-muted-foreground">Loading admin data...</p>
            <div className="mt-3 h-2 w-44 animate-pulse rounded-full bg-muted" />
        </div>
    );
}
