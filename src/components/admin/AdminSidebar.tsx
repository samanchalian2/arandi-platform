"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import { AdminSignOutButton } from "./AdminSignOutButton";

const NAV_ITEMS = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/sections", label: "Sections" },
    { href: "/admin/cards", label: "Cards" },
    { href: "/admin/media", label: "Media" },
    { href: "/admin/navigation", label: "Navigation" },
    { href: "/admin/theme", label: "Theme" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/contact-submissions", label: "Contact requests" },
] as const;

type AdminSidebarProps = {
    mobileOpen: boolean;
    onNavigate?: () => void;
    isMock: boolean;
};

export function AdminSidebar({ mobileOpen, onNavigate, isMock }: AdminSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";
    const isRtl = lang === "fa";

    const content = (
        <>
            <div className="flex h-16 items-center border-b border-border/60 px-4">
                <p className="font-semibold tracking-tight">Arandi Admin</p>
            </div>
            <nav className="space-y-1 p-3">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    const href = `${item.href}?lang=${lang}`;
                    return (
                        <Link
                            key={item.href}
                            href={href}
                            className={cn(
                                "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            )}
                            onClick={onNavigate}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto border-t border-border/60 p-3">
                <AdminSignOutButton
                    isMock={isMock}
                    lang={lang}
                    className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                />
            </div>
        </>
    );

    return (
        <>
            <aside
                className={cn(
                    "hidden w-72 shrink-0 border-border/70 bg-sidebar md:block",
                    isRtl ? "border-l" : "border-r",
                )}
                aria-label="Admin sidebar"
            >
                {content}
            </aside>
            {mobileOpen ? (
                <aside
                    className={cn(
                        "fixed inset-y-0 z-40 w-72 border-border/70 bg-sidebar shadow-[var(--elevation-2)] md:hidden",
                        isRtl ? "right-0 border-l" : "left-0 border-r",
                    )}
                    aria-label="Admin mobile sidebar"
                    role="dialog"
                    aria-modal="true"
                >
                    {content}
                </aside>
            ) : null}
        </>
    );
}
