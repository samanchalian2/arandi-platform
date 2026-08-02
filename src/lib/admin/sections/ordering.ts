import type { SectionListItem } from "./types";

export function reorderIds(ids: string[], fromId: string, toId: string): string[] {
    const fromIndex = ids.indexOf(fromId);
    const toIndex = ids.indexOf(toId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return ids;
    }

    const next = [...ids];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

export function isSectionReorderAvailable(
    canReorder: boolean,
    search: string,
    status: "all" | "enabled" | "disabled",
): boolean {
    return canReorder && search.trim().length === 0 && status === "all";
}

export function applyOptimisticSectionOrder(
    sections: SectionListItem[],
    items: Array<{ id: string; order: number }>,
): SectionListItem[] {
    const orderById = new Map(items.map((item) => [item.id, item.order]));
    return sections
        .map((item) => ({
            ...item,
            order: orderById.get(item.id) ?? item.order,
        }))
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
