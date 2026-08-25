import type { NextRequest } from "next/server";

import { requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import { getContactInbox, parseContactStatus } from "@/lib/contact";
import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../_lib/http";
import { readPrincipal, requirePermission } from "../_lib/security";
import { readJson } from "../_lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "contact.read");
    if (forbidden) return forbidden;
    try {
        const query = request.nextUrl.searchParams;
        const data = await getContactInbox({
            query: query.get("query") ?? undefined,
            status: query.get("status") ?? undefined,
            deliveryState: query.get("deliveryState") ?? undefined,
            language: query.get("language") ?? undefined,
            days: Number(query.get("days") ?? "90"),
        });
        return success(data);
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function PATCH(request: NextRequest) {
    if (requestBodyTooLarge(request, 8_192)) return failure("BAD_REQUEST", "Request is too large.", 413);
    const forbidden = await requirePermission(request, "contact.write");
    if (forbidden) return forbidden;
    try {
        const body = await readJson(request);
        const id = typeof body.id === "string" ? body.id : "";
        if (!id) throw new Error("Contact submission does not exist.");
        const status = parseContactStatus(body.status);
        const principal = await readPrincipal(request);
        const updated = await prisma.$transaction(async (tx) => {
            const submission = await tx.contactSubmission.update({ where: { id }, data: { status } });
            await tx.securityEvent.create({ data: { userId: principal?.source === "database_session" ? principal.userId : null, eventType: "contact.status.update", outcome: "success", metadata: { submissionId: id, status } } });
            return submission;
        });
        return success(updated);
    } catch (error) {
        const err = asError(error);
        return failure(err.message.includes("does not exist") ? "NOT_FOUND" : "BAD_REQUEST", err.message, err.message.includes("does not exist") ? 404 : 400, err.details);
    }
}
