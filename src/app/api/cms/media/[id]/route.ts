import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { asError, failure, success } from "../../_lib/http";
import { requirePermission } from "../../_lib/security";
import {
    isRecord,
    parseOptionalNumber,
    parseOptionalString,
    parseUuid,
    readJson,
} from "../../_lib/validation";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "media.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");
        const body = await readJson(request);

        const title = parseOptionalString(body.title);
        const alt = parseOptionalString(body.alt);
        const caption = parseOptionalString(body.caption);
        const url = parseOptionalString(body.url);
        const type = parseOptionalString(body.type);
        const width = parseOptionalNumber(body.width);
        const height = parseOptionalNumber(body.height);
        const metadata = isRecord(body.metadata) ? body.metadata : undefined;

        const existing = await prisma.media.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Media not found.", 404);
        }

        const updated = await prisma.media.update({
            where: { id },
            data: {
                title: title ?? undefined,
                alt: alt ?? undefined,
                caption: caption ?? undefined,
                url: url ?? undefined,
                type: type ?? undefined,
                width: width ?? undefined,
                height: height ?? undefined,
                metadata: (metadata as Prisma.InputJsonValue | undefined) ?? undefined,
            },
        });

        return success({
            id: updated.id,
            title: updated.title,
            alt: updated.alt,
            caption: updated.caption,
            url: updated.url,
            type: updated.type,
            width: updated.width,
            height: updated.height,
            metadata: updated.metadata,
            updatedAt: updated.updatedAt,
        });
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const forbidden = requirePermission(request, "media.delete");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");

        const existing = await prisma.media.findUnique({ where: { id } });
        if (!existing) {
            return failure("NOT_FOUND", "Media not found.", 404);
        }

        await prisma.media.delete({ where: { id } });
        return success({ id, deleted: true });
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
