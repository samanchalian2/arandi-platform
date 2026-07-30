import type { AdminRole, AdminSession } from "./types";

import { hasRequiredRole } from "./rbac";

export function canAccess(session: AdminSession | null, requiredRoles: AdminRole[]): boolean {
    if (!session) {
        return false;
    }

    return hasRequiredRole(session.roles, requiredRoles);
}

export function getRoleBadge(roles: AdminRole[]): string {
    return roles[0] ?? "Viewer";
}
