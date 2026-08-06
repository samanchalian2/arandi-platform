import { NextResponse } from "next/server";

import {
    consumePasswordRecovery,
    RecoveryRejectedError,
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
        if (typeof body.token !== "string" || typeof body.password !== "string") {
            return NextResponse.json(
                { ok: false, message: "The recovery link is invalid or expired." },
                { status: 400 },
            );
        }
        await consumePasswordRecovery(body.token, body.password);
        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof RequestBodyTooLargeError) {
            return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
        }
        if (error instanceof RecoveryRejectedError) {
            return NextResponse.json(
                { ok: false, message: "The recovery link is invalid or expired." },
                { status: 400 },
            );
        }
        if (error instanceof SyntaxError || error instanceof TypeError) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
        }
        if (error instanceof Error && error.message.startsWith("Password must")) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
        }
        return NextResponse.json(
            { ok: false, message: "Password recovery is unavailable." },
            { status: 503 },
        );
    }
}
