import type { NextRequest } from "next/server";

import {
    ADMIN_ROLES,
    ADMIN_SESSION_COOKIE,
    isDevelopmentMockAuthEnabled,
    type AdminRole,
} from "@/lib/admin/auth/types";
import {
    AUTH_SESSION_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    readDatabaseSession,
    validateDatabaseSessionCsrf,
} from "@/lib/auth";

import { failure } from "./http";

export type CmsPermission =
    | "page.read"
    | "page.write"
    | "page.delete"
    | "section.read"
    | "section.write"
    | "section.delete"
    | "card.read"
    | "card.write"
    | "card.translate"
    | "card.delete"
    | "theme.read"
    | "theme.write"
    | "media.read"
    | "media.write"
    | "media.delete"
    | "navigation.read"
    | "navigation.write"
    | "navigation.translate"
    | "navigation.delete"
    | "setting.read"
    | "setting.write";

export type CmsPrincipal = {
    userId: string;
    roles: string[];
    permissions: CmsPermission[];
    source: "development_mock" | "database_session";
};

const rolePermissions: Record<string, CmsPermission[]> = {
    super_admin: [
        "page.read",
        "page.write",
        "page.delete",
        "section.read",
        "section.write",
        "section.delete",
        "card.read",
        "card.write",
        "card.delete",
        "theme.read",
        "theme.write",
        "media.read",
        "media.write",
        "media.delete",
        "navigation.read",
        "navigation.write",
        "navigation.translate",
        "navigation.delete",
        "setting.read",
        "setting.write",
    ],
    cms_admin: [
        "page.read",
        "page.write",
        "page.delete",
        "section.read",
        "section.write",
        "section.delete",
        "card.read",
        "card.write",
        "card.delete",
        "theme.read",
        "theme.write",
        "media.read",
        "media.write",
        "navigation.read",
        "navigation.write",
        "navigation.translate",
        "navigation.delete",
        "setting.read",
        "setting.write",
    ],
    editor: ["page.read", "page.write", "section.read", "section.write", "card.read", "card.write", "media.read", "theme.read", "navigation.read", "navigation.write"],
    translator: ["page.read", "section.read", "section.write", "card.read", "card.translate", "theme.read", "media.read", "navigation.read", "navigation.translate"],
    viewer: ["page.read", "section.read", "card.read", "theme.read", "media.read"],
};

const adminToCmsRole: Record<string, string> = {
    SuperAdmin: "super_admin",
    Admin: "cms_admin",
    Editor: "editor",
    Translator: "translator",
    Viewer: "viewer",
};

function normalizeRoles(rawRoles: string[]): string[] {
    return rawRoles.map((role) => adminToCmsRole[role] ?? role);
}

function isAdminRole(value: string): value is AdminRole {
    return ADMIN_ROLES.includes(value as AdminRole);
}

export async function readPrincipal(request: NextRequest): Promise<CmsPrincipal | null> {
    if (isDevelopmentMockAuthEnabled()) {
        const adminRole = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        if (adminRole && isAdminRole(adminRole)) {
            return {
                userId: `mock-${adminRole.toLowerCase()}`,
                roles: normalizeRoles([adminRole]),
                permissions: normalizeRoles([adminRole]).flatMap(
                    (role) => rolePermissions[role] ?? [],
                ),
                source: "development_mock",
            };
        }
    }

    const session = await readDatabaseSession(
        request.cookies.get(AUTH_SESSION_COOKIE)?.value,
    );
    if (!session) return null;

    return {
        userId: session.userId,
        roles: normalizeRoles(session.roles),
        permissions: session.permissions.filter(
            (permission): permission is CmsPermission =>
                Object.values(rolePermissions).some((items) =>
                    items.includes(permission as CmsPermission)),
        ),
        source: "database_session",
    };
}

function canAccess(principal: CmsPrincipal, permission: CmsPermission): boolean {
    return principal.permissions.includes(permission);
}

function isMutationPermission(permission: CmsPermission): boolean {
    return !permission.endsWith(".read");
}

async function hasValidDatabaseCsrf(request: NextRequest, principal: CmsPrincipal) {
    if (principal.source !== "database_session") return true;
    const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
    return validateDatabaseSessionCsrf(
        sessionToken,
        request.cookies.get(CSRF_COOKIE)?.value ?? null,
        request.headers.get(CSRF_HEADER),
    );
}

export async function requirePermission(request: NextRequest, permission: CmsPermission) {
    const principal = await readPrincipal(request);
    if (!principal) {
        return failure("UNAUTHORIZED", "Authentication required.", 401);
    }

    if (!canAccess(principal, permission)) {
        return failure("FORBIDDEN", "Insufficient permission.", 403);
    }
    if (isMutationPermission(permission) && !await hasValidDatabaseCsrf(request, principal)) {
        return failure("FORBIDDEN", "Invalid CSRF token.", 403);
    }

    return null;
}

export async function requireAnyPermission(request: NextRequest, permissions: CmsPermission[]) {
    const principal = await readPrincipal(request);
    if (!principal) {
        return failure("UNAUTHORIZED", "Authentication required.", 401);
    }

    if (!permissions.some((permission) => canAccess(principal, permission))) {
        return failure("FORBIDDEN", "Insufficient permission.", 403);
    }
    if (
        permissions.some(isMutationPermission)
        && !await hasValidDatabaseCsrf(request, principal)
    ) {
        return failure("FORBIDDEN", "Invalid CSRF token.", 403);
    }

    return null;
}

export function hasAnyRole(principal: CmsPrincipal | null, roles: string[]): boolean {
    return principal?.roles.some((role) => roles.includes(role)) ?? false;
}
