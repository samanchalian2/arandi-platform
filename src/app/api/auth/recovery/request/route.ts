import { NextResponse } from "next/server";

import { getEmailGateway } from "@/integrations/email/gateway";
import { requestPasswordRecovery } from "@/lib/auth";
import {
    isSameOrigin,
    readBoundedJson,
    requestBodyTooLarge,
    RequestBodyTooLargeError,
} from "../../_lib/request";

export const runtime = "nodejs";

function recoveryBaseUrl(request: Request): string {
    const configured = process.env.APP_BASE_URL?.trim();
    const baseUrl = configured || new URL(request.url).origin;
    const parsed = new URL(baseUrl);
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
        throw new Error("APP_BASE_URL must use HTTPS in production.");
    }
    return parsed.origin;
}

export async function POST(request: Request) {
    try {
        if (!isSameOrigin(request)) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 403 });
        }
        if (requestBodyTooLarge(request)) {
            return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
        }
        const body = await readBoundedJson(request, 4_096) as Record<string, unknown>;
        if (typeof body.email !== "string") {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
        }

        const gateway = getEmailGateway();
        await requestPasswordRecovery(
            body.email,
            recoveryBaseUrl(request),
            gateway,
        );
        return NextResponse.json(
            { ok: true, message: "If the account is eligible, a recovery link will be sent." },
            { status: 202 },
        );
    } catch (error) {
        if (error instanceof RequestBodyTooLargeError) {
            return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
        }
        if (error instanceof SyntaxError || error instanceof TypeError) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
        }
        return NextResponse.json(
            { ok: false, message: "Email recovery is unavailable." },
            { status: 503 },
        );
    }
}
