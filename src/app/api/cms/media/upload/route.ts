import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { removeStoredMediaFile, storeImageUpload } from "@/lib/media/storage";

import { asError, failure, success } from "../../_lib/http";
import { parseMediaCreateInput } from "../../_lib/media-input";
import { requirePermission } from "../../_lib/security";

export const runtime = "nodejs";

function formText(formData: FormData, key: string): string | undefined {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest) {
    const forbidden = await requirePermission(request, "media.write");
    if (forbidden) {
        return forbidden;
    }

    let storedUrl: string | null = null;

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return failure("BAD_REQUEST", "An image file is required.", 400);
        }

        const stored = await storeImageUpload(file);
        storedUrl = stored.url;

        const input = parseMediaCreateInput({
            title: formText(formData, "title"),
            alt: formText(formData, "alt") ?? null,
            caption: formText(formData, "caption") ?? null,
            url: stored.url,
            type: stored.mimeType,
            width: stored.width,
            height: stored.height,
            metadata: {
                storage: "filesystem",
                originalName: stored.originalName,
                size: stored.size,
                scanMode: process.env.MEDIA_MALWARE_SCAN_MODE || "off",
            },
        });

        const created = await prisma.media.create({
            data: {
                ...input,
                metadata: input.metadata as Prisma.InputJsonValue,
            },
        });

        storedUrl = null;
        return success({
            ...created,
            uploadReady: {
                supported: true,
                strategy: "filesystem",
            },
        }, 201);
    } catch (error) {
        if (storedUrl) {
            await removeStoredMediaFile(storedUrl);
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return failure("CONFLICT", "Media url already exists.", 409);
        }

        const err = asError(error);
        if (
            err.message.includes("must")
            || err.message.includes("required")
            || err.message.includes("supported")
            || err.message.includes("dimensions")
            || err.message.includes("scanning")
        ) {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
