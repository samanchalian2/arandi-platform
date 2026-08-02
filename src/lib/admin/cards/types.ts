export type ApiEnvelope<T> = {
    ok: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
};

export type CardPublishState = "draft" | "in_review" | "approved" | "published" | "archived";
export const CARD_PUBLISH_STATES: CardPublishState[] = ["draft", "in_review", "approved", "published", "archived"];

export type CardTranslation = {
    title: string;
    subtitle: string;
    description: string;
    statusBadge: string;
    ctaLabel: string;
    ctaHref: string;
};

export type CardMedia = {
    id: string;
    url: string;
    type: string;
    width: number | null;
    height: number | null;
    alt: string | null;
    caption: string | null;
};

export type RawCmsCard = {
    id: string;
    key: string;
    sectionId: string | null;
    variant: string;
    order: number;
    publishState: string;
    status: string;
    image: CardMedia | null;
    tags: string[];
    metrics: Record<string, unknown>;
    payload: Record<string, unknown>;
    translation: RawCardTranslation | null;
    translations?: RawCardTranslation[];
    createdAt: string;
    updatedAt: string;
};

type RawCardTranslation = {
    languageCode: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    statusBadge: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
};

export type CardDetails = {
    id: string;
    key: string;
    sectionId: string | null;
    variant: string;
    order: number;
    publishState: CardPublishState | string;
    media: CardMedia | null;
    tags: string[];
    metrics: Record<string, unknown>;
    payload: Record<string, unknown>;
    languages: string[];
    title: string;
    translations: {
        en: CardTranslation;
        fa: CardTranslation;
    };
    createdAt: string;
    updatedAt: string;
};

export type CardListItem = CardDetails;
export type CardAdminRole = "SuperAdmin" | "Admin" | "Editor" | "Translator" | "Viewer";

export type UpdateCardPayload = {
    id: string;
    sectionId: string;
    lang: "en" | "fa";
    expectedUpdatedAt: string;
    key?: string;
    variant?: string;
    order?: number;
    publishState?: string;
    targetSectionId?: string | null;
    mediaId?: string | null;
    tags?: string[];
    metrics?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    translations?: Partial<Record<"en" | "fa", CardTranslation>>;
};

export type ReorderCardsPayload = {
    sectionId: string;
    lang: "en" | "fa";
    items: Array<{ id: string; order: number }>;
};

export type DeleteCardPayload = {
    id: string;
    sectionId: string;
    lang: "en" | "fa";
};

export type UseCardsResult = {
    items: CardListItem[];
    cardCount: number;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    refetch: () => Promise<void>;
};

export type UseCardResult = {
    card: CardDetails | null;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    refetch: () => Promise<void>;
};

export class CmsApiError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = "CmsApiError";
    }
}

export function getCardCapabilities(role: CardAdminRole) {
    const canEditStructure = role === "SuperAdmin" || role === "Admin" || role === "Editor";
    return {
        canEditStructure,
        canEditTranslations: canEditStructure || role === "Translator",
        canReorder: canEditStructure,
        canDelete: role === "SuperAdmin" || role === "Admin",
    };
}

export function parseCardJsonObject(value: string, fieldName: string): Record<string, unknown> {
    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        throw new Error(`${fieldName} must contain valid JSON.`);
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error(`${fieldName} must be a JSON object.`);
    }
    return parsed as Record<string, unknown>;
}

const EMPTY_TRANSLATION: CardTranslation = {
    title: "",
    subtitle: "",
    description: "",
    statusBadge: "",
    ctaLabel: "",
    ctaHref: "",
};

function mapTranslation(value: RawCardTranslation | undefined): CardTranslation {
    return value
        ? {
            title: value.title ?? "",
            subtitle: value.subtitle ?? "",
            description: value.description ?? "",
            statusBadge: value.statusBadge ?? "",
            ctaLabel: value.ctaLabel ?? "",
            ctaHref: value.ctaHref ?? "",
        }
        : { ...EMPTY_TRANSLATION };
}

export function mapRawCard(card: RawCmsCard): CardDetails {
    const translations = card.translations ?? [];
    const en = translations.find((item) => item.languageCode === "en");
    const fa = translations.find((item) => item.languageCode === "fa");
    const fallback = card.translation?.title ?? en?.title ?? fa?.title ?? card.key;

    return {
        id: card.id,
        key: card.key,
        sectionId: card.sectionId,
        variant: card.variant,
        order: card.order,
        publishState: card.publishState,
        media: card.image,
        tags: card.tags,
        metrics: card.metrics,
        payload: card.payload,
        languages: translations.filter((item) => item.title).map((item) => item.languageCode),
        title: fallback,
        translations: {
            en: mapTranslation(en),
            fa: mapTranslation(fa),
        },
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
    };
}
