"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCardById } from "./api";
import type { UseCardResult } from "./types";

export const cardQueryKey = (id: string | null, lang: "en" | "fa") => ["admin-card", id, lang] as const;

export function useCard(id: string | null, lang: "en" | "fa" = "en"): UseCardResult {
    const query = useQuery({
        queryKey: cardQueryKey(id, lang),
        queryFn: () => fetchCardById(id ?? "", lang),
        enabled: Boolean(id),
        staleTime: 30_000,
        retry: (failureCount, error) => {
            const status = "status" in error && typeof error.status === "number" ? error.status : 0;
            return status !== 409 && status < 400 && failureCount < 2;
        },
    });

    return {
        card: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        errorMessage: query.error instanceof Error ? query.error.message : null,
        refetch: async () => {
            await query.refetch();
        },
    };
}
