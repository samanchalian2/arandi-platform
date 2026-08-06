import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, rename, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import sharp from "sharp";

const execFileAsync = promisify(execFile);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 12_000;
const MAX_IMAGE_PIXELS = 40_000_000;

type SupportedImage = {
    extension: "jpg" | "png" | "webp";
    mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export type StoredMediaFile = {
    url: string;
    mimeType: SupportedImage["mimeType"];
    width: number;
    height: number;
    size: number;
    originalName: string;
};

export type StagedMediaDeletion = {
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
};

function storageRoot(): string {
    const configured = process.env.MEDIA_STORAGE_ROOT?.trim();
    const defaultRoot = path.join(
        /* turbopackIgnore: true */ process.cwd(),
        "storage",
        "media",
    );
    return path.resolve(/* turbopackIgnore: true */ configured || defaultRoot);
}

function publicBaseUrl(): string {
    const configured = process.env.MEDIA_PUBLIC_BASE_URL?.trim() || "/media";
    if (!configured.startsWith("/") || configured.startsWith("//") || configured.includes("..")) {
        throw new Error("MEDIA_PUBLIC_BASE_URL must be a safe root-relative path.");
    }
    return configured.replace(/\/+$/, "");
}

function detectImage(buffer: Buffer): SupportedImage | null {
    if (
        buffer.length >= 3
        && buffer[0] === 0xff
        && buffer[1] === 0xd8
        && buffer[2] === 0xff
    ) {
        return { extension: "jpg", mimeType: "image/jpeg" };
    }

    if (
        buffer.length >= 8
        && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
        return { extension: "png", mimeType: "image/png" };
    }

    if (
        buffer.length >= 12
        && buffer.subarray(0, 4).toString("ascii") === "RIFF"
        && buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
        return { extension: "webp", mimeType: "image/webp" };
    }

    return null;
}

async function scanFile(filePath: string): Promise<void> {
    const scanMode = process.env.MEDIA_MALWARE_SCAN_MODE?.trim().toLowerCase() || "off";
    const unscannedAllowed =
        process.env.NODE_ENV !== "production"
        || process.env.MEDIA_ALLOW_UNSCANNED_UPLOADS === "true";

    if (scanMode === "off") {
        if (!unscannedAllowed) {
            throw new Error("Media malware scanning is required in production.");
        }
        return;
    }

    if (scanMode !== "clamdscan") {
        throw new Error("MEDIA_MALWARE_SCAN_MODE must be off or clamdscan.");
    }

    try {
        await execFileAsync("clamdscan", ["--fdpass", "--no-summary", filePath], {
            windowsHide: true,
            timeout: 30_000,
        });
    } catch {
        throw new Error("Media upload failed malware scanning.");
    }
}

function safeOriginalName(name: string): string {
    return path.basename(name).replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 200) || "upload";
}

export async function storeImageUpload(file: File): Promise<StoredMediaFile> {
    if (file.size <= 0) {
        throw new Error("Uploaded image must not be empty.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error("Uploaded image must be 10 MB or smaller.");
    }

    const original = Buffer.from(await file.arrayBuffer());
    const detected = detectImage(original);
    if (!detected) {
        throw new Error("Only JPEG, PNG, and WebP images are supported.");
    }

    const root = storageRoot();
    const quarantineDirectory = path.join(root, ".quarantine");
    await mkdir(quarantineDirectory, { recursive: true });
    await mkdir(root, { recursive: true });

    const id = randomUUID();
    const quarantinePath = path.join(quarantineDirectory, `${id}.upload`);
    const finalName = `${id}.${detected.extension}`;
    const finalPath = path.join(root, finalName);

    await writeFile(quarantinePath, original, { flag: "wx" });

    try {
        await scanFile(quarantinePath);

        const pipeline = sharp(original, {
            failOn: "warning",
            limitInputPixels: MAX_IMAGE_PIXELS,
        }).rotate();
        const metadata = await pipeline.metadata();
        const width = metadata.width ?? 0;
        const height = metadata.height ?? 0;

        if (
            width <= 0
            || height <= 0
            || width > MAX_IMAGE_DIMENSION
            || height > MAX_IMAGE_DIMENSION
            || width * height > MAX_IMAGE_PIXELS
        ) {
            throw new Error("Uploaded image dimensions are not allowed.");
        }

        let processed: Buffer;
        if (detected.mimeType === "image/jpeg") {
            processed = await pipeline.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
        } else if (detected.mimeType === "image/png") {
            processed = await pipeline.png({ compressionLevel: 9 }).toBuffer();
        } else {
            processed = await pipeline.webp({ quality: 86 }).toBuffer();
        }

        await writeFile(finalPath, processed, { flag: "wx" });
        await unlink(quarantinePath);

        return {
            url: `${publicBaseUrl()}/${finalName}`,
            mimeType: detected.mimeType,
            width,
            height,
            size: processed.length,
            originalName: safeOriginalName(file.name),
        };
    } catch (error) {
        await rm(quarantinePath, { force: true });
        await rm(finalPath, { force: true });
        throw error;
    }
}

function resolveStoredPath(url: string): string | null {
    const base = `${publicBaseUrl()}/`;
    if (!url.startsWith(base)) {
        return null;
    }

    const fileName = url.slice(base.length);
    if (!fileName || fileName !== path.basename(fileName)) {
        throw new Error("Stored Media path is invalid.");
    }

    const root = storageRoot();
    const resolved = path.resolve(root, fileName);
    if (path.dirname(resolved) !== root) {
        throw new Error("Stored Media path is outside the storage root.");
    }
    return resolved;
}

export async function removeStoredMediaFile(url: string): Promise<void> {
    const storedPath = resolveStoredPath(url);
    if (storedPath) {
        await rm(storedPath, { force: true });
    }
}

export async function stageStoredMediaDeletion(url: string): Promise<StagedMediaDeletion | null> {
    const storedPath = resolveStoredPath(url);
    if (!storedPath) {
        return null;
    }

    const trashDirectory = path.join(storageRoot(), ".trash");
    await mkdir(trashDirectory, { recursive: true });
    const trashPath = path.join(trashDirectory, `${randomUUID()}-${path.basename(storedPath)}`);

    try {
        await rename(storedPath, trashPath);
    } catch (error) {
        if (
            error instanceof Error
            && "code" in error
            && error.code === "ENOENT"
        ) {
            return null;
        }
        throw error;
    }

    return {
        commit: async () => {
            await rm(trashPath, { force: true });
        },
        rollback: async () => {
            await rename(trashPath, storedPath);
        },
    };
}
