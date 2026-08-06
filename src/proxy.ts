import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRequiredRolesForPath, hasRequiredRole } from "@/lib/admin/auth/rbac";
import {
    ADMIN_ROLES,
    ADMIN_SESSION_COOKIE,
    isDevelopmentMockAuthEnabled,
    type AdminRole,
} from "@/lib/admin/auth/types";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/csrf";
import { isPlausibleOpaqueToken } from "@/lib/auth/tokens";

function isAdminRole(value: string): value is AdminRole {
    return ADMIN_ROLES.includes(value as AdminRole);
}

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const roleParam = searchParams.get("mockRole");
    const logout = searchParams.get("logout") === "true";
    const mockAuthEnabled = isDevelopmentMockAuthEnabled();

    if (pathname === "/admin/login" && logout) {
        const response = NextResponse.redirect(new URL("/admin/login", request.url));
        response.cookies.delete(ADMIN_SESSION_COOKIE);
        return response;
    }

    if (pathname === "/admin/login" && mockAuthEnabled && roleParam && isAdminRole(roleParam)) {
        const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
        response.cookies.set(ADMIN_SESSION_COOKIE, roleParam, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });
        return response;
    }

    if (pathname === "/admin/login" || pathname === "/admin/forbidden") {
        return NextResponse.next();
    }

    const roleCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const hasMockSession = mockAuthEnabled && Boolean(roleCookie && isAdminRole(roleCookie));
    const hasDatabaseSession = isPlausibleOpaqueToken(
        request.cookies.get(AUTH_SESSION_COOKIE)?.value,
    );
    if (!hasMockSession && !hasDatabaseSession) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const requiredRoles = getRequiredRolesForPath(pathname);
    if (hasMockSession && roleCookie && isAdminRole(roleCookie) && requiredRoles && !hasRequiredRole([roleCookie], requiredRoles)) {
        return NextResponse.rewrite(new URL("/admin/forbidden", request.url), { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
