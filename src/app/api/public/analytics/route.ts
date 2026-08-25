import { NextResponse } from "next/server";

import { recordPageView } from "@/lib/analytics";

import { isSameOrigin } from "../../auth/_lib/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        if (!isSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
        if (request.headers.get("dnt") === "1") return NextResponse.json({ ok: true, tracked: false }, { status: 202 });
        if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({ ok: false }, { status: 415 });
        const body = await request.json() as Record<string, unknown>;
        if (body.consent !== true) return NextResponse.json({ ok: true, tracked: false }, { status: 202 });
        await recordPageView({
            visitorToken: body.visitorToken as string,
            sessionToken: body.sessionToken as string,
            path: body.path as string,
            language: body.language === "fa" ? "fa" : "en",
            referrer: typeof body.referrer === "string" ? body.referrer : null,
            userAgent: request.headers.get("user-agent"),
        });
        return NextResponse.json({ ok: true, tracked: true }, { status: 202 });
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }
}
