import { isRecord } from "./validation";

const MEDIA_TYPE_PATTERN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;

export type MediaWriteInput = {
    title?: string;
    alt?: string | null;
    caption?: string | null;
    url?: string;
    type?: string;
    width?: number | null;
    height?: number | null;
    metadata?: Record<string, unknown>;
    expectedUpdatedAt?: Date;
};

export function parseMediaCreateInput(body: Record<string, unknown>): Required<Omit<MediaWriteInput, "expectedUpdatedAt">> {
    return {
        title: parseRequiredText(body.title, "title", 200),
        alt: parseNullableText(body, "alt", 500) ?? null,
        caption: parseNullableText(body, "caption", 2000) ?? null,
        url: parseMediaUrl(body.url),
        type: parseMediaType(body.type),
        width: parseNullableDimension(body, "width") ?? null,
        height: parseNullableDimension(body, "height") ?? null,
        metadata: parseMetadata(body, false) ?? {},
    };
}

export function parseMediaUpdateInput(body: Record<string, unknown>): MediaWriteInput {
    const input: MediaWriteInput = {
        title: Object.hasOwn(body, "title") ? parseRequiredText(body.title, "title", 200) : undefined,
        alt: parseNullableText(body, "alt", 500),
        caption: parseNullableText(body, "caption", 2000),
        url: Object.hasOwn(body, "url") ? parseMediaUrl(body.url) : undefined,
        type: Object.hasOwn(body, "type") ? parseMediaType(body.type) : undefined,
        width: parseNullableDimension(body, "width"),
        height: parseNullableDimension(body, "height"),
        metadata: parseMetadata(body, true),
        expectedUpdatedAt: parseExpectedUpdatedAt(body),
    };

    const editableFields = ["title", "alt", "caption", "url", "type", "width", "height", "metadata"];
    if (!editableFields.some((field) => Object.hasOwn(body, field))) {
        throw new Error("Media update must include at least one editable field.");
    }

    return input;
}

function parseRequiredText(value: unknown, field: string, maxLength: number): string {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${field} must be a non-empty string.`);
    }
    const normalized = value.trim();
    if (normalized.length > maxLength) {
        throw new Error(`${field} must be at most ${maxLength} characters.`);
    }
    return normalized;
}

function parseNullableText(
    body: Record<string, unknown>,
    field: "alt" | "caption",
    maxLength: number,
): string | null | undefined {
    if (!Object.hasOwn(body, field)) return undefined;
    const value = body[field];
    if (value === null || value === "") return null;
    if (typeof value !== "string") {
        throw new Error(`${field} must be a string or null.`);
    }
    const normalized = value.trim();
    if (normalized.length > maxLength) {
        throw new Error(`${field} must be at most ${maxLength} characters.`);
    }
    return normalized || null;
}

function parseMediaUrl(value: unknown): string {
    const url = parseRequiredText(value, "url", 2048);
    if (url.startsWith("/") && !url.startsWith("//")) return url;

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error("url must be a root-relative, http, or https URL.");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("url must use http or https.");
    }
    if (parsed.username || parsed.password) {
        throw new Error("url must not contain credentials.");
    }
    return parsed.toString();
}

function parseMediaType(value: unknown): string {
    const type = parseRequiredText(value, "type", 150).toLowerCase();
    if (!MEDIA_TYPE_PATTERN.test(type)) {
        throw new Error("type must be a valid MIME type.");
    }
    return type;
}

function parseNullableDimension(
    body: Record<string, unknown>,
    field: "width" | "height",
): number | null | undefined {
    if (!Object.hasOwn(body, field)) return undefined;
    const value = body[field];
    if (value === null) return null;
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0 || value > 100_000) {
        throw new Error(`${field} must be a positive integer no greater than 100000, or null.`);
    }
    return value;
}

function parseMetadata(
    body: Record<string, unknown>,
    optional: boolean,
): Record<string, unknown> | undefined {
    if (!Object.hasOwn(body, "metadata")) return optional ? undefined : {};
    if (!isRecord(body.metadata)) {
        throw new Error("metadata must be a JSON object.");
    }
    return body.metadata;
}

function parseExpectedUpdatedAt(body: Record<string, unknown>): Date | undefined {
    if (!Object.hasOwn(body, "expectedUpdatedAt")) return undefined;
    if (typeof body.expectedUpdatedAt !== "string" || body.expectedUpdatedAt.trim().length === 0) {
        throw new Error("expectedUpdatedAt must be an ISO date string.");
    }
    const value = new Date(body.expectedUpdatedAt);
    if (Number.isNaN(value.getTime())) {
        throw new Error("expectedUpdatedAt must be a valid ISO date string.");
    }
    return value;
}
