"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useSectionMutation, type SectionListItem } from "@/lib/admin/sections";
import { isSectionReorderAvailable, reorderIds } from "@/lib/admin/sections/ordering";

import { buttonVariants } from "@/components/ui/button";

import { AdminLanguageBadge } from "./AdminLanguageBadge";
import { AdminLoading } from "./AdminLoading";
import { AdminSectionCard } from "./AdminSectionCard";
import { AdminSectionEmptyState } from "./AdminSectionEmptyState";
import { AdminSectionOrderEditor } from "./AdminSectionOrderEditor";
import { AdminSectionTypeBadge } from "./AdminSectionTypeBadge";
import { AdminTextField } from "./AdminTextField";
import { AdminValidationMessage } from "./AdminValidationMessage";

type SectionStatusFilter = "all" | "enabled" | "disabled";

type AdminSectionListProps = {
    sections: SectionListItem[];
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    pageId: string;
    pageIdentifier: string;
    lang: "en" | "fa";
    canReorder: boolean;
};

export function AdminSectionList({ sections, isLoading, isError, errorMessage, pageId, pageIdentifier, lang, canReorder }: AdminSectionListProps) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<SectionStatusFilter>("all");
    const [draftOrder, setDraftOrder] = useState<{ source: string; ids: string[] } | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const { reorderSections, isReordering, reorderError } = useSectionMutation();
    const canonicalItems = useMemo(() => [...sections].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)), [sections]);
    const canonicalIds = useMemo(() => canonicalItems.map((item) => item.id), [canonicalItems]);
    const canonicalSource = canonicalIds.join(",");
    const filtersActive = search.trim().length > 0 || status !== "all";
    const reorderAvailable = isSectionReorderAvailable(canReorder, search, status);
    const validDraftIds = draftOrder?.source === canonicalSource ? draftOrder.ids : null;
    const hasDraftOrder = Boolean(validDraftIds);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return canonicalItems
            .filter((item) => {
                const statusMatch = status === "all" || item.status === status;
                if (!statusMatch) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                return (
                    item.key.toLowerCase().includes(query) ||
                    item.type.toLowerCase().includes(query) ||
                    item.title.toLowerCase().includes(query)
                );
            });
    }, [canonicalItems, search, status]);

    const byId = useMemo(() => new Map(canonicalItems.map((item) => [item.id, item])), [canonicalItems]);
    const visibleIds = useMemo(() => new Set(filtered.map((item) => item.id)), [filtered]);
    const activeIds = validDraftIds ?? canonicalIds;
    const orderedItems = activeIds
        .filter((id) => !filtersActive || visibleIds.has(id))
        .map((id) => byId.get(id))
        .filter((item): item is SectionListItem => Boolean(item));

    const onDragStart = (id: string) => {
        if (!reorderAvailable) {
            return;
        }

        setDraggingId(id);
        setLocalError(null);
    };

    const onDropItem = (targetId: string) => {
        if (!reorderAvailable || !draggingId) {
            return;
        }

        const ids = validDraftIds ?? canonicalIds;
        setDraftOrder({
            source: canonicalSource,
            ids: reorderIds(ids, draggingId, targetId),
        });
        setDraggingId(null);
    };

    const resetOrder = () => {
        setDraftOrder(null);
        setDraggingId(null);
        setLocalError(null);
    };

    const moveItem = (id: string, direction: -1 | 1) => {
        if (!reorderAvailable) {
            return;
        }

        const ids = validDraftIds ?? canonicalIds;
        const currentIndex = ids.indexOf(id);
        const targetIndex = currentIndex + direction;
        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ids.length) {
            return;
        }

        setDraftOrder({
            source: canonicalSource,
            ids: reorderIds(ids, id, ids[targetIndex]),
        });
        setLocalError(null);
    };

    const saveOrder = async () => {
        if (!reorderAvailable || !validDraftIds) {
            return;
        }

        try {
            await reorderSections({
                pageId,
                lang,
                items: validDraftIds.map((id, index) => ({
                    id,
                    order: index + 1,
                })),
            });
            resetOrder();
        } catch (error) {
            setDraftOrder(null);
            setDraggingId(null);
            setLocalError(error instanceof Error ? error.message : "Failed to reorder sections.");
        }
    };

    if (isLoading) {
        return <AdminLoading />;
    }

    if (isError) {
        return (
            <div className="space-y-2">
                <AdminSectionEmptyState />
                {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AdminSectionOrderEditor canReorder={reorderAvailable} dirty={hasDraftOrder} saving={isReordering} onSave={() => void saveOrder()} onReset={resetOrder} />

            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                <AdminTextField
                    label="Search Sections"
                    placeholder="Search by key, type, or title"
                    value={search}
                    onChange={(value) => {
                        resetOrder();
                        setSearch(value);
                    }}
                />
                <label className="space-y-2 text-sm font-medium">
                    <span>Status</span>
                    <select
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={status}
                        onChange={(event) => {
                            resetOrder();
                            setStatus(event.target.value as SectionStatusFilter);
                        }}
                    >
                        <option value="all">All</option>
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </label>
            </div>

            {canReorder && filtersActive ? (
                <p className="text-sm text-muted-foreground">
                    Clear search and status filters to reorder the complete Section collection.
                </p>
            ) : null}

            {orderedItems.length === 0 ? <AdminSectionEmptyState hasFilters={search.length > 0 || status !== "all"} /> : null}

            {orderedItems.length > 0 ? (
                <>
                    <div className="hidden md:block">
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--elevation-1)]">
                            <div className="grid grid-cols-[96px_76px_1.4fr_1fr_110px_110px_120px_120px] gap-3 border-b border-border/60 bg-muted/40 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                <span>Move</span>
                                <span>Order</span>
                                <span>Section</span>
                                <span>Type</span>
                                <span>Status</span>
                                <span>Languages</span>
                                <span>Updated</span>
                                <span>Action</span>
                            </div>
                            <div className="divide-y divide-border/50">
                                {orderedItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        draggable={reorderAvailable}
                                        onDragStart={() => onDragStart(item.id)}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={() => onDropItem(item.id)}
                                        className="grid grid-cols-[96px_76px_1.4fr_1fr_110px_110px_120px_120px] items-center gap-3 px-4 py-3 text-sm"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className={`select-none text-lg ${reorderAvailable ? "cursor-grab" : "text-muted-foreground"}`}>::</span>
                                            <button
                                                type="button"
                                                className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
                                                onClick={() => moveItem(item.id, -1)}
                                                disabled={!reorderAvailable || index === 0}
                                                aria-label={`Move ${item.title} up`}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
                                                onClick={() => moveItem(item.id, 1)}
                                                disabled={!reorderAvailable || index === orderedItems.length - 1}
                                                aria-label={`Move ${item.title} down`}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                        <span>{index + 1}</span>
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.key}</p>
                                        </div>
                                        <AdminSectionTypeBadge type={item.type} />
                                        <span className="text-xs uppercase text-muted-foreground">{item.status}</span>
                                        <AdminLanguageBadge languages={item.languages} />
                                        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                                        <Link href={`/admin/pages/${pageIdentifier}/sections/${item.id}?lang=${lang}`} className={buttonVariants({ size: "xs", variant: "outline" })}>
                                            Details
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 md:hidden">
                        {orderedItems.map((item, index) => (
                            <div
                                key={item.id}
                                draggable={reorderAvailable}
                                onDragStart={() => onDragStart(item.id)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => onDropItem(item.id)}
                                className={draggingId === item.id ? "opacity-70" : undefined}
                            >
                                <AdminSectionCard
                                    keyName={item.key}
                                    type={item.type}
                                    order={index + 1}
                                    status={item.status}
                                    languages={item.languages}
                                    updatedAt={item.updatedAt}
                                    title={item.title}
                                    subtitle={item.subtitle}
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className={`text-sm ${reorderAvailable ? "cursor-grab" : "text-muted-foreground"}`}>Drag: ::</span>
                                        <button
                                            type="button"
                                            className={buttonVariants({ size: "xs", variant: "outline" })}
                                            onClick={() => moveItem(item.id, -1)}
                                            disabled={!reorderAvailable || index === 0}
                                        >
                                            Move up
                                        </button>
                                        <button
                                            type="button"
                                            className={buttonVariants({ size: "xs", variant: "outline" })}
                                            onClick={() => moveItem(item.id, 1)}
                                            disabled={!reorderAvailable || index === orderedItems.length - 1}
                                        >
                                            Move down
                                        </button>
                                    </div>
                                    <Link href={`/admin/pages/${pageIdentifier}/sections/${item.id}?lang=${lang}`} className={buttonVariants({ size: "xs", variant: "outline" })}>
                                        Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : null}

            <AdminValidationMessage message={localError ?? reorderError ?? undefined} />
        </div>
    );
}
