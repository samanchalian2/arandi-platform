import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
    readBoundedJson,
    requestBodyTooLarge,
    RequestBodyTooLargeError,
} from "@/app/api/auth/_lib/request";
import {
    AccountForbiddenError,
    AccountUnauthorizedError,
    requireAccountPermission,
} from "../_lib/security";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
    if (error instanceof RequestBodyTooLargeError) {
        return NextResponse.json({ message: "Request is too large." }, { status: 413 });
    }
    if (error instanceof AccountUnauthorizedError) {
        return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }
    if (error instanceof AccountForbiddenError) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    if (error instanceof SyntaxError || error instanceof TypeError) {
        return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }
    return NextResponse.json({ message: "Service requests are unavailable." }, { status: 503 });
}

export async function GET(request: NextRequest) {
    try {
        const session = await requireAccountPermission(request, "service_request.read");
        const items = await prisma.serviceRequest.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
                id: true,
                reference: true,
                subject: true,
                description: true,
                status: true,
                priority: true,
                createdAt: true,
            },
        });
        return NextResponse.json({ items });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        if (requestBodyTooLarge(request, 8_192)) {
            return NextResponse.json({ message: "Request is too large." }, { status: 413 });
        }
        const session = await requireAccountPermission(
            request,
            "service_request.create",
            true,
        );
        const body = await readBoundedJson(request, 8_192) as Record<string, unknown>;
        const subject = typeof body.subject === "string" ? body.subject.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";
        if (subject.length < 5 || subject.length > 120 || description.length < 20 || description.length > 4_000) {
            return NextResponse.json({ message: "Invalid subject or description." }, { status: 400 });
        }

        const item = await prisma.serviceRequest.create({
            data: {
                userId: session.userId,
                reference: `AR-${new Date().getUTCFullYear()}-${randomBytes(6).toString("hex").toUpperCase()}`,
                subject,
                description,
            },
            select: {
                id: true,
                reference: true,
                subject: true,
                description: true,
                status: true,
                priority: true,
                createdAt: true,
            },
        });
        return NextResponse.json({ item }, { status: 201 });
    } catch (error) {
        return errorResponse(error);
    }
}
