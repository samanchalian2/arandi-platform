import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { adminIdentityErrorResponse, AdminIdentityValidationError } from "../_lib/response";
import { requireAdminIdentityPermission } from "../_lib/security";

export const runtime = "nodejs";

function boundedInteger(value: string | null, fallback: number, maximum: number) {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
        throw new AdminIdentityValidationError("Invalid pagination.");
    }
    return parsed;
}

export async function GET(request: NextRequest) {
    try {
        await requireAdminIdentityPermission(request, "security_event.read");
        const page = boundedInteger(request.nextUrl.searchParams.get("page"), 1, 100_000);
        const pageSize = boundedInteger(request.nextUrl.searchParams.get("pageSize"), 25, 100);
        const eventType = request.nextUrl.searchParams.get("eventType")?.trim().slice(0, 100) || undefined;
        const outcome = request.nextUrl.searchParams.get("outcome")?.trim().slice(0, 40) || undefined;
        const where = {
            ...(eventType ? { eventType } : {}),
            ...(outcome ? { outcome } : {}),
        };
        const [total, events] = await prisma.$transaction([
            prisma.securityEvent.count({ where }),
            prisma.securityEvent.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    createdAt: true,
                    eventType: true,
                    outcome: true,
                    user: {
                        select: {
                            displayName: true,
                            email: true,
                            phoneE164: true,
                        },
                    },
                },
            }),
        ]);
        return NextResponse.json({
            items: events,
            page,
            pageSize,
            total,
            pageCount: Math.max(1, Math.ceil(total / pageSize)),
        });
    } catch (error) {
        return adminIdentityErrorResponse(error);
    }
}
