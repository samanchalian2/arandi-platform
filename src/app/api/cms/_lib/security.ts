import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth/types";

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
    | "card.delete"
    | "theme.read"
    | "theme.write"
    | "media.read"
    | "media.write"
    | "media.delete";

export type CmsPrincipal = {
    userId?: string;
    roles: string[];
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
    translator: ["page.read", "section.read", "section.write", "card.read", "theme.read", "media.read"],
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

export function readPrincipal(request: NextRequest): CmsPrincipal {
    const userId = request.headers.get("x-cms-user-id") ?? undefined;
    const rawHeaderRoles = request.headers.get("x-cms-roles") ?? "";
    const rolesFromHeader = rawHeaderRoles
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    if (rolesFromHeader.length > 0) {
        return { userId, roles: normalizeRoles(rolesFromHeader) };
    }

    const adminRole = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const roles = adminRole ? normalizeRoles([adminRole]) : [];

    return { userId, roles };
}

function canAccess(principal: CmsPrincipal, permission: CmsPermission): boolean {
    if (principal.roles.length === 0) {
        // Backward-compatible permissive mode until auth is implemented.
        return true;
    }

    return principal.roles.some((role) => (rolePermissions[role] ?? []).includes(permission));
}

export function requirePermission(request: NextRequest, permission: CmsPermission) {
    const principal = readPrincipal(request);
    if (!canAccess(principal, permission)) {
        return failure("FORBIDDEN", "Insufficient permission.", 403, { permission });
    }

    return null;
}

export function hasAnyRole(principal: CmsPrincipal, roles: string[]): boolean {
    return principal.roles.some((role) => roles.includes(role));
}
