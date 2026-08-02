import type { NextRequest } from "next/server";

import {
    ADMIN_ROLES,
    ADMIN_SESSION_COOKIE,
    isDevelopmentMockAuthEnabled,
    type AdminRole,
} from "@/lib/admin/auth/types";

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
    | "media.delete";

export type CmsPrincipal = {
    userId: string;
    roles: string[];
    source: "development_mock";
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
    ],
    editor: ["page.read", "page.write", "section.read", "section.write", "card.read", "card.write", "media.read"],
    translator: ["page.read", "section.read", "section.write", "card.read", "card.translate", "theme.read", "media.read"],
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

export function readPrincipal(request: NextRequest): CmsPrincipal | null {
    if (!isDevelopmentMockAuthEnabled()) {
        return null;
    }

    const adminRole = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!adminRole || !isAdminRole(adminRole)) {
        return null;
    }

    return {
        userId: `mock-${adminRole.toLowerCase()}`,
        roles: normalizeRoles([adminRole]),
        source: "development_mock",
    };
}

function canAccess(principal: CmsPrincipal, permission: CmsPermission): boolean {
    return principal.roles.some((role) => (rolePermissions[role] ?? []).includes(permission));
}

export function requirePermission(request: NextRequest, permission: CmsPermission) {
    const principal = readPrincipal(request);
    if (!principal) {
        return failure("UNAUTHORIZED", "Authentication required.", 401);
    }

    if (!canAccess(principal, permission)) {
        return failure("FORBIDDEN", "Insufficient permission.", 403);
    }

    return null;
}

export function requireAnyPermission(request: NextRequest, permissions: CmsPermission[]) {
    const principal = readPrincipal(request);
    if (!principal) {
        return failure("UNAUTHORIZED", "Authentication required.", 401);
    }

    if (!permissions.some((permission) => canAccess(principal, permission))) {
        return failure("FORBIDDEN", "Insufficient permission.", 403);
    }

    return null;
}

export function hasAnyRole(principal: CmsPrincipal | null, roles: string[]): boolean {
    return principal?.roles.some((role) => roles.includes(role)) ?? false;
}
