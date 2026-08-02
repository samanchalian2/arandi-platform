import { ExternalLink } from "lucide-react";

import type { MediaItem } from "@/lib/admin/media";

import { AdminMediaTypeBadge } from "./AdminMediaTypeBadge";

type AdminMediaItemProps = {
    item: MediaItem;
};

export function AdminMediaItem({ item }: AdminMediaItemProps) {
    const dimensions = item.width && item.height ? `${item.width} × ${item.height}` : "Dimensions unavailable";

    return (
        <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate font-semibold">{item.title}</h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{item.alt || "No alternative text"}</p>
                </div>
                <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Open ${item.title}`}
                >
                    <ExternalLink className="size-4" />
                </a>
            </div>
            <div className="mt-4">
                <AdminMediaTypeBadge type={item.type} />
            </div>
            <dl className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                    <dt>Size</dt>
                    <dd>{dimensions}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt>Updated</dt>
                    <dd>{new Date(item.updatedAt).toLocaleDateString()}</dd>
                </div>
            </dl>
        </article>
    );
}
