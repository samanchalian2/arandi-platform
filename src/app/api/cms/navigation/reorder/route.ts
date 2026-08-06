import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_NAVIGATION_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { asError, failure, success } from "../../_lib/http";
import { mapNavigation } from "../../_lib/mappers";
import { parseReorderItems } from "../../_lib/reorder";
import { hasAnyRole, readPrincipal, requirePermission } from "../../_lib/security";
import { parseLang, readJson } from "../../_lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
    const forbidden = await requirePermission(request, "navigation.write");
    if (forbidden) return forbidden;
    const principal = await readPrincipal(request);
    if (!hasAnyRole(principal, ["super_admin", "cms_admin", "editor"])) {
        return failure("FORBIDDEN", "Insufficient permission to reorder navigation.", 403);
    }
    try {
        const body = await readJson(request);
        const items = parseReorderItems(body.items);
        const current = await prisma.navigation.findMany({ select: { id: true } });
        if (current.length !== items.length) {
            return failure("BAD_REQUEST", "A complete Navigation collection is required for reorder.", 400);
        }
        const submittedIds = new Set(items.map(({ id }) => id));
        if (current.some(({ id }) => !submittedIds.has(id))) {
            return failure("BAD_REQUEST", "A complete Navigation collection is required for reorder.", 400);
        }
        const lang = parseLang(request.nextUrl.searchParams.get("lang"));
        const updated = await prisma.$transaction(async (tx) => {
            await Promise.all(items.map((item) =>
                tx.navigation.update({ where: { id: item.id }, data: { order: item.order } }),
            ));
            return tx.navigation.findMany({
                include: { translations: true },
                orderBy: [{ order: "asc" }, { id: "asc" }],
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        revalidatePublicContent(PUBLIC_NAVIGATION_TAG);
        return success(updated.map((item) => mapNavigation(item, lang, true)));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
            return failure("CONFLICT", "Navigation order changed. Reload and try again.", 409);
        }
        const err = asError(error);
        if (err.message !== "Unable to complete the CMS request.") {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
