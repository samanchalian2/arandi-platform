import { NextRequest, NextResponse } from "next/server";

import {
    AUTH_COOKIE_OPTIONS,
    AUTH_SESSION_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    revokeDatabaseSession,
    validateDatabaseSessionCsrf,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
    const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value ?? null;
    const csrfHeader = request.headers.get(CSRF_HEADER);

    if (!await validateDatabaseSessionCsrf(sessionToken, csrfCookie, csrfHeader)) {
        return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 403 });
    }

    if (sessionToken) {
        await revokeDatabaseSession(sessionToken);
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_SESSION_COOKIE, "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });
    response.cookies.set(CSRF_COOKIE, "", {
        ...AUTH_COOKIE_OPTIONS,
        httpOnly: false,
        maxAge: 0,
    });
    return response;
}
