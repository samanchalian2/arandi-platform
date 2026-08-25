import type { NextRequest } from "next/server";

import { requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import { parseReplyBody, parseReplySubject, sendContactReply } from "@/lib/contact";

import { asError, failure, success } from "../../../_lib/http";
import { readPrincipal, requirePermission } from "../../../_lib/security";
import { readJson } from "../../../_lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    if (requestBodyTooLarge(request, 16_384)) return failure("BAD_REQUEST", "Request is too large.", 413);
    const forbidden = await requirePermission(request, "contact.write");
    if (forbidden) return forbidden;
    try {
        const { id } = await context.params;
        const body = await readJson(request);
        const principal = await readPrincipal(request);
        if (!principal) return failure("UNAUTHORIZED", "Authentication required.", 401);
        const reply = await sendContactReply({ submissionId: id, authorId: principal.userId, subject: parseReplySubject(body.subject), body: parseReplyBody(body.body) });
        return success(reply, 201);
    } catch (error) {
        const err = asError(error);
        return failure(err.message.includes("does not exist") ? "NOT_FOUND" : "BAD_REQUEST", err.message, err.message.includes("does not exist") ? 404 : 400, err.details);
    }
}
