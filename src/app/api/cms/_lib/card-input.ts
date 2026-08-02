import { isRecord, parseTranslations, parseUuid, type TranslationsInput } from "./validation";

const CARD_PUBLISH_STATES = ["draft", "in_review", "approved", "published", "archived"] as const;
const STRUCTURAL_CARD_FIELDS = [
    "key",
    "variant",
    "order",
    "publishState",
    "status",
    "active",
    "sectionId",
    "mediaId",
    "tags",
    "metrics",
    "payload",
] as const;

export type CardUpdateInput = {
    key?: string;
    variant?: string;
    order?: number;
    publishState?: string;
    sectionId?: string | null;
    mediaId?: string | null;
    tags?: string[];
    metrics?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    translations?: TranslationsInput;
    expectedUpdatedAt?: Date;
    hasStructuralFields: boolean;
};

export function parseCardUpdateInput(body: Record<string, unknown>): CardUpdateInput {
    const key = parseOptionalNonEmptyString(body, "key", 120);
    const variant = parseOptionalNonEmptyString(body, "variant", 120);
    const order = parseOptionalNonNegativeInteger(body, "order");
    const publishState = parsePublishState(body);
    const sectionId = parseOptionalNullableUuid(body, "sectionId");
    const mediaId = parseOptionalNullableUuid(body, "mediaId");
    const tags = parseTags(body);
    const metrics = parseOptionalRecord(body, "metrics");
    const payload = parseOptionalRecord(body, "payload");
    const translations = parseCardTranslations(body);
    const expectedUpdatedAt = parseExpectedUpdatedAt(body);

    if (!hasAnyOwnProperty(body, [...STRUCTURAL_CARD_FIELDS, "translations"])) {
        throw new Error("Card update must include at least one editable field.");
    }

    return {
        key,
        variant,
        order,
        publishState,
        sectionId,
        mediaId,
        tags,
        metrics,
        payload,
        translations,
        expectedUpdatedAt,
        hasStructuralFields: hasAnyOwnProperty(body, STRUCTURAL_CARD_FIELDS),
    };
}

export function getCardUpdateScopeError(translatorOnly: boolean, input: CardUpdateInput): string | null {
    if (!translatorOnly) {
        return null;
    }
    if (input.hasStructuralFields || !input.translations) {
        return "Translator role can only update Card translation fields.";
    }

    return null;
}

export function isStaleCardUpdate(currentUpdatedAt: Date, expectedUpdatedAt: Date | undefined): boolean {
    return Boolean(expectedUpdatedAt && currentUpdatedAt.getTime() !== expectedUpdatedAt.getTime());
}

