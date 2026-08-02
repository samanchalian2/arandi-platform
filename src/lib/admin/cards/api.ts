import type {
    ApiEnvelope,
    CardDetails,
    DeleteCardPayload,
    RawCmsCard,
    ReorderCardsPayload,
    UpdateCardPayload,
} from "./types";
import { CmsApiError, mapRawCard } from "./types";

export async function readCardEnvelope<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, { ...init, cache: "no-store" });
    let envelope: ApiEnvelope<T>;

    try {
        envelope = (await response.json()) as ApiEnvelope<T>;
    } catch {
        throw new CmsApiError("INVALID_RESPONSE", "The CMS returned an invalid response.", response.status);
    }

    if (!response.ok || !envelope.ok || envelope.data === undefined) {
        throw new CmsApiError(
            envelope.error?.code ?? "REQUEST_FAILED",
            envelope.error?.message ?? "The Card request failed.",
            response.status,
        );
    }

    return envelope.data;
}

export async function fetchCards(sectionId: string, lang: "en" | "fa"): Promise<CardDetails[]> {
    const params = new URLSearchParams({ sectionId, lang, translations: "true", ordering: "asc" });
    const cards = await readCardEnvelope<RawCmsCard[]>(`/api/cms/cards?${params.toString()}`);
    return cards.map(mapRawCard);
}

export async function fetchCardById(id: string, lang: "en" | "fa"): Promise<CardDetails> {
    const params = new URLSearchParams({ lang, translations: "true" });
    const card = await readCardEnvelope<RawCmsCard>(`/api/cms/cards/${id}?${params.toString()}`);
    return mapRawCard(card);
}

export async function updateCardRequest(payload: UpdateCardPayload): Promise<CardDetails> {
    const body: Record<string, unknown> = {
        expectedUpdatedAt: payload.expectedUpdatedAt,
    };

    if (payload.key !== undefined) body.key = payload.key;
    if (payload.variant !== undefined) body.variant = payload.variant;
    if (payload.order !== undefined) body.order = payload.order;
    if (payload.publishState !== undefined) body.publishState = payload.publishState;
    if (payload.targetSectionId !== undefined) body.sectionId = payload.targetSectionId;
    if (payload.mediaId !== undefined) body.mediaId = payload.mediaId;
    if (payload.tags !== undefined) body.tags = payload.tags;
    if (payload.metrics !== undefined) body.metrics = payload.metrics;
    if (payload.payload !== undefined) body.payload = payload.payload;
    if (payload.translations !== undefined) body.translations = payload.translations;

    const card = await readCardEnvelope<RawCmsCard>(`/api/cms/cards/${payload.id}?lang=${payload.lang}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
    return mapRawCard(card);
}

export async function reorderCardsRequest(payload: ReorderCardsPayload): Promise<CardDetails[]> {
    const cards = await readCardEnvelope<RawCmsCard[]>(`/api/cms/cards/reorder?lang=${payload.lang}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sectionId: payload.sectionId, items: payload.items }),
    });
    return cards.map(mapRawCard);
}

export async function deleteCardRequest(payload: DeleteCardPayload): Promise<{ id: string; deleted: true }> {
    return readCardEnvelope<{ id: string; deleted: true }>(`/api/cms/cards/${payload.id}?lang=${payload.lang}`, {
        method: "DELETE",
    });
}
