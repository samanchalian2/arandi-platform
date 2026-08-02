import { isRecord, parseUuid } from "./validation";

export type ReorderItem = {
    id: string;
    order: number;
};

export type OwnedOrderedRecord = {
    id: string;
    ownerId: string | null;
};

export function parseReorderItems(value: unknown): ReorderItem[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error("items must be a non-empty array.");
    }

    const items = value.map((item, index) => {
        if (!isRecord(item)) {
            throw new Error(`items[${index}] must be an object.`);
        }

        const id = parseUuid(typeof item.id === "string" ? item.id : "", `items[${index}].id`);
        if (typeof item.order !== "number" || !Number.isInteger(item.order) || item.order < 0) {
            throw new Error(`items[${index}].order must be a non-negative integer.`);
        }

        return { id, order: item.order };
    });

    assertUnique(items.map((item) => item.id), "item id");
    assertUnique(items.map((item) => item.order), "order");
    assertContiguousOrder(items);

    return items;
}

export function assertCompleteOwnedCollection(
    items: ReorderItem[],
    records: OwnedOrderedRecord[],
    ownerId: string,
    resourceName: string,
): void {
    if (records.length !== items.length) {
        throw new Error(`A complete ${resourceName} collection is required for reorder.`);
    }

    const submittedIds = new Set(items.map((item) => item.id));
    if (records.some((record) => !submittedIds.has(record.id))) {
        throw new Error(`A complete ${resourceName} collection is required for reorder.`);
    }

    if (records.some((record) => record.ownerId !== ownerId)) {
        throw new Error(`All ${resourceName} items must belong to the supplied owner.`);
    }
}

function assertUnique<T>(values: T[], fieldName: string): void {
    if (new Set(values).size !== values.length) {
        throw new Error(`Duplicate ${fieldName} values are not allowed.`);
    }
}

function assertContiguousOrder(items: ReorderItem[]): void {
    const sortedOrders = items.map((item) => item.order).sort((a, b) => a - b);
    if (sortedOrders.some((order, index) => order !== index + 1)) {
        throw new Error("order values must form a contiguous sequence starting at 1.");
    }
}
