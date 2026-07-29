import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../_lib/http";
import { mapTheme } from "../_lib/mappers";
import { requirePermission } from "../_lib/security";
import { isRecord, parseOptionalBoolean, parseOptionalString, readJson } from "../_lib/validation";

export async function GET(request: NextRequest) {
    const forbidden = requirePermission(request, "theme.read");
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
    const forbidden = requirePermission(request, "theme.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const body = await readJson(request);
        const id = parseOptionalString(body.id);
        const slug = parseOptionalString(body.slug) ?? "default";
        const name = parseOptionalString(body.name) ?? "Default Enterprise Theme";
        const isDefault = parseOptionalBoolean(body.isDefault) ?? true;

        const colors = isRecord(body.colors) ? body.colors : {};
        const typography = isRecord(body.typography) ? body.typography : {};
        const spacing = isRecord(body.spacing) ? body.spacing : {};
        const radius = isRecord(body.radius) ? body.radius : {};
        const shadows = isRecord(body.shadows) ? body.shadows : {};
        const semanticTokens = isRecord(body.semanticTokens) ? body.semanticTokens : {};
        const componentOverrides = isRecord(body.componentOverrides) ? body.componentOverrides : {};

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
        if (err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
