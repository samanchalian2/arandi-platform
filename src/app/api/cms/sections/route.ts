import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../_lib/http";
import { mapSection } from "../_lib/mappers";
import { parseOrdering } from "../_lib/queries";
import { requirePermission } from "../_lib/security";
import {
    isRecord,
    parseLang,
    parseOptionalBoolean,
    parseOptionalNumber,
    parseString,
    parseTranslations,
    parseUuid,
    readJson,
} from "../_lib/validation";

export async function GET(request: NextRequest) {
    const forbidden = requirePermission(request, "section.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const pageId = searchParams.get("pageId") ?? undefined;
        const type = searchParams.get("type") ?? undefined;
        const ordering = parseOrdering(searchParams.get("ordering"), "asc");
        const lang = parseLang(searchParams.get("lang"));
        const includeTranslations = searchParams.get("translations") !== "false";

        const where: Prisma.SectionWhereInput = {
            pageId: pageId ?? undefined,
            sectionType: type ?? undefined,
        };

        const sections = await prisma.section.findMany({
            where,
            include: {
                translations: true,
            },
            orderBy: {
                order: ordering,
            },
        });

        return success(sections.map((section) => mapSection(section, lang, includeTranslations)));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function POST(request: NextRequest) {
    const forbidden = requirePermission(request, "section.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const body = await readJson(request);
        const pageId = parseUuid(parseString(body.pageId, "pageId"), "pageId");
        const key = parseString(body.key, "key");
        const type = parseString(body.type, "type");
        const order = parseOptionalNumber(body.order) ?? 0;
        const visibility = isRecord(body.visibility) ? body.visibility : {};
        const enabled = parseOptionalBoolean(visibility.enabled) ?? true;
        const style = isRecord(body.style) ? body.style : {};
        const payload = isRecord(body.payload) ? body.payload : {};
        const translations = parseTranslations(body.translations);

        const existingPage = await prisma.page.findUnique({ where: { id: pageId } });
        if (!existingPage) {
            return failure("BAD_REQUEST", "Referenced page does not exist.", 400);
        }

        const created = await prisma.$transaction(async (tx) => {
            const section = await tx.section.create({
                data: {
                    pageId,
                    key,
                    sectionType: type,
                    order,
                    enabled,
                    style: style as Prisma.InputJsonValue,
                    payload: payload as Prisma.InputJsonValue,
                },
            });

            for (const [languageCode, translation] of Object.entries(translations)) {
                await tx.sectionTranslation.create({
                    data: {
                        sectionId: section.id,
                        languageCode,
                        title: translation?.title,
                        subtitle: translation?.subtitle,
                        description: translation?.description,
                        data: (translation?.data ?? {}) as Prisma.InputJsonValue,
                    },
                });
            }

            return tx.section.findUniqueOrThrow({
                where: { id: section.id },
                include: { translations: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        return success(mapSection(created, lang, true), 201);
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
