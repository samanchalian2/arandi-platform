"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchCards } from "./api";
import type { UseCardsResult } from "./types";

export const cardsQueryKey = (sectionId: string | null, lang: "en" | "fa") =>
    ["admin-cards", sectionId, lang] as const;

export function useCards(sectionId: string | null, lang: "en" | "fa" = "en"): UseCardsResult {
    const query = useQuery({
        queryKey: cardsQueryKey(sectionId, lang),
        queryFn: () => fetchCards(sectionId ?? "", lang),
        enabled: Boolean(sectionId),
        staleTime: 30_000,
    });
    const items = useMemo(
        () => [...(query.data ?? [])].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
        [query.data],
    );

    return {
        items,
        cardCount: items.length,
        isLoading: query.isLoading,
        isError: query.isError,
        errorMessage: query.error instanceof Error ? query.error.message : null,
        refetch: async () => {
            await query.refetch();
        },
    };
}
