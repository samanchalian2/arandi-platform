import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../_lib/http";
import { parseOrdering } from "../_lib/queries";
import { requirePermission } from "../_lib/security";
import {
    isRecord,
    parseOptionalNumber,
    parseOptionalString,
    parseString,
    readJson,
} from "../_lib/validation";

function mapMediaItem(media: {
    id: string;
    title: string;
    alt: string | null;
    caption: string | null;
    url: string;
    type: string;
    width: number | null;
    height: number | null;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: media.id,
        title: media.title,
        alt: media.alt,
        caption: media.caption,
        url: media.url,
        type: media.type,
        width: media.width,
        height: media.height,
        metadata: media.metadata,
        uploadReady: {
            supported: false,
            strategy: "placeholder",
        },
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
    };
}

export async function GET(request: NextRequest) {
    const forbidden = requirePermission(request, "media.read");
    if (forbidden) {
        return forbidden;
    }

    try {
        const type = request.nextUrl.searchParams.get("type") ?? undefined;
        const ordering = parseOrdering(request.nextUrl.searchParams.get("ordering"), "desc");

        const media = await prisma.media.findMany({
            where: {
                type: type ?? undefined,
            },
            orderBy: {
                updatedAt: ordering,
            },
        });

        return success(media.map((item) => mapMediaItem(item)));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function POST(request: NextRequest) {
    const forbidden = requirePermission(request, "media.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const body = await readJson(request);

        const title = parseString(body.title, "title");
        const url = parseString(body.url, "url");
        const type = parseString(body.type, "type");
        const alt = parseOptionalString(body.alt) ?? null;
        const caption = parseOptionalString(body.caption) ?? null;
        const width = parseOptionalNumber(body.width) ?? null;
        const height = parseOptionalNumber(body.height) ?? null;
        const metadata = isRecord(body.metadata) ? body.metadata : {};

        const existing = await prisma.media.findUnique({ where: { url } });
        if (existing) {
            return failure("CONFLICT", "Media url already exists.", 409);
        }

        const created = await prisma.media.create({
            data: {
                title,
                alt,
                caption,
                url,
                type,
                width,
                height,
                metadata: metadata as Prisma.InputJsonValue,
            },
        });

        return success(mapMediaItem(created), 201);
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
