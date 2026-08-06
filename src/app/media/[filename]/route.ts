import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Params = {
    params: Promise<{
        filename: string;
    }>;
};

export async function GET(_request: Request, { params }: Params) {
    const { filename } = await params;
    if (!filename || filename !== path.basename(filename)) {
        return new NextResponse("Not found", { status: 404 });
    }

    const extension = path.extname(filename).toLowerCase();
    const mimeType = extension === ".jpg"
        ? "image/jpeg"
        : extension === ".png"
            ? "image/png"
            : extension === ".webp"
                ? "image/webp"
                : null;
    if (!mimeType) {
        return new NextResponse("Not found", { status: 404 });
    }

    let body: Buffer;
    try {
        body = await readFile(path.join(process.cwd(), "storage", "media", filename));
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            return new NextResponse("Not found", { status: 404 });
        }
        throw error;
    }

    return new NextResponse(new Uint8Array(body), {
        headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Type": mimeType,
            "X-Content-Type-Options": "nosniff",
        },
    });
}
