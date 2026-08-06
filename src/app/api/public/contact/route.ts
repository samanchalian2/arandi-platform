import { NextResponse } from "next/server";

import { getEmailGateway } from "@/integrations/email/gateway";
import { normalizeEmail } from "@/lib/auth/identifiers";
import { requireAuthPepper } from "@/lib/auth/secrets";
import {
    ContactRateLimitError,
    ContactValidationError,
    acceptContactSubmission,
    parseContactSubmissionInput,
} from "@/lib/contact";
import { prisma } from "@/lib/prisma";

import {
    isSameOrigin,
    requestIp,
} from "../../auth/_lib/request";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8_192;

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

async function notificationRecipient(language: "en" | "fa"): Promise<string> {
    const configured = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
    if (configured) return normalizeEmail(configured);
    const setting = await prisma.setting.findUnique({
        where: { key: "site.contact" },
        select: { isPublic: true, value: true },
    });
    const root = setting?.isPublic ? asRecord(setting.value) : null;
    const localized = root ? asRecord(root[language]) : null;
    if (!localized || typeof localized.email !== "string") {
        throw new Error("Contact notification recipient is unavailable.");
    }
    return normalizeEmail(localized.email);
}

export async function POST(request: Request) {
    try {
        if (!isSameOrigin(request)) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 403 });
        }
        if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
            return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 415 });
        }
        const rawBody = await request.text();
        if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
            return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
        }
        const body = JSON.parse(rawBody) as unknown;
        const record = asRecord(body);
        if (!record) throw new ContactValidationError("Invalid request.");

        // Honeypot submissions receive the same accepted response but are not persisted.
        if (typeof record.website === "string" && record.website.trim().length > 0) {
            return NextResponse.json({ ok: true, message: "Your request has been received." }, { status: 202 });
        }

        const input = parseContactSubmissionInput(record);
        const result = await acceptContactSubmission(
            input,
            {
                ip: requestIp(request),
                userAgent: request.headers.get("user-agent"),
                pepper: requireAuthPepper(),
            },
            getEmailGateway(),
            await notificationRecipient(input.language),
        );
        return NextResponse.json({
            ok: true,
            reference: result.reference,
            message: input.language === "fa"
                ? "درخواست شما ثبت شد."
                : "Your request has been received.",
        }, { status: 202 });
    } catch (error) {
        if (error instanceof ContactRateLimitError) {
            return NextResponse.json(
                { ok: false, message: "Please wait before sending another request." },
                { status: 429, headers: { "Retry-After": "60" } },
            );
        }
        if (error instanceof ContactValidationError || error instanceof SyntaxError) {
            return NextResponse.json({ ok: false, message: "Please check the submitted fields." }, { status: 400 });
        }
        return NextResponse.json({ ok: false, message: "Contact submission is unavailable." }, { status: 503 });
    }
}
