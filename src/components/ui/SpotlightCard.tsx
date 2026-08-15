"use client";

import { m } from "motion/react";
import { useRef, type ComponentProps, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

/** Adapted from 21st.dev/community/components/berkcangumusisik/spotlight-card (MIT-style source pattern). */
type SpotlightCardProps = Omit<ComponentProps<typeof m.article>, "ref">;

export function SpotlightCard({ className, children, onMouseMove, ...props }: SpotlightCardProps) {
    const ref = useRef<HTMLElement>(null);
    function handleMove(event: MouseEvent<HTMLElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) ref.current?.style.setProperty("--spotlight", `${event.clientX - rect.left}px ${event.clientY - rect.top}px`);
        onMouseMove?.(event);
    }
    return <m.article ref={ref} onMouseMove={handleMove} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={cn("ds-card ds-spotlight-card", className)} {...props}>{children}</m.article>;
}
