import type { NextRequest } from "next/server";

import { requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import { prisma } from "@/lib/prisma";
import { THEME_PREVIEW_COOKIE } from "@/lib/public-content/theme";

import { asError, failure, success } from "../../_lib/http";
import { requirePermission } from "../../_lib/security";
import { parseThemeSlug } from "../../_lib/theme-input";
import { parseOptionalString, readJson } from "../../_lib/validation";

const previewCookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
};

export async function POST(request: NextRequest) {
    if (requestBodyTooLarge(request, 4096)) return failure("BAD_REQUEST", "Request is too large.", 413);
    const forbidden = await requirePermission(request, "theme.write");
    if (forbidden) return forbidden;

    try {
        const body = await readJson(request);
        const rawSlug = parseOptionalString(body.slug);
        const response = success({ previewing: rawSlug ?? null });
        if (!rawSlug) {
            response.cookies.set(THEME_PREVIEW_COOKIE, "", { ...previewCookie, maxAge: 0 });
            return response;
        }
        const slug = parseThemeSlug(rawSlug);
        const theme = await prisma.theme.findUnique({ where: { slug }, select: { slug: true } });
        if (!theme) return failure("NOT_FOUND", "Theme not found.", 404);
        response.cookies.set(THEME_PREVIEW_COOKIE, theme.slug, previewCookie);
        return response;
    } catch (error) {
        const err = asError(error);
        return failure(err.message.includes("invalid") ? "BAD_REQUEST" : "INTERNAL_ERROR", err.message, err.message.includes("invalid") ? 400 : 500, err.details);
    }
}
