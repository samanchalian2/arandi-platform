"use client";

import type { RefObject } from "react";
import { Menu } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
    displayName: string;
    roleLabel: string;
    onMenuToggle: () => void;
    menuButtonRef: RefObject<HTMLButtonElement | null>;
};

function titleFromSegment(segment: string): string {
    return segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function buildBreadcrumb(pathname: string): string[] {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
        return ["Admin"];
    }

    return parts.map((part) => titleFromSegment(part));
}

export function AdminHeader({ displayName, roleLabel, onMenuToggle, menuButtonRef }: AdminHeaderProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isRtl = searchParams.get("lang") === "fa";
    const crumbs = buildBreadcrumb(pathname);

    return (
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/88 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
                <Button ref={menuButtonRef} variant="outline" size="icon-sm" className="md:hidden" onClick={onMenuToggle} aria-label="Toggle admin navigation">
                    <Menu className="size-4" />
                </Button>
                <div className="min-w-0 flex-1">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
                        {crumbs.map((crumb, index) => (
                            <span key={`${crumb}-${index}`} className="inline-flex items-center gap-1">
                                {index > 0 ? <span className="opacity-60">{isRtl ? "\u2039" : "\u203a"}</span> : null}
                                <span className={cn(index === crumbs.length - 1 ? "text-foreground" : undefined)}>{crumb}</span>
                            </span>
                        ))}
                    </nav>
                    <p className="truncate pt-1 text-sm text-muted-foreground">Admin workspace foundation</p>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <button type="button" className="rounded-xl border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground">
                        Notifications
                    </button>
                    <button type="button" className="rounded-xl border border-border/70 bg-card px-3 py-2 text-sm">
                        {displayName} ({roleLabel})
                    </button>
                </div>
            </div>
        </header>
    );
}
