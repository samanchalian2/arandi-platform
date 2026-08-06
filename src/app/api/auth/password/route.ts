import { NextResponse } from "next/server";

import {
    AUTH_COOKIE_OPTIONS,
    AUTH_SESSION_COOKIE,
    authenticateWithPassword,
    CSRF_COOKIE,
    CSRF_COOKIE_OPTIONS,
    InvalidCredentialsError,
    requireAuthPepper,
} from "@/lib/auth";
import {
    isSameOrigin,
    readBoundedJson,
    requestBodyTooLarge,
    RequestBodyTooLargeError,
    requestIp,
} from "../_lib/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        if (!isSameOrigin(request)) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 403 });
        }
        if (requestBodyTooLarge(request)) {
            return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
        }
        const body = await readBoundedJson(request, 4_096) as Record<string, unknown>;
        if (typeof body.identifier !== "string" || typeof body.password !== "string") {
            return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
        }

        const session = await authenticateWithPassword(
            body.identifier,
            body.password,
            {
                ip: requestIp(request),
                userAgent: request.headers.get("user-agent"),
                pepper: requireAuthPepper(),
            },
        );
        const response = NextResponse.json({ ok: true });
        response.cookies.set(AUTH_SESSION_COOKIE, session.sessionToken, {
            ...AUTH_COOKIE_OPTIONS,
            expires: session.expiresAt,
        });
        response.cookies.set(CSRF_COOKIE, session.csrfToken, {
            ...CSRF_COOKIE_OPTIONS,
            expires: session.expiresAt,
        });
        return response;
    } catch (error) {
        if (error instanceof RequestBodyTooLargeError) {
            return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
        }
        if (error instanceof SyntaxError || error instanceof TypeError) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
        }
        if (error instanceof InvalidCredentialsError) {
            return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
        }
        return NextResponse.json({ ok: false, message: "Authentication is unavailable." }, { status: 503 });
    }
}
