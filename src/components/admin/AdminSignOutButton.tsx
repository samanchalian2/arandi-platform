"use client";

import { useState } from "react";

import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth/csrf";
import { cn } from "@/lib/utils";

type AdminSignOutButtonProps = {
    isMock: boolean;
    lang: "en" | "fa";
    className?: string;
};

function cookieValue(name: string): string | null {
    const prefix = `${encodeURIComponent(name)}=`;
    const part = document.cookie.split("; ").find((item) => item.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : null;
}

export function AdminSignOutButton({ isMock, lang, className }: AdminSignOutButtonProps) {
    const [pending, setPending] = useState(false);

    if (isMock) {
        return (
            <a href={`/admin/login?logout=true&lang=${lang}`} className={className}>
                Sign out (mock)
            </a>
        );
    }

    return (
        <button
            type="button"
            disabled={pending}
            className={cn("w-full text-start disabled:opacity-60", className)}
            onClick={async () => {
                const csrf = cookieValue(CSRF_COOKIE);
                if (!csrf) {
                    window.location.assign("/admin/login");
                    return;
                }
                setPending(true);
                try {
                    await fetch("/api/auth/logout", {
                        method: "POST",
                        headers: { [CSRF_HEADER]: csrf },
                    });
                } finally {
                    window.location.assign("/admin/login");
                }
            }}
        >
            {pending ? "Signing out..." : "Sign out"}
        </button>
    );
}
