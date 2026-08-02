type AdminCardTypeBadgeProps = {
    variant: string;
};

export function AdminCardTypeBadge({ variant }: AdminCardTypeBadgeProps) {
    return (
        <span className="inline-flex rounded-full border border-border/70 bg-muted/30 px-2 py-1 text-xs font-medium">
            {variant}
        </span>
    );
}
