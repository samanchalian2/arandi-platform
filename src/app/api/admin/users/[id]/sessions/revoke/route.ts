import { NextRequest, NextResponse } from "next/server";

import { parseUuid } from "@/app/api/cms/_lib/validation";
import { revokeManagedUserSessions } from "@/lib/admin/users/service";
import { adminIdentityErrorResponse, AdminIdentityValidationError } from "../../../../_lib/response";
import { requireAdminIdentityPermission } from "../../../../_lib/security";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const principal = await requireAdminIdentityPermission(request, "session.revoke", true);
        let id: string;
        try {
            id = parseUuid((await context.params).id, "id");
        } catch {
            throw new AdminIdentityValidationError("Invalid user id.");
        }
        return NextResponse.json(await revokeManagedUserSessions(principal.userId, id));
    } catch (error) {
        return adminIdentityErrorResponse(error);
    }
}
