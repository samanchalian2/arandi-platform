"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminLayoutShellProps = {
    children: ReactNode;
    displayName: string;
    roleLabel: string;
    isMock: boolean;
};

export function AdminLayoutShell({ children, displayName, roleLabel, isMock }: AdminLayoutShellProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isLoginPage = pathname.startsWith("/admin/login");
    const isRtl = searchParams.get("lang") === "fa";
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!mobileOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const panel = document.querySelector<HTMLElement>('[aria-label="Admin mobile sidebar"]');
        const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
        focusable()[0]?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setMobileOpen(false);
                menuButtonRef.current?.focus();
                return;
            }
            if (event.key !== "Tab") return;
            const items = focusable();
            if (items.length === 0) {
                event.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
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
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [mobileOpen]);

    if (isLoginPage) {
        return (
            <div dir={isRtl ? "rtl" : "ltr"} className={cn("min-h-screen", isRtl ? "font-persian" : undefined)}>
                {children}
            </div>
        );
    }

    return (
        <div dir={isRtl ? "rtl" : "ltr"} className={cn("min-h-screen bg-muted/20", isRtl ? "font-persian" : undefined)}>
            {mobileOpen ? (
                <button
                    type="button"
                    aria-label="Close navigation overlay"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
                />
            ) : null}
            <div className="flex min-h-screen">
                <AdminSidebar
                    mobileOpen={mobileOpen}
                    onNavigate={() => setMobileOpen(false)}
                    isMock={isMock}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminHeader
                        displayName={displayName}
                        roleLabel={roleLabel}
                        menuButtonRef={menuButtonRef}
                        onMenuToggle={() => setMobileOpen((prev) => !prev)}
                    />
                    <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
                </div>
            </div>
        </div>
    );
}
