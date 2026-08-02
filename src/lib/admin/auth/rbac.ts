import type { AdminRole } from "./types";

export const ADMIN_ROUTE_ROLES = {
    root: ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"],
    dashboard: ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"],
    pages: ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"],
    sections: ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"],
    cards: ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"],
    media: ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"],
    navigation: ["SuperAdmin", "Admin", "Editor", "Translator"],
    theme: ["SuperAdmin", "Admin"],
    settings: ["SuperAdmin", "Admin"],
    users: ["SuperAdmin", "Admin"],
} as const satisfies Record<string, AdminRole[]>;

export function hasRequiredRole(current: AdminRole[], required: AdminRole[]): boolean {
    return required.some((role) => current.includes(role));
}

export function getRequiredRolesForPath(pathname: string): AdminRole[] | null {
    const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

    if (normalizedPath === "/admin") {
        return ADMIN_ROUTE_ROLES.root;
    }

    const routePolicies: Array<[prefix: string, roles: AdminRole[]]> = [
        ["/admin/dashboard", ADMIN_ROUTE_ROLES.dashboard],
        ["/admin/pages", ADMIN_ROUTE_ROLES.pages],
        ["/admin/sections", ADMIN_ROUTE_ROLES.sections],
        ["/admin/cards", ADMIN_ROUTE_ROLES.cards],
        ["/admin/media", ADMIN_ROUTE_ROLES.media],
        ["/admin/navigation", ADMIN_ROUTE_ROLES.navigation],
        ["/admin/theme", ADMIN_ROUTE_ROLES.theme],
        ["/admin/settings", ADMIN_ROUTE_ROLES.settings],
        ["/admin/users", ADMIN_ROUTE_ROLES.users],
    ];

    for (const [prefix, roles] of routePolicies) {
        if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
            return roles;
        }
    }

    return null;
}
