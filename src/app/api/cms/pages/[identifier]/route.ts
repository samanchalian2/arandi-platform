import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../../_lib/http";
import { mapPage } from "../../_lib/mappers";
import { requirePermission } from "../../_lib/security";
import {
    parseLang,
    parseOptionalString,
    parseOptionalStringArray,
    parseTranslations,
    parseUuid,
    readJson,
} from "../../_lib/validation";

type Params = {
    params: Promise<{
        identifier: string;
    }>;
};

export async function GET(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "page.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { identifier } = await params;
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const includeTranslations = request.nextUrl.searchParams.get("translations") !== "false";

        const page = await prisma.page.findUnique({
            where: { slug: identifier },
            include: { translations: true },
        });

        if (!page) {
            return failure("NOT_FOUND", "Page not found.", 404);
        }

        return success(mapPage(page, lang, includeTranslations));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "page.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { identifier } = await params;
        const id = parseUuid(identifier, "id");
        const body = await readJson(request);

        const slug = parseOptionalString(body.slug);
        const route = parseOptionalString(body.route);
        const pageType = parseOptionalString(body.pageType);
        const status = parseOptionalString(body.status);
        const seoKeywords = parseOptionalStringArray(body.seoKeywords);
        const translations = body.translations ? parseTranslations(body.translations) : undefined;

        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Page not found.", 404);
        }

        const updated = await prisma.$transaction(async (tx) => {
            const page = await tx.page.update({
                where: { id },
                data: {
                    slug: slug ?? undefined,
                    route: route ?? undefined,
                    pageType: pageType ?? undefined,
                    publishState: status ?? undefined,
                    seoKeywords: seoKeywords ?? undefined,
                },
            });

            if (translations) {
                for (const [languageCode, translation] of Object.entries(translations)) {
                    if (!translation?.title || !translation?.seoTitle || !translation?.seoDescription) {
                        continue;
                    }

                    await tx.pageTranslation.upsert({
                        where: {
                            pageId_languageCode: {
                                pageId: page.id,
                                languageCode,
                            },
                        },
                        update: {
                            title: translation.title,
                            seoTitle: translation.seoTitle,
                            seoDescription: translation.seoDescription,
                        },
                        create: {
                            pageId: page.id,
                            languageCode,
                            title: translation.title,
                            seoTitle: translation.seoTitle,
                            seoDescription: translation.seoDescription,
                        },
                    });
                }
            }

            return tx.page.findUniqueOrThrow({
                where: { id: page.id },
                include: { translations: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        return success(mapPage(updated, lang, true));
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "page.delete");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { identifier } = await params;
        const id = parseUuid(identifier, "id");

        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Page not found.", 404);
        }

        await prisma.page.delete({ where: { id } });
        return success({ id, deleted: true });
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
