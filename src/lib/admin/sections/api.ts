import type {
    ApiEnvelope,
    DeleteSectionPayload,
    RawCmsSection,
    ReorderSectionsPayload,
    SectionDetails,
    SectionListItem,
    UpdateSectionPayload,
} from "./types";
import { mapRawSection } from "./types";
import { cmsFetch } from "@/lib/admin/cms-fetch";

async function readEnvelope<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await cmsFetch(input, {
        ...init,
        cache: "no-store",
    });

    const envelope = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !envelope.ok || !envelope.data) {
        throw new Error(envelope.error?.message ?? "Failed to load section data.");
    }

    return envelope.data;
}

export async function fetchSections(pageId: string, lang: "en" | "fa"): Promise<SectionListItem[]> {
    const sections = await readEnvelope<RawCmsSection[]>(`/api/cms/sections?pageId=${pageId}&lang=${lang}&translations=true`);
    return sections.map((item) => mapRawSection(item));
}

export async function fetchSectionById(id: string, lang: "en" | "fa"): Promise<SectionDetails | null> {
    const section = await readEnvelope<RawCmsSection>(`/api/cms/sections/${id}?lang=${lang}&translations=true`);
    return section ? mapRawSection(section) : null;
}

export async function updateSectionRequest(payload: UpdateSectionPayload): Promise<SectionDetails> {
    const section = await readEnvelope<RawCmsSection>(`/api/cms/sections/${payload.id}?lang=${payload.lang}`, {
        method: "PUT",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            key: payload.key,
            type: payload.type,
            order: payload.order,
            visibility: payload.enabled === undefined ? undefined : { enabled: payload.enabled },
            settings: {
                style: payload.style,
                payload: payload.payload,
            },
            translations: payload.translations,
        }),
    });

    return mapRawSection(section);
}

export async function reorderSectionsRequest(payload: ReorderSectionsPayload): Promise<SectionListItem[]> {
    const sections = await readEnvelope<RawCmsSection[]>(`/api/cms/sections/reorder?lang=${payload.lang}`, {
        method: "PATCH",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            pageId: payload.pageId,
            items: payload.items,
        }),
    });

    return sections.map((item) => mapRawSection(item));
}

export async function deleteSectionRequest(payload: DeleteSectionPayload): Promise<{ id: string; deleted: true }> {
    return readEnvelope<{ id: string; deleted: true }>(`/api/cms/sections/${payload.id}?lang=${payload.lang}`, {
        method: "DELETE",
    });
}
