"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminLayoutShellProps = {
    children: ReactNode;
    displayName: string;
    roleLabel: string;
};

export function AdminLayoutShell({ children, displayName, roleLabel }: AdminLayoutShellProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isLoginPage = pathname.startsWith("/admin/login");
    const isRtl = searchParams.get("lang") === "fa";
    const [mobileOpen, setMobileOpen] = useState(false);

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
                <AdminSidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminHeader displayName={displayName} roleLabel={roleLabel} onMenuToggle={() => setMobileOpen((prev) => !prev)} />
                    <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
                </div>
            </div>
        </div>
    );
}