function parseOptionalNonEmptyString(
    body: Record<string, unknown>,
    fieldName: string,
    maxLength: number,
): string | undefined {
    if (!Object.hasOwn(body, fieldName)) {
        return undefined;
    }

    const value = body[fieldName];
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${fieldName} must be a non-empty string.`);
    }

    const trimmed = value.trim();
    if (trimmed.length > maxLength) {
        throw new Error(`${fieldName} must be at most ${maxLength} characters.`);
    }

    return trimmed;
}

function parseOptionalNonNegativeInteger(body: Record<string, unknown>, fieldName: string): number | undefined {
    if (!Object.hasOwn(body, fieldName)) {
        return undefined;
    }

    const value = body[fieldName];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new Error(`${fieldName} must be a non-negative integer.`);
    }

    return value;
}

function parsePublishState(body: Record<string, unknown>): string | undefined {
    const explicitState = Object.hasOwn(body, "publishState")
        ? body.publishState
        : Object.hasOwn(body, "status")
            ? body.status
            : undefined;

    if (explicitState !== undefined) {
        if (typeof explicitState !== "string" || !CARD_PUBLISH_STATES.includes(explicitState as (typeof CARD_PUBLISH_STATES)[number])) {
            throw new Error(`publishState must be one of ${CARD_PUBLISH_STATES.join(", ")}.`);
        }
        return explicitState;
    }

    if (Object.hasOwn(body, "active")) {
        if (typeof body.active !== "boolean") {
            throw new Error("active must be a boolean.");
        }
        return body.active ? "published" : "draft";
    }

    return undefined;
}

function parseOptionalNullableUuid(body: Record<string, unknown>, fieldName: string): string | null | undefined {
    if (!Object.hasOwn(body, fieldName)) {
        return undefined;
    }

    const value = body[fieldName];
    if (value === null) {
        return null;
    }
    if (typeof value !== "string") {
        throw new Error(`${fieldName} must be a UUID string or null.`);
    }

    return parseUuid(value, fieldName);
}

function parseTags(body: Record<string, unknown>): string[] | undefined {
    if (!Object.hasOwn(body, "tags")) {
        return undefined;
    }
    if (!Array.isArray(body.tags) || body.tags.some((tag) => typeof tag !== "string")) {
        throw new Error("tags must be an array of strings.");
    }

    const tags = body.tags.map((tag) => tag.trim());
    if (tags.some((tag) => tag.length === 0 || tag.length > 80)) {
        throw new Error("tags must contain non-empty strings of at most 80 characters.");
    }
    if (new Set(tags).size !== tags.length) {
        throw new Error("Duplicate tag values are not allowed.");
    }

    return tags;
}

function parseOptionalRecord(
    body: Record<string, unknown>,
    fieldName: "metrics" | "payload",
): Record<string, unknown> | undefined {
    if (!Object.hasOwn(body, fieldName)) {
        return undefined;
    }
    if (!isRecord(body[fieldName])) {
        throw new Error(`${fieldName} must be a JSON object.`);
    }

    return body[fieldName];
}

function parseCardTranslations(body: Record<string, unknown>): TranslationsInput | undefined {
    if (!Object.hasOwn(body, "translations")) {
        return undefined;
    }
    if (!isRecord(body.translations)) {
        throw new Error("translations must be an object keyed by language code.");
    }

    const unknownLanguages = Object.keys(body.translations).filter((languageCode) => languageCode !== "en" && languageCode !== "fa");
    if (unknownLanguages.length > 0) {
        throw new Error("translations may only contain en and fa.");
    }

    const translations = parseTranslations(body.translations);
    for (const [languageCode, translation] of Object.entries(translations)) {
        if (!translation?.title || translation.title.trim().length === 0) {
            throw new Error(`translations.${languageCode}.title must be a non-empty string.`);
        }

        assertMaxLength(translation.title, `translations.${languageCode}.title`, 120);
        assertMaxLength(translation.subtitle, `translations.${languageCode}.subtitle`, 160);
        assertMaxLength(translation.description, `translations.${languageCode}.description`, 4000);
        assertMaxLength(translation.statusBadge, `translations.${languageCode}.statusBadge`, 120);
        assertMaxLength(translation.ctaLabel, `translations.${languageCode}.ctaLabel`, 160);
        assertMaxLength(translation.ctaHref, `translations.${languageCode}.ctaHref`, 2048);
    }

    return translations;
}

function parseExpectedUpdatedAt(body: Record<string, unknown>): Date | undefined {
    if (!Object.hasOwn(body, "expectedUpdatedAt")) {
        return undefined;
    }
    if (typeof body.expectedUpdatedAt !== "string" || body.expectedUpdatedAt.trim().length === 0) {
        throw new Error("expectedUpdatedAt must be an ISO date string.");
    }

    const value = new Date(body.expectedUpdatedAt);
    if (Number.isNaN(value.getTime())) {
        throw new Error("expectedUpdatedAt must be a valid ISO date string.");
    }

    return value;
}

function assertMaxLength(value: string | undefined, fieldName: string, maxLength: number): void {
    if (value !== undefined && value.length > maxLength) {
        throw new Error(`${fieldName} must be at most ${maxLength} characters.`);
    }
}

function hasAnyOwnProperty(body: Record<string, unknown>, fieldNames: readonly string[]): boolean {
    return fieldNames.some((fieldName) => Object.hasOwn(body, fieldName));
}
