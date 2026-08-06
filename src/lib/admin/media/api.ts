import type { ApiEnvelope, MediaItem, MediaMetadataInput } from "./types";
import { cmsFetch } from "@/lib/admin/cms-fetch";

async function readEnvelope<T>(response: Response): Promise<T> {
    const envelope = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !envelope.ok || !envelope.data) {
        throw new Error(envelope.error?.message ?? "Media operation failed.");
    }
    return envelope.data;
}

export async function fetchMediaList(): Promise<MediaItem[]> {
    const response = await cmsFetch("/api/cms/media?ordering=desc", {
        cache: "no-store",
    });
    return readEnvelope<MediaItem[]>(response);
}

export async function uploadMedia(file: File, input: MediaMetadataInput): Promise<MediaItem> {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", input.title);
    formData.set("alt", input.alt);
    formData.set("caption", input.caption);

    return readEnvelope<MediaItem>(await cmsFetch("/api/cms/media/upload", {
        method: "POST",
        body: formData,
    }));
}

export async function updateMedia(item: MediaItem, input: MediaMetadataInput): Promise<MediaItem> {
    return readEnvelope<MediaItem>(await cmsFetch(`/api/cms/media/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: input.title,
            alt: input.alt || null,
            caption: input.caption || null,
            expectedUpdatedAt: item.updatedAt,
        }),
    }));
}

export async function deleteMedia(id: string): Promise<{ id: string; deleted: boolean }> {
    return readEnvelope<{ id: string; deleted: boolean }>(await cmsFetch(`/api/cms/media/${id}`, {
        method: "DELETE",
    }));
}
