import type { NextRequest } from "next/server";

import {
    AUTH_SESSION_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    readDatabaseSession,
    validateDatabaseSessionCsrf,
} from "@/lib/auth";

export class AccountUnauthorizedError extends Error {}
export class AccountForbiddenError extends Error {}

export async function requireAccountPermission(
    request: NextRequest,
    permission: string,
    requireCsrf = false,
) {
    const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
    const session = await readDatabaseSession(sessionToken);
    if (!session) throw new AccountUnauthorizedError();
    if (!session.permissions.includes(permission)) throw new AccountForbiddenError();

    if (requireCsrf) {
        const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value ?? null;
        const csrfHeader = request.headers.get(CSRF_HEADER);
        if (!await validateDatabaseSessionCsrf(sessionToken, csrfCookie, csrfHeader)) {
            throw new AccountForbiddenError();
        }
    }
    return session;
}
