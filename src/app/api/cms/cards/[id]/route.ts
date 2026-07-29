import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../../_lib/http";
import { mapCard } from "../../_lib/mappers";
import { requirePermission } from "../../_lib/security";
import {
    isRecord,
    parseLang,
    parseOptionalBoolean,
    parseOptionalNumber,
    parseOptionalString,
    parseOptionalStringArray,
    parseTranslations,
    parseUuid,
    readJson,
} from "../../_lib/validation";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "card.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");
        const body = await readJson(request);

        const key = parseOptionalString(body.key);
        const sectionIdRaw = parseOptionalString(body.sectionId);
        const sectionId = sectionIdRaw ? parseUuid(sectionIdRaw, "sectionId") : undefined;
        const variant = parseOptionalString(body.variant);
        const order = parseOptionalNumber(body.order);
        const active = parseOptionalBoolean(body.active);
        const status = parseOptionalString(body.status);
        const mediaIdRaw = parseOptionalString(body.mediaId);
        const mediaId = mediaIdRaw ? parseUuid(mediaIdRaw, "mediaId") : undefined;
        const tags = parseOptionalStringArray(body.tags);
        const metrics = isRecord(body.metrics) ? body.metrics : undefined;
        const payload = isRecord(body.payload) ? body.payload : undefined;
        const translations = body.translations ? parseTranslations(body.translations) : undefined;

        const existing = await prisma.card.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Card not found.", 404);
        }

        const publishState = status ?? (active === undefined ? undefined : active ? "published" : "draft");

        const updated = await prisma.$transaction(async (tx) => {
            const card = await tx.card.update({
                where: { id },
                data: {
                    key: key ?? undefined,
                    sectionId: sectionId ?? undefined,
                    variant: variant ?? undefined,
                    order: order ?? undefined,
                    publishState: publishState ?? undefined,
                    mediaId: mediaId ?? undefined,
                    tags: tags ?? undefined,
                    metrics: (metrics as Prisma.InputJsonValue | undefined) ?? undefined,
                    payload: (payload as Prisma.InputJsonValue | undefined) ?? undefined,
                },
            });

            if (translations) {
                for (const [languageCode, translation] of Object.entries(translations)) {
                    if (!translation?.title) {
                        continue;
                    }

                    await tx.cardTranslation.upsert({
                        where: {
                            cardId_languageCode: {
                                cardId: card.id,
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
                            cardId: card.id,
                            languageCode,
                            title: translation.title,
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
                where: { id: card.id },
                include: { translations: true, media: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        return success(mapCard(updated, lang, true));
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
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

        const existing = await prisma.card.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Card not found.", 404);
        }

        await prisma.card.delete({ where: { id } });
        return success({ id, deleted: true });
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
