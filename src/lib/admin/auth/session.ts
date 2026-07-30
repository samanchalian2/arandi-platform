import { cookies, headers } from "next/headers";

import { ADMIN_ROLES, ADMIN_SESSION_COOKIE, type AdminRole, type AdminSession } from "./types";

function isAdminRole(value: string): value is AdminRole {
    return ADMIN_ROLES.includes(value as AdminRole);
}

function displayNameForRole(role: AdminRole): string {
    switch (role) {
        case "SuperAdmin":
            return "Super Admin";
        case "Admin":
            return "Admin User";
        case "Editor":
            return "Content Editor";
        case "Translator":
            return "Translator";
        default:
            return "Read-only Viewer";
    }
}

export async function getAdminSession(): Promise<AdminSession | null> {
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const headerStore = await headers();
    const roleFromHeader = headerStore.get("x-admin-role") ?? undefined;

    const role = roleFromCookie ?? roleFromHeader;
    if (!role || !isAdminRole(role)) {
        return null;
    }

    return {
        userId: `mock-${role.toLowerCase()}`,
        displayName: displayNameForRole(role),
        roles: [role],
        isMock: true,
    };
}
