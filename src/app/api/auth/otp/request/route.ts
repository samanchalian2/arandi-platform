import { NextResponse } from "next/server";

import { getSmsGateway } from "@/integrations/sms/gateway";
import {
    OtpRateLimitedError,
    requestLoginOtp,
    requireAuthPepper,
} from "@/lib/auth";
import {
    isSameOrigin,
    readBoundedJson,
    requestBodyTooLarge,
    RequestBodyTooLargeError,
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
        if (typeof body.phone !== "string") {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
        }

        await requestLoginOtp(
            body.phone,
            requireAuthPepper(),
            getSmsGateway(),
        );
        return NextResponse.json(
            { ok: true, message: "If the account is eligible, a code will be sent." },
            { status: 202 },
        );
    } catch (error) {
        if (error instanceof RequestBodyTooLargeError) {
            return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
        }
        if (error instanceof OtpRateLimitedError) {
            return NextResponse.json(
                { ok: true, message: "If the account is eligible, a code will be sent." },
                { status: 202 },
            );
        }
        if (error instanceof SyntaxError || error instanceof TypeError) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
        }
        return NextResponse.json(
            { ok: false, message: "SMS authentication is unavailable." },
            { status: 503 },
        );
    }
}
