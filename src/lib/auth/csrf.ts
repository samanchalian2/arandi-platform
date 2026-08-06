import { constantTimeHashMatches, hashOpaqueToken } from "./tokens";

export const AUTH_SESSION_COOKIE = "arandi_session";
export const CSRF_COOKIE = "arandi_csrf";
export const CSRF_HEADER = "x-csrf-token";

export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    priority: "high" as const,
};

export const CSRF_COOKIE_OPTIONS = {
    httpOnly: false,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    priority: "high" as const,
};

export function verifyCsrfToken(storedHash: string, cookieToken: string | null, headerToken: string | null): boolean {
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return false;
    }
    return constantTimeHashMatches(storedHash, hashOpaqueToken(headerToken));
}
