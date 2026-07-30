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
    if (pathname === "/admin") {
        return ADMIN_ROUTE_ROLES.root;
    }
    if (pathname === "/admin/dashboard") {
        return ADMIN_ROUTE_ROLES.dashboard;
    }
    if (pathname === "/admin/pages") {
        return ADMIN_ROUTE_ROLES.pages;
    }
    if (pathname === "/admin/sections") {
        return ADMIN_ROUTE_ROLES.sections;
    }
    if (pathname === "/admin/cards") {
        return ADMIN_ROUTE_ROLES.cards;
    }
    if (pathname === "/admin/media") {
        return ADMIN_ROUTE_ROLES.media;
    }
    if (pathname === "/admin/navigation") {
        return ADMIN_ROUTE_ROLES.navigation;
    }
    if (pathname === "/admin/theme") {
        return ADMIN_ROUTE_ROLES.theme;
    }
    if (pathname === "/admin/settings") {
        return ADMIN_ROUTE_ROLES.settings;
    }
    if (pathname === "/admin/users") {
        return ADMIN_ROUTE_ROLES.users;
    }

    return null;
}
