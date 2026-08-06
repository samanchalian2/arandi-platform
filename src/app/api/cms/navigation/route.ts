import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_NAVIGATION_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { asError, failure, success } from "../_lib/http";
import {
    parseNavigationHref,
    parseNavigationKey,
    parseNavigationTranslations,
} from "../_lib/navigation-input";
import { mapNavigation } from "../_lib/mappers";
import { hasAnyRole, readPrincipal, requirePermission } from "../_lib/security";
import { parseLang, parseOptionalBoolean, readJson } from "../_lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "navigation.read");
    if (forbidden) return forbidden;
    try {
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const items = await prisma.navigation.findMany({
            include: { translations: true },
            orderBy: [{ order: "asc" }, { id: "asc" }],
        });
        return success(items.map((item) => mapNavigation(item, lang, true)));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function POST(request: NextRequest) {
    const forbidden = await requirePermission(request, "navigation.write");
    if (forbidden) return forbidden;
    const principal = await readPrincipal(request);
    if (!hasAnyRole(principal, ["super_admin", "cms_admin", "editor"])) {
        return failure("FORBIDDEN", "Insufficient permission to create navigation items.", 403);
    }
    try {
        const body = await readJson(request);
        const key = parseNavigationKey(body.key);
        const isExternal = parseOptionalBoolean(body.isExternal) ?? false;
        const openInNewTab = parseOptionalBoolean(body.openInNewTab) ?? false;
        const href = parseNavigationHref(body.href, isExternal);
        const translations = parseNavigationTranslations(body.translations, true);
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));

        const item = await prisma.$transaction(async (tx) => {
            const aggregate = await tx.navigation.aggregate({ _max: { order: true } });
            return tx.navigation.create({
                data: {
                    key,
                    href,
                    isExternal,
                    openInNewTab,
                    order: (aggregate._max.order ?? 0) + 1,
                    translations: {
                        create: (["en", "fa"] as const).map((languageCode) => ({
                            languageCode,
                            label: translations[languageCode]!,
                        })),
                    },
                },
                include: { translations: true },
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        revalidatePublicContent(PUBLIC_NAVIGATION_TAG);
        return success(mapNavigation(item, lang, true), 201);
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
