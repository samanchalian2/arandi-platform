import type { CardListItem, ReorderCardsPayload } from "./types";

export function createCanonicalCardOrder(items: CardListItem[]): ReorderCardsPayload["items"] {
    return items.map((item, index) => ({ id: item.id, order: index + 1 }));
}

export function applyOptimisticCardOrder(
    current: CardListItem[],
    items: ReorderCardsPayload["items"],
): CardListItem[] {
    const orderById = new Map(items.map((item) => [item.id, item.order]));
    return current
        .map((item) => ({ ...item, order: orderById.get(item.id) ?? item.order }))
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function moveCard(items: CardListItem[], id: string, direction: -1 | 1): CardListItem[] {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) {
        return items;
    }

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return applyOptimisticCardOrder(next, createCanonicalCardOrder(next));
}

export function isCardReorderDisabled(search: string, hasActiveFilter: boolean): boolean {
    return search.trim().length > 0 || hasActiveFilter;
}
