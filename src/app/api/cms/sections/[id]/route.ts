import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../../_lib/http";
import { mapSection } from "../../_lib/mappers";
import { requirePermission } from "../../_lib/security";
import {
    isRecord,
    parseLang,
    parseOptionalBoolean,
    parseOptionalNumber,
    parseOptionalString,
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
    const forbidden = requirePermission(request, "section.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");
        const body = await readJson(request);

        const key = parseOptionalString(body.key);
        const type = parseOptionalString(body.type);
        const order = parseOptionalNumber(body.order);
        const visibility = isRecord(body.visibility) ? body.visibility : undefined;
        const enabled = visibility ? parseOptionalBoolean(visibility.enabled) : undefined;
        const style = isRecord(body.style) ? body.style : undefined;
        const payload = isRecord(body.payload) ? body.payload : undefined;
        const translations = body.translations ? parseTranslations(body.translations) : undefined;

        const existing = await prisma.section.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Section not found.", 404);
        }

        const updated = await prisma.$transaction(async (tx) => {
            const section = await tx.section.update({
                where: { id },
                data: {
                    key: key ?? undefined,
                    sectionType: type ?? undefined,
                    order: order ?? undefined,
                    enabled: enabled ?? undefined,
                    style: (style as Prisma.InputJsonValue | undefined) ?? undefined,
                    payload: (payload as Prisma.InputJsonValue | undefined) ?? undefined,
                },
            });

            if (translations) {
                for (const [languageCode, translation] of Object.entries(translations)) {
                    await tx.sectionTranslation.upsert({
                        where: {
                            sectionId_languageCode: {
                                sectionId: section.id,
                                languageCode,
                            },
                        },
                        update: {
                            title: translation?.title,
                            subtitle: translation?.subtitle,
                            description: translation?.description,
                            data: (translation?.data ?? {}) as Prisma.InputJsonValue,
                        },
                        create: {
                            sectionId: section.id,
                            languageCode,
                            title: translation?.title,
                            subtitle: translation?.subtitle,
                            description: translation?.description,
                            data: (translation?.data ?? {}) as Prisma.InputJsonValue,
                        },
                    });
                }
            }

            return tx.section.findUniqueOrThrow({
                where: { id: section.id },
                include: { translations: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        return success(mapSection(updated, lang, true));
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "section.delete");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");

        const existing = await prisma.section.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Section not found.", 404);
        }

        await prisma.section.delete({ where: { id } });
        return success({ id, deleted: true });
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
