import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_HOME_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { asError, failure, success } from "../../_lib/http";
import { mapPage } from "../../_lib/mappers";
import { parsePageRoute, parsePageSlug } from "../../_lib/page-create-input";
import { requirePermission } from "../../_lib/security";
import {
    parseOptionalBoolean,
    parseOptionalNumber,
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
    const forbidden = await requirePermission(request, "page.read");
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

        const settings = await prisma.setting.findMany({
            where: {
                key: {
                    startsWith: `page.${page.id}.`,
                },
            },
        });

        const settingsMap = new Map(settings.map((item) => [item.key, item.value]));
        const mapped = mapPage(page, lang, includeTranslations);

        return success({
            ...mapped,
            settings: {
                themeSlug: (settingsMap.get(`page.${page.id}.themeSlug`) as string | undefined) ?? "default",
                navigationVisible: (settingsMap.get(`page.${page.id}.navigationVisible`) as boolean | undefined) ?? true,
                pageOrder: (settingsMap.get(`page.${page.id}.pageOrder`) as number | undefined) ?? 0,
            },
        });
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

function assertRequiredString(value: string | undefined, fieldName: string) {
    if (!value || value.trim().length === 0) {
        throw new Error(`${fieldName} must be a non-empty string.`);
    }
}

function assertMaxLength(value: string | undefined, fieldName: string, max: number) {
    if (value && value.length > max) {
        throw new Error(`${fieldName} must be at most ${max} characters.`);
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    const forbidden = await requirePermission(request, "page.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { identifier } = await params;
        const id = parseUuid(identifier, "id");
        const body = await readJson(request);

        const rawSlug = parseOptionalString(body.slug);
        const rawRoute = parseOptionalString(body.route);
        const slug = rawSlug === undefined ? undefined : parsePageSlug(rawSlug);
        const route = rawRoute === undefined ? undefined : parsePageRoute(rawRoute);
        const pageType = parseOptionalString(body.pageType);
        const status = parseOptionalString(body.status);
        const seoKeywords = parseOptionalStringArray(body.seoKeywords);
        const translations = body.translations ? parseTranslations(body.translations) : undefined;
        const settings = body.settings;

        const navigationVisible = settings && typeof settings === "object"
            ? parseOptionalBoolean((settings as Record<string, unknown>).navigationVisible)
            : undefined;
        const pageOrder = settings && typeof settings === "object"
            ? parseOptionalNumber((settings as Record<string, unknown>).pageOrder)
            : undefined;
        const themeSlug = settings && typeof settings === "object"
            ? parseOptionalString((settings as Record<string, unknown>).themeSlug)
            : undefined;

        if (status !== undefined && status !== "published" && status !== "draft") {
            throw new Error("status must be either published or draft.");
        }

        if (seoKeywords !== undefined) {
            if (seoKeywords.some((item) => item.length > 50)) {
                throw new Error("Each SEO keyword must be at most 50 characters.");
            }
            if (seoKeywords.length > 25) {
                throw new Error("SEO keywords must be at most 25 items.");
            }
        }

        if (pageOrder !== undefined && (!Number.isInteger(pageOrder) || pageOrder < 0)) {
            throw new Error("pageOrder must be a non-negative integer.");
        }

        assertMaxLength(themeSlug, "themeSlug", 80);

        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Page not found.", 404);
        }

        if (slug && slug !== existing.slug) {
            const duplicate = await prisma.page.findUnique({ where: { slug } });
            if (duplicate && duplicate.id !== existing.id) {
                return failure("CONFLICT", "Page slug already exists.", 409);
            }
        }
        if (route && route !== existing.route) {
            const duplicate = await prisma.page.findUnique({ where: { route } });
            if (duplicate && duplicate.id !== existing.id) {
                return failure("CONFLICT", "Page route already exists.", 409);
            }
        }

        if (translations) {
            for (const [languageCode, translation] of Object.entries(translations)) {
                assertRequiredString(translation?.title, `translations.${languageCode}.title`);
                assertRequiredString(translation?.seoTitle, `translations.${languageCode}.seoTitle`);
                assertRequiredString(translation?.seoDescription, `translations.${languageCode}.seoDescription`);
                assertMaxLength(translation?.title, `translations.${languageCode}.title`, 120);
                assertMaxLength(translation?.seoTitle, `translations.${languageCode}.seoTitle`, 160);
                assertMaxLength(translation?.seoDescription, `translations.${languageCode}.seoDescription`, 320);
            }
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

            if (themeSlug !== undefined) {
                await tx.setting.upsert({
                    where: { key: `page.${page.id}.themeSlug` },
                    update: {
                        value: themeSlug,
                        group: "page",
                        isPublic: false,
                    },
                    create: {
                        key: `page.${page.id}.themeSlug`,
                        value: themeSlug,
                        group: "page",
                        isPublic: false,
                    },
                });
            }

            if (navigationVisible !== undefined) {
                await tx.setting.upsert({
                    where: { key: `page.${page.id}.navigationVisible` },
                    update: {
                        value: navigationVisible,
                        group: "page",
                        isPublic: false,
                    },
                    create: {
                        key: `page.${page.id}.navigationVisible`,
                        value: navigationVisible,
                        group: "page",
                        isPublic: false,
                    },
                });
            }

            if (pageOrder !== undefined) {
                await tx.setting.upsert({
                    where: { key: `page.${page.id}.pageOrder` },
                    update: {
                        value: pageOrder,
                        group: "page",
                        isPublic: false,
                    },
                    create: {
                        key: `page.${page.id}.pageOrder`,
                        value: pageOrder,
                        group: "page",
                        isPublic: false,
                    },
                });
            }

            return tx.page.findUniqueOrThrow({
                where: { id: page.id },
                include: { translations: true },
            });
        });

        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        revalidatePublicContent(PUBLIC_HOME_TAG);
        return success(mapPage(updated, lang, true));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return failure("CONFLICT", "Page slug or route already exists.", 409);
        }
        const err = asError(error);
        if (
            err.message.includes("must")
            || err.message.includes("Expected")
            || err.message.includes("required")
            || err.message.includes("canonical")
            || err.message.includes("safe lowercase")
        ) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const forbidden = await requirePermission(request, "page.delete");
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
        revalidatePublicContent(PUBLIC_HOME_TAG);
        return success({ id, deleted: true });
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
