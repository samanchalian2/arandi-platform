import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requestBodyTooLarge } from "@/app/api/auth/_lib/request";

import { asError, failure, success } from "../_lib/http";
import { mapTheme } from "../_lib/mappers";
import { requirePermission } from "../_lib/security";
import {
    parseComponentOverrides,
    parseThemeName,
    parseThemeSlug,
    parseThemeTokenRecord,
} from "../_lib/theme-input";
import { parseOptionalBoolean, parseOptionalString, readJson } from "../_lib/validation";

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "theme.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const slug = request.nextUrl.searchParams.get("slug") ?? undefined;

        const theme = slug
            ? await prisma.theme.findUnique({ where: { slug } })
            : await prisma.theme.findFirst({ where: { isDefault: true } });

        if (!theme) {
            return failure("NOT_FOUND", "Theme not found.", 404);
        }

        return success(mapTheme(theme));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function PUT(request: NextRequest) {
    if (requestBodyTooLarge(request, 32_768)) {
        return failure("BAD_REQUEST", "Request is too large.", 413);
    }
    const forbidden = await requirePermission(request, "theme.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const body = await readJson(request);
        const id = parseOptionalString(body.id);
        const slug = parseThemeSlug(parseOptionalString(body.slug) ?? "default");
        const name = parseThemeName(parseOptionalString(body.name) ?? "Default Enterprise Theme");
        const isDefault = parseOptionalBoolean(body.isDefault) ?? true;

        const colors = parseThemeTokenRecord(body.colors ?? {}, "colors");
        const typography = parseThemeTokenRecord(body.typography ?? {}, "typography");
        const spacing = parseThemeTokenRecord(body.spacing ?? {}, "spacing");
        const radius = parseThemeTokenRecord(body.radius ?? {}, "radius");
        const shadows = parseThemeTokenRecord(body.shadows ?? {}, "shadows");
        const semanticTokens = parseThemeTokenRecord(body.semanticTokens ?? {}, "semanticTokens");
        const componentOverrides = parseComponentOverrides(body.componentOverrides ?? {});

        const theme = await prisma.$transaction(async (tx) => {
            if (isDefault) {
                await tx.theme.updateMany({
                    data: {
                        isDefault: false,
                    },
                });
            }

            const existing = id
                ? await tx.theme.findUnique({ where: { id } })
                : await tx.theme.findUnique({ where: { slug } });

            if (existing) {
                return tx.theme.update({
                    where: { id: existing.id },
                    data: {
                        slug,
                        name,
                        isDefault,
                        tokens: {
                            colors,
                            typography,
                            spacing,
                            radius,
                            shadows,
                        } as Prisma.InputJsonValue,
                        semanticTokens: semanticTokens as Prisma.InputJsonValue,
                        componentOverrides: componentOverrides as Prisma.InputJsonValue,
                    },
                });
            }

            return tx.theme.create({
                data: {
                    slug,
                    name,
                    isDefault,
                    tokens: {
                        colors,
                        typography,
                        spacing,
                        radius,
                        shadows,
                    } as Prisma.InputJsonValue,
                    semanticTokens: semanticTokens as Prisma.InputJsonValue,
                    componentOverrides: componentOverrides as Prisma.InputJsonValue,
                },
            });
        });

        return success(mapTheme(theme));
    } catch (error) {
        const err = asError(error);
        if (
            err.message.includes("Expected")
            || err.message.includes("must")
            || err.message.includes("invalid")
            || err.message.includes("unsafe")
            || err.message.includes("too many")
        ) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
