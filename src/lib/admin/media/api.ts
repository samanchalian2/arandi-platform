import type { ApiEnvelope, MediaItem } from "./types";

export async function fetchMediaList(): Promise<MediaItem[]> {
    const response = await fetch("/api/cms/media?ordering=desc", {
        cache: "no-store",
    });
    const envelope = (await response.json()) as ApiEnvelope<MediaItem[]>;

    if (!response.ok || !envelope.ok || !envelope.data) {
        throw new Error(envelope.error?.message ?? "Failed to load media.");
    }

    return envelope.data;
}
