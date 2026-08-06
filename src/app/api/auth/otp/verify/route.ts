import { NextResponse } from "next/server";

import {
    AUTH_COOKIE_OPTIONS,
    AUTH_SESSION_COOKIE,
    CSRF_COOKIE,
    CSRF_COOKIE_OPTIONS,
    OtpRejectedError,
    requireAuthPepper,
    verifyLoginOtp,
} from "@/lib/auth";
import {
    isSameOrigin,
    readBoundedJson,
    requestBodyTooLarge,
    RequestBodyTooLargeError,
    requestIp,
} from "../../_lib/request";

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
        if (typeof body.phone !== "string" || typeof body.code !== "string") {
            return NextResponse.json(
                { ok: false, message: "The verification code is invalid or expired." },
                { status: 401 },
            );
        }

        const session = await verifyLoginOtp(body.phone, body.code, {
            ip: requestIp(request),
            userAgent: request.headers.get("user-agent"),
            pepper: requireAuthPepper(),
        });
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
        if (error instanceof OtpRejectedError || error instanceof SyntaxError || error instanceof TypeError) {
            return NextResponse.json(
                { ok: false, message: "The verification code is invalid or expired." },
                { status: 401 },
            );
        }
        return NextResponse.json(
            { ok: false, message: "SMS authentication is unavailable." },
            { status: 503 },
        );
    }
}
