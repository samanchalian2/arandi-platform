import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../_lib/http";
import { mapPage } from "../_lib/mappers";
import { parseOrdering } from "../_lib/queries";
import { requirePermission } from "../_lib/security";
import {
    parseLang,
    parseOptionalString,
    parseOptionalStringArray,
    parseString,
    parseTranslations,
    readJson,
} from "../_lib/validation";

export async function GET(request: NextRequest) {
    const forbidden = requirePermission(request, "page.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const slug = searchParams.get("slug") ?? undefined;
        const status = searchParams.get("status") ?? undefined;
        const ordering = parseOrdering(searchParams.get("ordering"), "desc");
        const lang = parseLang(searchParams.get("lang"));
        const includeTranslations = searchParams.get("translations") !== "false";

        const where: Prisma.PageWhereInput = {
            slug: slug ?? undefined,
            publishState: status ?? undefined,
        };

        const pages = await prisma.page.findMany({
            where,
            include: {
                translations: true,
            },
            orderBy: {
                updatedAt: ordering,
            },
        });

        return success(
            pages.map((page) => mapPage(page, lang, includeTranslations)),
        );
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function POST(request: NextRequest) {
    const forbidden = requirePermission(request, "page.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const body = await readJson(request);
        const slug = parseString(body.slug, "slug");
        const route = parseString(body.route, "route");
        const pageType = parseOptionalString(body.pageType) ?? "standard";
        const status = parseOptionalString(body.status) ?? "draft";
        const seoKeywords = parseOptionalStringArray(body.seoKeywords) ?? [];
        const translations = parseTranslations(body.translations);

        const existing = await prisma.page.findUnique({ where: { slug } });
        if (existing) {
            return failure("CONFLICT", "Page slug already exists.", 409);
        }

        const created = await prisma.$transaction(async (tx) => {
            const page = await tx.page.create({
                data: {
                    slug,
                    route,
                    pageType,
                    publishState: status,
                    seoKeywords,
                },
            });

            for (const [languageCode, translation] of Object.entries(translations)) {
                if (!translation?.title || !translation?.seoTitle || !translation?.seoDescription) {
                    continue;
                }

                await tx.pageTranslation.create({
                    data: {
                        pageId: page.id,
                        languageCode,
                        title: translation.title,
                        seoTitle: translation.seoTitle,
                        seoDescription: translation.seoDescription,
                    },
                });
            }

            return tx.page.findUniqueOrThrow({
                where: { id: page.id },
                include: { translations: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        return success(mapPage(created, lang, true), 201);
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must be")) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
