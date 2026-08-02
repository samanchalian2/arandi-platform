import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../../_lib/http";
import { mapSection } from "../../_lib/mappers";
import { assertCompleteOwnedCollection, parseReorderItems } from "../../_lib/reorder";
import { hasAnyRole, readPrincipal, requirePermission } from "../../_lib/security";
import { parseLang, parseOptionalString, parseUuid, readJson } from "../../_lib/validation";

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
        const items = parseReorderItems(body.items);

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const updated = await prisma.$transaction(async (tx) => {
            const page = await tx.page.findUnique({
                where: { id: pageId },
                select: { id: true },
            });
            if (!page) {
                throw new Error("The supplied page does not exist.");
            }

            const submittedSections = await tx.section.findMany({
                where: { id: { in: items.map((item) => item.id) } },
                select: { id: true, pageId: true },
            });
            if (submittedSections.length !== items.length) {
                throw new Error("One or more Section ids are invalid.");
            }
            if (submittedSections.some((section) => section.pageId !== pageId)) {
                throw new Error("All Section items must belong to the supplied page.");
            }

            const currentSections = await tx.section.findMany({
                where: { pageId },
                select: { id: true, pageId: true },
            });
            assertCompleteOwnedCollection(
                items,
                currentSections.map((section) => ({ id: section.id, ownerId: section.pageId })),
                pageId,
                "Section",
            );

            await Promise.all(
                items.map((item) =>
                    tx.section.update({
                        where: { id: item.id },
                        data: { order: item.order },
                    }),
                ),
            );

            return tx.section.findMany({
                where: { pageId },
                include: { translations: true },
                orderBy: [{ order: "asc" }, { id: "asc" }],
            });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        return success(updated.map((section) => mapSection(section, lang, true)));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
            return failure("CONFLICT", "The Section order changed. Reload and try again.", 409);
        }

        const err = asError(error);
        if (
            err.message.includes("must")
            || err.message.includes("Duplicate")
            || err.message.includes("invalid")
            || err.message.includes("required")
            || err.message.includes("does not exist")
        ) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
