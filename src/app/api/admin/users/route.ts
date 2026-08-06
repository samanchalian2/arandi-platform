import { NextRequest, NextResponse } from "next/server";

import { readBoundedJson, requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import { validatePassword } from "@/lib/auth";
import {
    MANAGEABLE_ROLE_KEYS,
    parseDisplayName,
    parseOptionalEmail,
    parseOptionalPhone,
    parseRoleKeys,
    type ManageableRoleKey,
} from "@/lib/admin/users/input";
import {
    createManagedUser,
    listManagedUsers,
} from "@/lib/admin/users/service";
import { adminIdentityErrorResponse, AdminIdentityValidationError } from "../_lib/response";
import { requireAdminIdentityPermission } from "../_lib/security";

export const runtime = "nodejs";

function positiveInteger(value: string | null, fallback: number, maximum: number) {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
        throw new AdminIdentityValidationError("Invalid pagination.");
    }
    return parsed;
}

export async function GET(request: NextRequest) {
    try {
        await requireAdminIdentityPermission(request, "user.read");
        const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 100) || undefined;
        const rawStatus = request.nextUrl.searchParams.get("status");
        if (rawStatus && rawStatus !== "active" && rawStatus !== "suspended") {
            throw new AdminIdentityValidationError("Invalid status filter.");
        }
        const rawRole = request.nextUrl.searchParams.get("role");
        if (rawRole && !MANAGEABLE_ROLE_KEYS.includes(rawRole as ManageableRoleKey)) {
            throw new AdminIdentityValidationError("Invalid role filter.");
        }
        return NextResponse.json(await listManagedUsers({
            query,
            status: rawStatus as "active" | "suspended" | undefined,
            role: rawRole as ManageableRoleKey | undefined,
            page: positiveInteger(request.nextUrl.searchParams.get("page"), 1, 100_000),
            pageSize: positiveInteger(request.nextUrl.searchParams.get("pageSize"), 25, 100),
        }));
    } catch (error) {
        return adminIdentityErrorResponse(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        if (requestBodyTooLarge(request, 8_192)) {
            return NextResponse.json({ message: "Request is too large." }, { status: 413 });
        }
        const principal = await requireAdminIdentityPermission(request, "user.write", true);
        const body = await readBoundedJson(request, 8_192) as Record<string, unknown>;
        const password = body.password;
        if (password !== undefined && password !== "") {
            if (typeof password !== "string") throw new AdminIdentityValidationError("Password is invalid.");
            validatePassword(password);
        }
        const item = await createManagedUser(principal.userId, {
            displayName: parseDisplayName(body.displayName),
            email: parseOptionalEmail(body.email),
            phoneE164: parseOptionalPhone(body.phone),
            roleKeys: parseRoleKeys(body.roleKeys),
            ...(typeof password === "string" && password ? { password } : {}),
        });
        return NextResponse.json({ item }, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message.startsWith("Password must")) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        return adminIdentityErrorResponse(error);
    }
}
