import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../../_lib/http";
import { mapSection } from "../../_lib/mappers";
import { hasAnyRole, readPrincipal, requirePermission } from "../../_lib/security";
import { parseLang, parseOptionalNumber, parseOptionalString, parseUuid, readJson } from "../../_lib/validation";

type ReorderItem = {
    id: string;
    order: number;
};

function parseItems(value: unknown): ReorderItem[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error("items must be a non-empty array.");
    }

    return value.map((item, index) => {
        if (!item || typeof item !== "object") {
            throw new Error(`items[${index}] must be an object.`);
        }

        const record = item as Record<string, unknown>;
        const id = parseUuid(String(record.id ?? ""), `items[${index}].id`);
        const order = parseOptionalNumber(record.order);

        if (order === undefined || !Number.isInteger(order) || order < 0) {
            throw new Error(`items[${index}].order must be a non-negative integer.`);
        }

        return { id, order };
    });
}

function ensureDistinct(values: string[], fieldName: string) {
    if (new Set(values).size !== values.length) {
        throw new Error(`Duplicate ${fieldName} values are not allowed.`);
    }
}

function ensureReorderRole(request: NextRequest) {
    const principal = readPrincipal(request);
    const allowed = hasAnyRole(principal, ["super_admin", "cms_admin", "editor"]);

    if (!allowed) {
        return failure("FORBIDDEN", "Insufficient permission to reorder sections.", 403);
    }

    return null;
}

export async function PATCH(request: NextRequest) {
    const forbidden = requirePermission(request, "section.write");
    if (forbidden) {
        return forbidden;
    }

    const reorderRoleError = ensureReorderRole(request);
    if (reorderRoleError) {
        return reorderRoleError;
    }

    try {
        const body = await readJson(request);
        const pageIdRaw = parseOptionalString(body.pageId);
        const pageId = parseUuid(pageIdRaw ?? "", "pageId");
        const items = parseItems(body.items);

        ensureDistinct(items.map((item) => item.id), "section id");
        ensureDistinct(items.map((item) => String(item.order)), "order");

        const sections = await prisma.section.findMany({
            where: {
                id: { in: items.map((item) => item.id) },
            },
        });

        if (sections.length !== items.length) {
            return failure("BAD_REQUEST", "One or more section ids are invalid.", 400);
        }

        const ownershipValid = sections.every((section) => section.pageId === pageId);
        if (!ownershipValid) {
            return failure("BAD_REQUEST", "All sections must belong to the provided pageId.", 400);
        }

        await prisma.$transaction(
            items.map((item) =>
                prisma.section.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const updated = await prisma.section.findMany({
            where: { pageId },
            include: { translations: true },
            orderBy: { order: "asc" },
        });

        return success(updated.map((section) => mapSection(section, lang, true)));
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Duplicate") || err.message.includes("invalid")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
