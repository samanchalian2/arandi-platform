import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import { prisma } from "@/lib/prisma";
import { revalidatePublicTheme } from "@/lib/public-content/theme";

import { asError, failure, success } from "../../_lib/http";
import { mapTheme } from "../../_lib/mappers";
import { requirePermission } from "../../_lib/security";
import { parseThemeSlug } from "../../_lib/theme-input";
import { parseOptionalString, readJson } from "../../_lib/validation";

export async function POST(request: NextRequest) {
    if (requestBodyTooLarge(request, 4096)) return failure("BAD_REQUEST", "Request is too large.", 413);
    const forbidden = await requirePermission(request, "theme.write");
    if (forbidden) return forbidden;

    try {
        const body = await readJson(request);
        const slug = parseThemeSlug(parseOptionalString(body.slug));
        const theme = await prisma.$transaction(async (tx) => {
            const target = await tx.theme.findUnique({ where: { slug } });
            if (!target) throw new Error("Theme does not exist.");
            await tx.theme.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
            return tx.theme.update({ where: { id: target.id }, data: { isDefault: true } });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        revalidatePublicTheme();
        return success(mapTheme(theme));
    } catch (error) {
        const err = asError(error);
        return failure(err.message.includes("does not exist") || err.message.includes("invalid") ? "BAD_REQUEST" : "INTERNAL_ERROR", err.message, err.message.includes("does not exist") || err.message.includes("invalid") ? 400 : 500, err.details);
    }
}
