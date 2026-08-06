import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import { prisma } from "@/lib/prisma";
import { getPageTemplate } from "@/lib/admin/pages/templates";
import { PUBLIC_HOME_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { asError, failure, success } from "../_lib/http";
import { mapPage } from "../_lib/mappers";
import { parsePageCreateInput } from "../_lib/page-create-input";
import { parseOrdering } from "../_lib/queries";
import { requirePermission } from "../_lib/security";
import { parseLang, readJson } from "../_lib/validation";

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "page.read");
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
    if (requestBodyTooLarge(request, 32_768)) {
        return failure("BAD_REQUEST", "Request is too large.", 413);
    }
    const forbidden = await requirePermission(request, "page.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const input = parsePageCreateInput(await readJson(request));
        const template = getPageTemplate(input.template);

        const created = await prisma.$transaction(async (tx) => {
            const page = await tx.page.create({
                data: {
                    slug: input.slug,
                    route: input.route,
                    pageType: input.template,
                    publishState: "draft",
                    seoKeywords: input.seoKeywords,
                    translations: {
                        create: (["en", "fa"] as const).map((languageCode) => ({
                            languageCode,
                            ...input.translations[languageCode],
                        })),
                    },
                },
            });

            for (const [index, sectionTemplate] of template.sections.entries()) {
                const section = await tx.section.create({
                    data: {
                        pageId: page.id,
                        key: sectionTemplate.key,
                        sectionType: sectionTemplate.sectionType,
                        order: index + 1,
                        enabled: true,
                        style: {},
                        payload: {
                            template: input.template,
                            starter: true,
                            version: 1,
                        },
                    },
                });
                await tx.sectionTranslation.createMany({
                    data: (["en", "fa"] as const).map((languageCode) => ({
                        sectionId: section.id,
                        languageCode,
                        title: sectionTemplate.key === "hero"
                            ? input.translations[languageCode].title
                            : sectionTemplate.labels[languageCode],
                        subtitle: null,
                        description: sectionTemplate.key === "hero"
                            ? input.translations[languageCode].seoDescription
                            : null,
                        data: {},
                    })),
                });
            }

            return tx.page.findUniqueOrThrow({
                where: { id: page.id },
                include: { translations: true },
            });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        revalidatePublicContent(PUBLIC_HOME_TAG);
        return success(mapPage(created, lang, true), 201);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return failure("CONFLICT", "Page slug or route already exists.", 409);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
            return failure("CONFLICT", "Page creation conflicted with another request.", 409);
        }
        const err = asError(error);
        if (
            err.message.includes("must")
            || err.message.includes("required")
            || err.message.includes("invalid")
        ) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
