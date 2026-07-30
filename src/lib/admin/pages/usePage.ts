"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPageDetails } from "./api";

export function usePage(identifier: string, lang: "en" | "fa") {
    const query = useQuery({
        queryKey: ["admin-page", identifier, lang],
        queryFn: () => fetchPageDetails(identifier, lang),
        staleTime: 30_000,
    });

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        errorMessage: query.error instanceof Error ? query.error.message : null,
        refetch: async () => {
            await query.refetch();
        },
    };
}
