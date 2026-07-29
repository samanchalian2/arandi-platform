import type { NextRequest } from "next/server";

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
    viewer: ["page.read", "section.read", "card.read", "theme.read", "media.read"],
};

export function readPrincipal(request: NextRequest): CmsPrincipal {
    const userId = request.headers.get("x-cms-user-id") ?? undefined;
    const rawRoles = request.headers.get("x-cms-roles") ?? "";
    const roles = rawRoles
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

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
