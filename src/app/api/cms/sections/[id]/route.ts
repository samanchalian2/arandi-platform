import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../../_lib/http";
import { mapSection } from "../../_lib/mappers";
import { hasAnyRole, readPrincipal, requirePermission } from "../../_lib/security";
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

const ALLOWED_SECTION_TYPES = ["hero", "features", "text", "cards", "gallery", "cta", "contact", "custom"];

function assertMaxLength(value: string | undefined, fieldName: string, max: number) {
    if (value && value.length > max) {
        throw new Error(`${fieldName} must be at most ${max} characters.`);
    }
}

function assertSectionType(type: string | undefined) {
    if (!type) {
        return;
    }

    if (!ALLOWED_SECTION_TYPES.includes(type.toLowerCase())) {
        throw new Error("type must be one of hero, features, text, cards, gallery, cta, contact, custom.");
    }
}

function isTranslatorOnlyRole(request: NextRequest): boolean {
    const principal = readPrincipal(request);
    return hasAnyRole(principal, ["translator"]) && !hasAnyRole(principal, ["super_admin", "cms_admin", "editor"]);
}

export async function GET(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "section.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const includeTranslations = request.nextUrl.searchParams.get("translations") !== "false";

        const section = await prisma.section.findUnique({
            where: { id },
            include: { translations: true },
        });

        if (!section) {
            return failure("NOT_FOUND", "Section not found.", 404);
        }

        return success(mapSection(section, lang, includeTranslations));
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

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
        const pageId = parseOptionalString(body.pageId);
        const visibility = isRecord(body.visibility) ? body.visibility : undefined;
        const enabled = visibility ? parseOptionalBoolean(visibility.enabled) : undefined;
        const settings = isRecord(body.settings) ? body.settings : undefined;
        const style = isRecord(settings?.style) ? settings.style : isRecord(body.style) ? body.style : undefined;
        const payload = isRecord(settings?.payload) ? settings.payload : isRecord(body.payload) ? body.payload : undefined;
        const translations = body.translations ? parseTranslations(body.translations) : undefined;

        if (order !== undefined && (!Number.isInteger(order) || order < 0)) {
            throw new Error("order must be a non-negative integer.");
        }
        assertSectionType(type);
        assertMaxLength(key, "key", 120);

        if (translations) {
            for (const [languageCode, translation] of Object.entries(translations)) {
                if (!translation?.title || translation.title.trim().length === 0) {
                    throw new Error(`translations.${languageCode}.title must be a non-empty string.`);
                }

                assertMaxLength(translation.title, `translations.${languageCode}.title`, 120);
                assertMaxLength(translation.subtitle, `translations.${languageCode}.subtitle`, 160);
                assertMaxLength(translation.description, `translations.${languageCode}.description`, 4000);
            }
        }

        const translatorOnly = isTranslatorOnlyRole(request);
        if (translatorOnly && (key !== undefined || type !== undefined || order !== undefined || enabled !== undefined || style !== undefined || payload !== undefined || pageId !== undefined)) {
            return failure("FORBIDDEN", "Translator role can only update translation fields.", 403);
        }

        const existing = await prisma.section.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Section not found.", 404);
        }

        if (pageId && pageId !== existing.pageId) {
            return failure("BAD_REQUEST", "Section ownership mismatch for pageId.", 400);
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
