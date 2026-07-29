import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../_lib/http";
import { mapCard } from "../_lib/mappers";
import { parseOrdering } from "../_lib/queries";
import { requirePermission } from "../_lib/security";
import {
    isRecord,
    parseLang,
    parseOptionalBoolean,
    parseOptionalNumber,
    parseOptionalString,
    parseOptionalStringArray,
    parseString,
    parseTranslations,
    parseUuid,
    readJson,
} from "../_lib/validation";

export async function GET(request: NextRequest) {
    const forbidden = requirePermission(request, "card.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const sectionId = searchParams.get("sectionId") ?? undefined;
        const active = searchParams.get("active");
        const ordering = parseOrdering(searchParams.get("ordering"), "asc");
        const lang = parseLang(searchParams.get("lang"));
        const includeTranslations = searchParams.get("translations") !== "false";

        const where: Prisma.CardWhereInput = {
            sectionId: sectionId ?? undefined,
            publishState: active === "true" ? "published" : undefined,
        };

        const cards = await prisma.card.findMany({
            where,
            include: {
                translations: true,
                media: true,
            },
            orderBy: {
                order: ordering,
            },
        });

        return success(cards.map((card) => mapCard(card, lang, includeTranslations)));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function POST(request: NextRequest) {
    const forbidden = requirePermission(request, "card.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const body = await readJson(request);
        const key = parseString(body.key, "key");
        const sectionIdRaw = parseOptionalString(body.sectionId);
        const sectionId = sectionIdRaw ? parseUuid(sectionIdRaw, "sectionId") : undefined;
        const variant = parseOptionalString(body.variant) ?? "genericCard";
        const order = parseOptionalNumber(body.order) ?? 0;
        const active = parseOptionalBoolean(body.active) ?? true;
        const mediaIdRaw = parseOptionalString(body.mediaId);
        const mediaId = mediaIdRaw ? parseUuid(mediaIdRaw, "mediaId") : undefined;
        const tags = parseOptionalStringArray(body.tags) ?? [];
        const metrics = isRecord(body.metrics) ? body.metrics : {};
        const payload = isRecord(body.payload) ? body.payload : {};
        const translations = parseTranslations(body.translations);

        const existing = await prisma.card.findUnique({ where: { key } });
        if (existing) {
            return failure("CONFLICT", "Card key already exists.", 409);
        }

        const created = await prisma.$transaction(async (tx) => {
            const card = await tx.card.create({
                data: {
                    key,
                    sectionId,
                    variant,
                    order,
                    publishState: active ? "published" : "draft",
                    mediaId,
                    tags,
                    metrics: metrics as Prisma.InputJsonValue,
                    payload: payload as Prisma.InputJsonValue,
                },
            });

            for (const [languageCode, translation] of Object.entries(translations)) {
                if (!translation?.title) {
                    continue;
                }

                await tx.cardTranslation.create({
                    data: {
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

            return tx.card.findUniqueOrThrow({
                where: { id: card.id },
                include: { translations: true, media: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        return success(mapCard(created, lang, true), 201);
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
