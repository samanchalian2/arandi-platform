"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCardRequest, reorderCardsRequest, updateCardRequest } from "./api";
import { applyOptimisticCardOrder } from "./ordering";
import { cardQueryKey } from "./useCard";
import { cardsQueryKey } from "./useCards";
import type { CardDetails, DeleteCardPayload, ReorderCardsPayload, UpdateCardPayload } from "./types";

export function useCardMutation() {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: updateCardRequest,
        retry: false,
        onSuccess: (card, payload) => {
            queryClient.setQueryData(cardQueryKey(payload.id, payload.lang), card);
            queryClient.setQueryData<CardDetails[]>(cardsQueryKey(payload.sectionId, payload.lang), (current) =>
                (current ?? []).map((item) => (item.id === card.id ? card : item)),
            );
        },
        onSettled: async (_data, _error, payload) => {
            await queryClient.invalidateQueries({ queryKey: cardQueryKey(payload.id, payload.lang) });
            await queryClient.invalidateQueries({ queryKey: cardsQueryKey(payload.sectionId, payload.lang) });
        },
    });

    const reorderMutation = useMutation({
        mutationFn: reorderCardsRequest,
        onMutate: async (payload: ReorderCardsPayload) => {
            const key = cardsQueryKey(payload.sectionId, payload.lang);
            await queryClient.cancelQueries({ queryKey: key });
            const previous = queryClient.getQueryData<CardDetails[]>(key);
            if (previous) {
                queryClient.setQueryData(key, applyOptimisticCardOrder(previous, payload.items));
            }
            return { previous };
        },
        onError: (_error, payload, context) => {
            if (context?.previous) {
                queryClient.setQueryData(cardsQueryKey(payload.sectionId, payload.lang), context.previous);
            }
        },
        onSuccess: (cards, payload) => {
            queryClient.setQueryData(cardsQueryKey(payload.sectionId, payload.lang), cards);
        },
        onSettled: async (_data, _error, payload) => {
            await queryClient.invalidateQueries({ queryKey: cardsQueryKey(payload.sectionId, payload.lang) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCardRequest,
        onSuccess: (_result, payload: DeleteCardPayload) => {
            queryClient.removeQueries({ queryKey: cardQueryKey(payload.id, payload.lang) });
            queryClient.setQueryData<CardDetails[]>(cardsQueryKey(payload.sectionId, payload.lang), (current) =>
                (current ?? []).filter((item) => item.id !== payload.id),
            );
        },
        onSettled: async (_data, _error, payload) => {
            await queryClient.invalidateQueries({ queryKey: cardsQueryKey(payload.sectionId, payload.lang) });
        },
    });

    return {
        updateCard: (payload: UpdateCardPayload) => updateMutation.mutateAsync(payload),
        reorderCards: (payload: ReorderCardsPayload) => reorderMutation.mutateAsync(payload),
        deleteCard: (payload: DeleteCardPayload) => deleteMutation.mutateAsync(payload),
        isUpdating: updateMutation.isPending,
        isReordering: reorderMutation.isPending,
        isDeleting: deleteMutation.isPending,
        updateError: updateMutation.error,
        reorderError: reorderMutation.error instanceof Error ? reorderMutation.error.message : null,
        deleteError: deleteMutation.error instanceof Error ? deleteMutation.error.message : null,
    };
}
