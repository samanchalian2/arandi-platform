import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_HOME_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { asError, failure, success } from "../../_lib/http";
import { mapCard } from "../../_lib/mappers";
import { assertCompleteOwnedCollection, parseReorderItems } from "../../_lib/reorder";
import { hasAnyRole, readPrincipal, requirePermission } from "../../_lib/security";
import { parseLang, parseUuid, readJson } from "../../_lib/validation";

export async function PATCH(request: NextRequest) {
    const forbidden = await requirePermission(request, "card.write");
    if (forbidden) {
        return forbidden;
    }

    const principal = await readPrincipal(request);
    if (!hasAnyRole(principal, ["super_admin", "cms_admin", "editor"])) {
        return failure("FORBIDDEN", "Insufficient permission to reorder Cards.", 403);
    }

    try {
        const body = await readJson(request);
        const sectionId = parseUuid(typeof body.sectionId === "string" ? body.sectionId : "", "sectionId");
        const items = parseReorderItems(body.items);
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));

        const updated = await prisma.$transaction(async (tx) => {
            const section = await tx.section.findUnique({
                where: { id: sectionId },
                select: { id: true },
            });
            if (!section) {
                throw new Error("The supplied Section does not exist.");
            }

            const submittedCards = await tx.card.findMany({
                where: { id: { in: items.map((item) => item.id) } },
                select: { id: true, sectionId: true },
            });
            if (submittedCards.length !== items.length) {
                throw new Error("One or more Card ids are invalid.");
            }
            if (submittedCards.some((card) => card.sectionId !== sectionId)) {
                throw new Error("All Card items must belong to the supplied Section.");
            }

            const currentCards = await tx.card.findMany({
                where: { sectionId },
                select: { id: true, sectionId: true },
            });
            assertCompleteOwnedCollection(
                items,
                currentCards.map((card) => ({ id: card.id, ownerId: card.sectionId })),
                sectionId,
                "Card",
            );

            await Promise.all(
                items.map((item) =>
                    tx.card.update({
                        where: { id: item.id },
                        data: { order: item.order },
                    }),
                ),
            );

            return tx.card.findMany({
                where: { sectionId },
                include: { translations: true, media: true },
                orderBy: [{ order: "asc" }, { id: "asc" }],
            });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        revalidatePublicContent(PUBLIC_HOME_TAG);
        return success(updated.map((card) => mapCard(card, lang, true)));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
            return failure("CONFLICT", "The Card order changed. Reload and try again.", 409);
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
        return failure("INTERNAL_ERROR", "Unable to reorder Cards.", 500);
    }
}
