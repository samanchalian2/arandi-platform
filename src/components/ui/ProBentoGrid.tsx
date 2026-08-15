import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Adapted from 21st.dev/community/components/tommyjepsen/feature-section-with-bento-grid/default. */
export function ProBentoGrid({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("ds-pro-bento-grid", className)}>{children}</div>;
}

export function ProBentoCard({ children, className }: { children: ReactNode; className?: string }) {
    return <article className={cn("ds-pro-bento-card", className)}>{children}</article>;
}
