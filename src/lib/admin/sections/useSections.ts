"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchSections } from "./api";
import type { UseSectionsResult } from "./types";

export function useSections(pageId: string | null, lang: "en" | "fa" = "en"): UseSectionsResult {
    const query = useQuery({
        queryKey: ["admin-sections", pageId, lang],
        queryFn: () => fetchSections(pageId ?? "", lang),
        enabled: Boolean(pageId),
        staleTime: 30_000,
    });

    const items = useMemo(() => query.data ?? [], [query.data]);

    return {
        items,
        sectionCount: items.length,
        isLoading: query.isLoading,
        isError: query.isError,
        errorMessage: query.error instanceof Error ? query.error.message : null,
        refetch: async () => {
            await query.refetch();
        },
    };
}
