import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../_lib/http";
import { mapTheme } from "../_lib/mappers";
import { requirePermission } from "../_lib/security";

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "theme.read");
    if (forbidden) return forbidden;

    try {
        const themes = await prisma.theme.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
        return success(themes.map(mapTheme));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
