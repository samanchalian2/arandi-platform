import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { getCardUpdateScopeError, isStaleCardUpdate, parseCardUpdateInput } from "../../_lib/card-input";
import { asError, failure, success } from "../../_lib/http";
import { mapCard } from "../../_lib/mappers";
import { hasAnyRole, readPrincipal, requireAnyPermission, requirePermission } from "../../_lib/security";
import { parseLang, parseUuid, readJson } from "../../_lib/validation";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "card.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const includeTranslations = request.nextUrl.searchParams.get("translations") !== "false";

        const card = await prisma.card.findUnique({
            where: { id },
            include: { translations: true, media: true },
        });
        if (!card) {
            return failure("NOT_FOUND", "Card not found.", 404);
        }

        return success(mapCard(card, lang, includeTranslations));
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", "Unable to load Card.", 500);
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    const forbidden = requireAnyPermission(request, ["card.write", "card.translate"]);
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");
        const body = await readJson(request);
        const input = parseCardUpdateInput(body);
        const principal = readPrincipal(request);
        const translatorOnly = hasAnyRole(principal, ["translator"])
            && !hasAnyRole(principal, ["super_admin", "cms_admin", "editor"]);

        const scopeError = getCardUpdateScopeError(translatorOnly, input);
        if (scopeError) {
            return failure("FORBIDDEN", scopeError, 403);
        }

        const updated = await prisma.$transaction(async (tx) => {
            const existing = await tx.card.findUnique({
                where: { id },
                select: { id: true, updatedAt: true },
            });
            if (!existing) {
                throw new CardNotFoundError();
            }

            if (isStaleCardUpdate(existing.updatedAt, input.expectedUpdatedAt)) {
                throw new StaleCardUpdateError();
            }

            if (input.sectionId) {
                const section = await tx.section.findUnique({
                    where: { id: input.sectionId },
                    select: { id: true },
                });
                if (!section) {
                    throw new Error("Referenced Section does not exist.");
                }
            }

            if (input.mediaId) {
                const media = await tx.media.findUnique({
                    where: { id: input.mediaId },
                    select: { id: true },
                });
                if (!media) {
                    throw new Error("Referenced Media does not exist.");
                }
            }

            const updateResult = await tx.card.updateMany({
                where: {
                    id,
                    updatedAt: input.expectedUpdatedAt ?? undefined,
                },
                data: {
                    key: input.key,
                    sectionId: input.sectionId,
                    variant: input.variant,
                    order: input.order,
                    publishState: input.publishState,
                    mediaId: input.mediaId,
                    tags: input.tags,
                    metrics: input.metrics as Prisma.InputJsonValue | undefined,
                    payload: input.payload as Prisma.InputJsonValue | undefined,
                    updatedAt: new Date(),
                },
            });
            if (updateResult.count !== 1) {
                throw new StaleCardUpdateError();
            }

            if (input.translations) {
                for (const [languageCode, translation] of Object.entries(input.translations)) {
                    if (!translation) {
                        continue;
                    }

                    await tx.cardTranslation.upsert({
                        where: {
                            cardId_languageCode: {
                                cardId: id,
                                languageCode,
                            },
                        },
                        update: {
                            title: translation.title,
                            subtitle: translation.subtitle,
                            description: translation.description,
                            statusBadge: translation.statusBadge,
                            ctaLabel: translation.ctaLabel,
                            ctaHref: translation.ctaHref,
                        },
                        create: {
                            cardId: id,
                            languageCode,
                            title: translation.title!,
                            subtitle: translation.subtitle,
                            description: translation.description,
                            statusBadge: translation.statusBadge,
                            ctaLabel: translation.ctaLabel,
                            ctaHref: translation.ctaHref,
                        },
                    });
                }
            }

            return tx.card.findUniqueOrThrow({
                where: { id },
                include: { translations: true, media: true },
            });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        return success(mapCard(updated, lang, true));
    } catch (error) {
        if (error instanceof CardNotFoundError) {
            return failure("NOT_FOUND", "Card not found.", 404);
        }
        if (error instanceof StaleCardUpdateError) {
            return failure("CONFLICT", "The Card changed since it was loaded. Reload and try again.", 409);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return failure("CONFLICT", "Card key already exists.", 409);
            }
            if (error.code === "P2003") {
                return failure("BAD_REQUEST", "Referenced Section or Media is invalid.", 400);
            }
            if (error.code === "P2025") {
                return failure("NOT_FOUND", "Card not found.", 404);
            }
            if (error.code === "P2034") {
                return failure("CONFLICT", "The Card changed during the update. Reload and try again.", 409);
            }
        }

        const err = asError(error);
        if (
            err.message.includes("must")
            || err.message.includes("Duplicate")
            || err.message.includes("does not exist")
        ) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", "Unable to update Card.", 500);
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "card.delete");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");

        const deleted = await prisma.card.deleteMany({ where: { id } });
        if (deleted.count === 0) {
            return failure("NOT_FOUND", "Card not found.", 404);
        }

        return success({ id, deleted: true });
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", "Unable to delete Card.", 500);
    }
}

class CardNotFoundError extends Error {}
class StaleCardUpdateError extends Error {}
