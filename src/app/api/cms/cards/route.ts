import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_HOME_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { parseCardCreateInput } from "../_lib/card-input";
import { asError, failure, success } from "../_lib/http";
import { mapCard } from "../_lib/mappers";
import { parseOrdering } from "../_lib/queries";
import { requirePermission } from "../_lib/security";
import { parseLang, parseUuid, readJson } from "../_lib/validation";

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "card.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const rawSectionId = searchParams.get("sectionId");
        const sectionId = rawSectionId ? parseUuid(rawSectionId, "sectionId") : undefined;
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
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", "Unable to load Cards.", 500);
    }
}

export async function POST(request: NextRequest) {
    const forbidden = await requirePermission(request, "card.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const body = await readJson(request);
        const input = parseCardCreateInput(body);

        const existing = await prisma.card.findUnique({ where: { key: input.key } });
        if (existing) {
            return failure("CONFLICT", "Card key already exists.", 409);
        }

        const created = await prisma.$transaction(async (tx) => {
            if (input.sectionId) {
                const section = await tx.section.findUnique({
                    where: { id: input.sectionId },
                    select: { id: true },
                });
                if (!section) throw new Error("Referenced Section does not exist.");
            }
            if (input.mediaId) {
                const media = await tx.media.findUnique({
                    where: { id: input.mediaId },
                    select: { id: true },
                });
                if (!media) throw new Error("Referenced Media does not exist.");
            }

            const card = await tx.card.create({
                data: {
                    key: input.key,
                    sectionId: input.sectionId,
                    variant: input.variant,
                    order: input.order,
                    publishState: input.publishState,
                    mediaId: input.mediaId,
                    tags: input.tags,
                    metrics: input.metrics as Prisma.InputJsonValue,
                    payload: input.payload as Prisma.InputJsonValue,
                },
            });

            for (const [languageCode, translation] of Object.entries(input.translations)) {
                if (!translation) continue;

                await tx.cardTranslation.create({
                    data: {
                        cardId: card.id,
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

            return tx.card.findUniqueOrThrow({
                where: { id: card.id },
                include: { translations: true, media: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        revalidatePublicContent(PUBLIC_HOME_TAG);
        return success(mapCard(created, lang, true), 201);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") return failure("CONFLICT", "Card key already exists.", 409);
            if (error.code === "P2003") return failure("BAD_REQUEST", "Referenced Section or Media is invalid.", 400);
        }
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected") || err.message.includes("does not exist")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", "Unable to create Card.", 500);
    }
}
