import type { NextRequest } from "next/server";

import { resendContactNotification } from "@/lib/contact";

import { asError, failure, success } from "../../../_lib/http";
import { readPrincipal, requirePermission } from "../../../_lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const forbidden = await requirePermission(request, "contact.write");
    if (forbidden) return forbidden;
    try {
        const principal = await readPrincipal(request);
        if (!principal) return failure("UNAUTHORIZED", "Authentication required.", 401);
        const { id } = await context.params;
        return success(await resendContactNotification({ submissionId: id, authorId: principal.userId }));
    } catch (error) {
        const err = asError(error);
        return failure(err.message.includes("does not exist") ? "NOT_FOUND" : "BAD_REQUEST", err.message, err.message.includes("does not exist") ? 404 : 400, err.details);
    }
}
