import { cookies } from "next/headers";

import {
    ADMIN_ROLES,
    ADMIN_SESSION_COOKIE,
    isDevelopmentMockAuthEnabled,
    type AdminRole,
    type AdminSession,
} from "./types";

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

    if (!isDevelopmentMockAuthEnabled()) {
        return null;
    }

    const roleFromCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!roleFromCookie || !isAdminRole(roleFromCookie)) {
        return null;
    }

    return {
        userId: `mock-${roleFromCookie.toLowerCase()}`,
        displayName: displayNameForRole(roleFromCookie),
        roles: [roleFromCookie],
        isMock: true,
    };
}
