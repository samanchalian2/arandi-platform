"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSectionById } from "./api";
import type { UseSectionResult } from "./types";

export function useSection(id: string | null, lang: "en" | "fa" = "en"): UseSectionResult {
    const query = useQuery({
        queryKey: ["admin-section", id, lang],
        queryFn: () => fetchSectionById(id ?? "", lang),
        enabled: Boolean(id),
        staleTime: 30_000,
    });

    return {
        section: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        errorMessage: query.error instanceof Error ? query.error.message : null,
        refetch: async () => {
            await query.refetch();
        },
    };
}
