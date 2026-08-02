import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { CardListItem } from "@/lib/admin/cards";

import { AdminCardTypeBadge } from "./AdminCardTypeBadge";
import { AdminLanguageBadge } from "./AdminLanguageBadge";
import { AdminStatusBadge } from "./AdminStatusBadge";

type AdminCardItemProps = {
    card: CardListItem;
    href: string;
};

export function AdminCardItem({ card, href }: AdminCardItemProps) {
    return (
        <article className="min-w-0 rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate font-semibold">{card.title}</h2>
                    <p className="truncate text-sm text-muted-foreground">{card.key}</p>
                </div>
                <Link href={href} className={buttonVariants({ size: "sm", variant: "outline" })}>
                    View
                </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                <AdminCardTypeBadge variant={card.variant} />
                <AdminStatusBadge status={card.publishState} />
                <AdminLanguageBadge languages={card.languages} />
                <span className="rounded-full bg-muted px-2 py-1 text-xs">Order {card.order}</span>
                <span className="rounded-full bg-muted px-2 py-1 text-xs">{card.media ? "Media attached" : "No media"}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
                Updated {new Date(card.updatedAt).toLocaleString()}
            </p>
        </article>
    );
}
