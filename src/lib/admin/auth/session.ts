import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE, readDatabaseSession } from "@/lib/auth";

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

    if (isDevelopmentMockAuthEnabled()) {
        const roleFromCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
        if (roleFromCookie && isAdminRole(roleFromCookie)) {
            return {
                userId: `mock-${roleFromCookie.toLowerCase()}`,
                displayName: displayNameForRole(roleFromCookie),
                roles: [roleFromCookie],
                isMock: true,
            };
        }
    }

    const session = await readDatabaseSession(
        cookieStore.get(AUTH_SESSION_COOKIE)?.value,
    );
    if (!session) return null;

    const roles = session.roles.filter(isAdminRole);
    if (roles.length === 0) return null;

    return {
        userId: session.userId,
        displayName: session.displayName,
        roles,
        isMock: false,
    };
}
