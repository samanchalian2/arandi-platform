import type { NextRequest } from "next/server";

import {
    ADMIN_SESSION_COOKIE,
    isDevelopmentMockAuthEnabled,
} from "@/lib/admin/auth/types";
import {
    AUTH_SESSION_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    readDatabaseSession,
    validateDatabaseSessionCsrf,
} from "@/lib/auth";

export type AdminIdentityPermission =
    | "user.read"
    | "user.write"
    | "security_event.read"
    | "session.revoke";

export type AdminIdentityPrincipal = {
    userId: string;
    roles: string[];
    permissions: string[];
    isMock: boolean;
};

export class AdminIdentityUnauthorizedError extends Error {}
export class AdminIdentityForbiddenError extends Error {}

const mockPermissions: Record<string, AdminIdentityPermission[]> = {
    SuperAdmin: ["user.read", "user.write", "security_event.read", "session.revoke"],
    Admin: ["user.read", "security_event.read"],
};

export async function requireAdminIdentityPermission(
    request: NextRequest,
    permission: AdminIdentityPermission,
    requireCsrf = false,
): Promise<AdminIdentityPrincipal> {
    if (isDevelopmentMockAuthEnabled()) {
        const role = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        const permissions = role ? mockPermissions[role] ?? [] : [];
        if (role && permissions.includes(permission)) {
            if (requireCsrf) throw new AdminIdentityForbiddenError();
            return {
                userId: `mock-${role.toLowerCase()}`,
                roles: [role],
                permissions,
                isMock: true,
            };
        }
    }

    const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
    const session = await readDatabaseSession(sessionToken);
    if (!session) throw new AdminIdentityUnauthorizedError();
    if (!session.permissions.includes(permission)) throw new AdminIdentityForbiddenError();

    if (requireCsrf) {
        const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value ?? null;
        const csrfHeader = request.headers.get(CSRF_HEADER);
        if (!await validateDatabaseSessionCsrf(sessionToken, csrfCookie, csrfHeader)) {
            throw new AdminIdentityForbiddenError();
        }
    }

    return {
        userId: session.userId,
        roles: session.roles,
        permissions: session.permissions,
        isMock: false,
    };
}
