import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_NAVIGATION_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { asError, failure, success } from "../../_lib/http";
import {
    parseNavigationHref,
    parseNavigationId,
    parseNavigationKey,
    parseNavigationTranslations,
} from "../../_lib/navigation-input";
import { mapNavigation } from "../../_lib/mappers";
import { hasAnyRole, readPrincipal, requireAnyPermission, requirePermission } from "../../_lib/security";
import { isRecord, parseLang, readJson } from "../../_lib/validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
    const accessError = await requireAnyPermission(request, ["navigation.write", "navigation.translate"]);
    if (accessError) return accessError;
    const principal = await readPrincipal(request);
    if (!principal) return failure("UNAUTHORIZED", "Authentication required.", 401);
    try {
        const id = parseNavigationId((await context.params).id);
        const body = await readJson(request);
        const structural = ["key", "href", "isExternal", "openInNewTab"].some((key) => key in body);
        const translating = "translations" in body;
        if (!structural && !translating) {
            return failure("BAD_REQUEST", "No navigation changes were supplied.", 400);
        }
        if (
            structural
            && (
                !principal.permissions.includes("navigation.write")
                || !hasAnyRole(principal, ["super_admin", "cms_admin", "editor"])
            )
        ) {
            return failure("FORBIDDEN", "Insufficient permission to change navigation structure.", 403);
        }
        if (
            translating
            && !principal.permissions.includes("navigation.translate")
            && !principal.permissions.includes("navigation.write")
        ) {
            return failure("FORBIDDEN", "Insufficient permission to translate navigation.", 403);
        }
        if ("translations" in body && !isRecord(body.translations)) {
            return failure("BAD_REQUEST", "translations must be an object.", 400);
        }

        const existing = await prisma.navigation.findUnique({
            where: { id },
            include: { translations: true },
        });
        if (!existing) return failure("NOT_FOUND", "Navigation item not found.", 404);

        const isExternal = structural
            ? (typeof body.isExternal === "boolean" ? body.isExternal : existing.isExternal)
            : existing.isExternal;
        const translations = translating
            ? parseNavigationTranslations(body.translations, false)
            : {};
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const updated = await prisma.$transaction(async (tx) => {
            await tx.navigation.update({
                where: { id },
                data: {
                    ...(body.key !== undefined ? { key: parseNavigationKey(body.key) } : {}),
                    ...(body.href !== undefined || body.isExternal !== undefined
                        ? { href: parseNavigationHref(body.href ?? existing.href, isExternal) }
                        : {}),
                    ...(body.isExternal !== undefined ? {
                        isExternal: typeof body.isExternal === "boolean"
                            ? body.isExternal
                            : (() => { throw new Error("isExternal must be a boolean."); })(),
                    } : {}),
                    ...(body.openInNewTab !== undefined ? {
                        openInNewTab: typeof body.openInNewTab === "boolean"
                            ? body.openInNewTab
                            : (() => { throw new Error("openInNewTab must be a boolean."); })(),
                    } : {}),
                },
            });
            for (const languageCode of ["en", "fa"] as const) {
                const label = translations[languageCode];
                if (!label) continue;
                await tx.navigationTranslation.upsert({
                    where: { navigationId_languageCode: { navigationId: id, languageCode } },
                    update: { label },
                    create: { navigationId: id, languageCode, label },
                });
            }
            return tx.navigation.findUniqueOrThrow({
                where: { id },
                include: { translations: true },
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        revalidatePublicContent(PUBLIC_NAVIGATION_TAG);
        return success(mapNavigation(updated, lang, true));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return failure("CONFLICT", "Navigation key already exists.", 409);
        }
        const err = asError(error);
        if (err.message !== "Unable to complete the CMS request.") {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const forbidden = await requirePermission(request, "navigation.delete");
    if (forbidden) return forbidden;
    try {
        const id = parseNavigationId((await context.params).id);
        const existing = await prisma.navigation.findUnique({ where: { id }, select: { id: true } });
        if (!existing) return failure("NOT_FOUND", "Navigation item not found.", 404);
        await prisma.$transaction(async (tx) => {
            await tx.navigation.delete({ where: { id } });
            const remaining = await tx.navigation.findMany({
                orderBy: [{ order: "asc" }, { id: "asc" }],
                select: { id: true },
            });
            await Promise.all(remaining.map((item, index) =>
                tx.navigation.update({ where: { id: item.id }, data: { order: index + 1 } }),
            ));
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        revalidatePublicContent(PUBLIC_NAVIGATION_TAG);
        return success({ id });
    } catch (error) {
        const err = asError(error);
        if (err.message !== "Unable to complete the CMS request.") {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
