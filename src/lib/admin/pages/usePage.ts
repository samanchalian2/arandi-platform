"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchPageDetails, updatePage } from "./api";
import type { PageDetailsData, UpdatePagePayload } from "./types";

export function usePage(identifier: string, lang: "en" | "fa") {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["admin-page", identifier, lang],
        queryFn: () => fetchPageDetails(identifier, lang),
        staleTime: 30_000,
    });

    const mutation = useMutation({
        mutationFn: (payload: UpdatePagePayload) => updatePage(payload),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: ["admin-page", identifier, lang] });
            const previous = queryClient.getQueryData<PageDetailsData>(["admin-page", identifier, lang]);

            if (previous) {
                queryClient.setQueryData<PageDetailsData>(["admin-page", identifier, lang], {
                    ...previous,
                    page: {
                        ...previous.page,
                        slug: payload.slug,
                        status: payload.status,
                        metadata: {
                            ...previous.page.metadata,
                            seoKeywords: payload.seoKeywords,
                            seoTitle: payload.translations[payload.lang].seoTitle,
                            seoDescription: payload.translations[payload.lang].seoDescription,
                        },
                        settings: {
                            themeSlug: payload.themeSlug,
                            navigationVisible: payload.navigationVisible,
                            pageOrder: payload.pageOrder,
                        },
                        translations: (previous.page.translations ?? []).map((translation) =>
                            translation.languageCode === "en"
                                ? {
                                    ...translation,
                                    title: payload.translations.en.title,
                                    seoTitle: payload.translations.en.seoTitle,
                                    seoDescription: payload.translations.en.seoDescription,
                                }
                                : translation.languageCode === "fa"
                                    ? {
                                        ...translation,
                                        title: payload.translations.fa.title,
                                        seoTitle: payload.translations.fa.seoTitle,
                                        seoDescription: payload.translations.fa.seoDescription,
                                    }
                                    : translation,
                        ),
                    },
                });
            }

            return { previous };
        },
        onError: (_error, _payload, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["admin-page", identifier, lang], context.previous);
            }
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-page", identifier, lang] });
            await queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
        },
    });

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        errorMessage: query.error instanceof Error ? query.error.message : null,
        savePage: mutation.mutateAsync,
        isSaving: mutation.isPending,
        saveError: mutation.error instanceof Error ? mutation.error.message : null,
        refetch: async () => {
            await query.refetch();
        },
    };
}
