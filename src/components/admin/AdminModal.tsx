"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

type AdminModalProps = {
    title: string;
    description?: string;
    open?: boolean;
    children?: ReactNode;
    onClose?: () => void;
};

const FOCUSABLE_SELECTOR = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

export function AdminModal({
    title,
    description,
    open = false,
    children,
    onClose,
}: AdminModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        if (!open) return;

        const previouslyFocused = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const dialog = dialogRef.current;
        const focusable = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (focusable ?? dialog)?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && onClose) {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== "Tab" || !dialog) return;

            const focusableItems = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
            if (focusableItems.length === 0) {
                event.preventDefault();
                dialog.focus();
                return;
            }
            const first = focusableItems[0];
            const last = focusableItems[focusableItems.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [onClose, open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 px-4 backdrop-blur-sm">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--elevation-3)]"
            >
                <h2 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h2>
                {description ? (
                    <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">{description}</p>
                ) : null}
                {children ? <div className="mt-4">{children}</div> : null}
            </div>
        </div>
    );
}
