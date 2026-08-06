import { NextRequest, NextResponse } from "next/server";

import { readBoundedJson, requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import {
    parseDisplayName,
    parseOptionalEmail,
    parseOptionalPhone,
    parseRoleKeys,
    parseStatus,
} from "@/lib/admin/users/input";
import { updateManagedUser } from "@/lib/admin/users/service";
import { parseUuid } from "@/app/api/cms/_lib/validation";
import { adminIdentityErrorResponse, AdminIdentityValidationError } from "../../_lib/response";
import { requireAdminIdentityPermission } from "../../_lib/security";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        if (requestBodyTooLarge(request, 8_192)) {
            return NextResponse.json({ message: "Request is too large." }, { status: 413 });
        }
        const principal = await requireAdminIdentityPermission(request, "user.write", true);
        let id: string;
        try {
            id = parseUuid((await context.params).id, "id");
        } catch {
            throw new AdminIdentityValidationError("Invalid user id.");
        }
        const body = await readBoundedJson(request, 8_192) as Record<string, unknown>;
        const item = await updateManagedUser(principal.userId, id, {
            displayName: parseDisplayName(body.displayName),
            email: parseOptionalEmail(body.email),
            phoneE164: parseOptionalPhone(body.phone),
            status: parseStatus(body.status),
            roleKeys: parseRoleKeys(body.roleKeys),
        });
        return NextResponse.json({ item });
    } catch (error) {
        return adminIdentityErrorResponse(error);
    }
}
