export type ApiEnvelope<T> = {
    ok: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
};

export type MediaItem = {
    id: string;
    title: string;
    alt: string | null;
    caption: string | null;
    url: string;
    type: string;
    width: number | null;
    height: number | null;
    metadata: unknown;
    uploadReady: {
        supported: boolean;
        strategy: string;
    };
    createdAt: string;
    updatedAt: string;
};

export type MediaTypeFilter = "all" | "image" | "video" | "document" | "other";
export type MediaSortField = "title" | "type" | "updatedAt";

export type UseMediaOptions = {
    search: string;
    type: MediaTypeFilter;
    sortBy: MediaSortField;
    sortDirection: "asc" | "desc";
    page: number;
    pageSize: number;
};

export type UseMediaResult = {
    items: MediaItem[];
    total: number;
    totalPages: number;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    refetch: () => Promise<void>;
};
