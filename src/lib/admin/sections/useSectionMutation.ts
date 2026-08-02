"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSectionRequest, reorderSectionsRequest, updateSectionRequest } from "./api";
import { applyOptimisticSectionOrder } from "./ordering";
import type {
    DeleteSectionPayload,
    ReorderSectionsPayload,
    SectionDetails,
    SectionListItem,
    UpdateSectionPayload,
    UseSectionMutationResult,
} from "./types";

function toListItem(section: SectionDetails): SectionListItem {
    return {
        id: section.id,
        pageId: section.pageId,
        key: section.key,
        type: section.type,
        order: section.order,
        enabled: section.enabled,
        status: section.enabled ? "enabled" : "disabled",
        languages: section.languages,
        title: section.title,
        subtitle: section.subtitle,
        updatedAt: section.updatedAt,
    };
}

export function useSectionMutation(): UseSectionMutationResult {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (payload: UpdateSectionPayload) => updateSectionRequest(payload),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: ["admin-section", payload.id, payload.lang] });
            await queryClient.cancelQueries({ queryKey: ["admin-sections", payload.pageId, payload.lang] });

            const previousSection = queryClient.getQueryData<SectionDetails>(["admin-section", payload.id, payload.lang]);
            const previousSections = queryClient.getQueryData<SectionListItem[]>(["admin-sections", payload.pageId, payload.lang]);

            if (previousSection) {
                const next: SectionDetails = {
                    ...previousSection,
                    key: payload.key ?? previousSection.key,
                    type: payload.type ?? previousSection.type,
                    order: payload.order ?? previousSection.order,
                    enabled: payload.enabled ?? previousSection.enabled,
                    status: (payload.enabled ?? previousSection.enabled) ? "enabled" : "disabled",
                    style: payload.style ?? previousSection.style,
                    payload: payload.payload ?? previousSection.payload,
                    translations: {
                        en: {
                            ...previousSection.translations.en,
                            ...(payload.translations?.en ?? {}),
                        },
                        fa: {
                            ...previousSection.translations.fa,
                            ...(payload.translations?.fa ?? {}),
                        },
                    },
                };
                queryClient.setQueryData(["admin-section", payload.id, payload.lang], next);
            }

            if (previousSections) {
                queryClient.setQueryData<SectionListItem[]>(
                    ["admin-sections", payload.pageId, payload.lang],
                    previousSections.map((item) =>
                        item.id === payload.id
                            ? {
                                ...item,
                                key: payload.key ?? item.key,
                                type: payload.type ?? item.type,
                                order: payload.order ?? item.order,
                                enabled: payload.enabled ?? item.enabled,
                                status: (payload.enabled ?? item.enabled) ? "enabled" : "disabled",
                            }
                            : item,
                    ),
                );
            }

            return { previousSection, previousSections };
        },
        onError: (_error, payload, context) => {
            if (context?.previousSection) {
                queryClient.setQueryData(["admin-section", payload.id, payload.lang], context.previousSection);
            }
            if (context?.previousSections) {
                queryClient.setQueryData(["admin-sections", payload.pageId, payload.lang], context.previousSections);
            }
        },
        onSuccess: (section, payload) => {
            queryClient.setQueryData(["admin-section", payload.id, payload.lang], section);
            queryClient.setQueryData<SectionListItem[]>(
                ["admin-sections", payload.pageId, payload.lang],
                (current) =>
                    (current ?? []).map((item) => (item.id === section.id ? { ...toListItem(section) } : item)),
            );
        },
        onSettled: async (_data, _error, payload) => {
            await queryClient.invalidateQueries({ queryKey: ["admin-section", payload.id, payload.lang] });
            await queryClient.invalidateQueries({ queryKey: ["admin-sections", payload.pageId, payload.lang] });
            await queryClient.invalidateQueries({ queryKey: ["admin-page"] });
        },
    });

    const reorderMutation = useMutation({
        mutationFn: (payload: ReorderSectionsPayload) => reorderSectionsRequest(payload),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: ["admin-sections", payload.pageId, payload.lang] });
            const previous = queryClient.getQueryData<SectionListItem[]>(["admin-sections", payload.pageId, payload.lang]);

            if (previous) {
                queryClient.setQueryData<SectionListItem[]>(
                    ["admin-sections", payload.pageId, payload.lang],
                    applyOptimisticSectionOrder(previous, payload.items),
                );
            }

            return { previous };
        },
        onError: (_error, payload, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["admin-sections", payload.pageId, payload.lang], context.previous);
            }
        },
        onSuccess: (sections, payload) => {
            queryClient.setQueryData(["admin-sections", payload.pageId, payload.lang], sections);
        },
        onSettled: async (_data, _error, payload) => {
            await queryClient.invalidateQueries({ queryKey: ["admin-sections", payload.pageId, payload.lang] });
            await queryClient.invalidateQueries({ queryKey: ["admin-page"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (payload: DeleteSectionPayload) => deleteSectionRequest(payload),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: ["admin-sections", payload.pageId, payload.lang] });
            await queryClient.cancelQueries({ queryKey: ["admin-section", payload.id, payload.lang] });

            const previousSections = queryClient.getQueryData<SectionListItem[]>(["admin-sections", payload.pageId, payload.lang]);
            const previousSection = queryClient.getQueryData<SectionDetails>(["admin-section", payload.id, payload.lang]);

            if (previousSections) {
                queryClient.setQueryData<SectionListItem[]>(
                    ["admin-sections", payload.pageId, payload.lang],
                    previousSections.filter((item) => item.id !== payload.id),
                );
            }
            queryClient.setQueryData(["admin-section", payload.id, payload.lang], null);

            return { previousSections, previousSection };
        },
        onError: (_error, payload, context) => {
            if (context?.previousSections) {
                queryClient.setQueryData(["admin-sections", payload.pageId, payload.lang], context.previousSections);
            }
            if (context?.previousSection) {
                queryClient.setQueryData(["admin-section", payload.id, payload.lang], context.previousSection);
            }
        },
        onSettled: async (_data, _error, payload) => {
            await queryClient.invalidateQueries({ queryKey: ["admin-sections", payload.pageId, payload.lang] });
            await queryClient.invalidateQueries({ queryKey: ["admin-section", payload.id, payload.lang] });
            await queryClient.invalidateQueries({ queryKey: ["admin-page"] });
        },
    });

    return {
        updateSection: updateMutation.mutateAsync,
        reorderSections: reorderMutation.mutateAsync,
        deleteSection: deleteMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        isReordering: reorderMutation.isPending,
        isDeleting: deleteMutation.isPending,
        updateError: updateMutation.error instanceof Error ? updateMutation.error.message : null,
        reorderError: reorderMutation.error instanceof Error ? reorderMutation.error.message : null,
        deleteError: deleteMutation.error instanceof Error ? deleteMutation.error.message : null,
    };
}
