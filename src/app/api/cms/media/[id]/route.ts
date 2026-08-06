import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { stageStoredMediaDeletion } from "@/lib/media/storage";

import { asError, failure, success } from "../../_lib/http";
import { parseMediaUpdateInput } from "../../_lib/media-input";
import { requirePermission } from "../../_lib/security";
import { parseUuid, readJson } from "../../_lib/validation";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
    const forbidden = await requirePermission(request, "media.write");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");
        const body = await readJson(request);

        const input = parseMediaUpdateInput(body);

        const updated = await prisma.$transaction(async (tx) => {
            const existing = await tx.media.findUnique({
                where: { id },
                select: { id: true, updatedAt: true },
            });
            if (!existing) throw new MediaNotFoundError();
            if (input.expectedUpdatedAt && existing.updatedAt.getTime() !== input.expectedUpdatedAt.getTime()) {
                throw new StaleMediaUpdateError();
            }

            const result = await tx.media.updateMany({
                where: {
                    id,
                    updatedAt: input.expectedUpdatedAt ?? undefined,
                },
                data: {
                    title: input.title,
                    alt: input.alt,
                    caption: input.caption,
                    url: input.url,
                    type: input.type,
                    width: input.width,
                    height: input.height,
                    metadata: input.metadata as Prisma.InputJsonValue | undefined,
                    updatedAt: new Date(),
                },
            });
            if (result.count !== 1) throw new StaleMediaUpdateError();
            return tx.media.findUniqueOrThrow({ where: { id } });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
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
            uploadReady: {
                supported: true,
                strategy: "filesystem",
            },
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    } catch (error) {
        if (error instanceof MediaNotFoundError) {
            return failure("NOT_FOUND", "Media not found.", 404);
        }
        if (error instanceof StaleMediaUpdateError) {
            return failure("CONFLICT", "The Media item changed since it was loaded. Reload and try again.", 409);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") return failure("CONFLICT", "Media url already exists.", 409);
            if (error.code === "P2034") return failure("CONFLICT", "The Media item changed during update.", 409);
        }
        const err = asError(error);
        if (err.message.includes("must") || err.message.includes("Expected")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const forbidden = await requirePermission(request, "media.delete");
    if (forbidden) {
        return forbidden;
    }

    try {
        const { id: rawId } = await params;
        const id = parseUuid(rawId, "id");

        const existing = await prisma.media.findUnique({
            where: { id },
            include: { _count: { select: { cards: true } } },
        });
        if (!existing) {
            return failure("NOT_FOUND", "Media not found.", 404);
        }

        if (existing._count.cards > 0) {
            return failure("CONFLICT", "Media is attached to one or more Cards and cannot be deleted.", 409);
        }

        const stagedFile = await stageStoredMediaDeletion(existing.url);
        try {
            await prisma.media.delete({ where: { id } });
            await stagedFile?.commit();
            return success({ id, deleted: true });
        } catch (error) {
            await stagedFile?.rollback();
            throw error;
        }
    } catch (error) {
        const err = asError(error);
        if (err.message.includes("must")) {
            return failure("BAD_REQUEST", err.message, 400);
        }

        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

class MediaNotFoundError extends Error {}
class StaleMediaUpdateError extends Error {}
