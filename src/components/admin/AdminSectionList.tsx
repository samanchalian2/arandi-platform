"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useSectionMutation, type SectionListItem } from "@/lib/admin/sections";

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

function reorderIds(ids: string[], fromId: string, toId: string): string[] {
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

export function AdminSectionList({ sections, isLoading, isError, errorMessage, pageId, pageIdentifier, lang, canReorder }: AdminSectionListProps) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<SectionStatusFilter>("all");
    const [draftOrderIds, setDraftOrderIds] = useState<string[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const { reorderSections, isReordering, reorderError } = useSectionMutation();

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sections
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
            })
            .sort((a, b) => a.order - b.order);
    }, [search, sections, status]);

    const byId = useMemo(() => new Map(filtered.map((item) => [item.id, item])), [filtered]);
    const baseIds = useMemo(() => filtered.map((item) => item.id), [filtered]);
    const activeIds = draftOrderIds.length > 0 ? draftOrderIds : baseIds;
    const orderedItems = activeIds.map((id) => byId.get(id)).filter((item): item is SectionListItem => Boolean(item));
    const hasDraftOrder = draftOrderIds.length > 0;

    const onDragStart = (id: string) => {
        if (!canReorder) {
            return;
        }

        setDraggingId(id);
        setLocalError(null);
    };

    const onDropItem = (targetId: string) => {
        if (!canReorder || !draggingId) {
            return;
        }

        const ids = hasDraftOrder ? draftOrderIds : baseIds;
        setDraftOrderIds(reorderIds(ids, draggingId, targetId));
        setDraggingId(null);
    };

    const resetOrder = () => {
        setDraftOrderIds([]);
        setDraggingId(null);
        setLocalError(null);
    };

    const saveOrder = async () => {
        if (!canReorder || !hasDraftOrder) {
            return;
        }

        try {
            await reorderSections({
                pageId,
                lang,
                items: draftOrderIds.map((id, index) => ({
                    id,
                    order: index + 1,
                })),
            });
            resetOrder();
        } catch (error) {
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
            <AdminSectionOrderEditor canReorder={canReorder} dirty={hasDraftOrder} saving={isReordering} onSave={() => void saveOrder()} onReset={resetOrder} />

            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                <AdminTextField
                    label="Search Sections"
                    placeholder="Search by key, type, or title"
                    value={search}
                    onChange={setSearch}
                />
                <label className="space-y-2 text-sm font-medium">
                    <span>Status</span>
                    <select
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={status}
                        onChange={(event) => setStatus(event.target.value as SectionStatusFilter)}
                    >
                        <option value="all">All</option>
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </label>
            </div>

            {orderedItems.length === 0 ? <AdminSectionEmptyState hasFilters={search.length > 0 || status !== "all"} /> : null}

            {orderedItems.length > 0 ? (
                <>
                    <div className="hidden md:block">
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--elevation-1)]">
                            <div className="grid grid-cols-[56px_76px_1.4fr_1fr_110px_110px_120px_120px] gap-3 border-b border-border/60 bg-muted/40 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                <span>Drag</span>
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
                                        draggable={canReorder}
                                        onDragStart={() => onDragStart(item.id)}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={() => onDropItem(item.id)}
                                        className="grid grid-cols-[56px_76px_1.4fr_1fr_110px_110px_120px_120px] items-center gap-3 px-4 py-3 text-sm"
                                    >
                                        <span className={`select-none text-lg ${canReorder ? "cursor-grab" : "text-muted-foreground"}`}>::</span>
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
                                draggable={canReorder}
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
                                    <span className={`text-sm ${canReorder ? "cursor-grab" : "text-muted-foreground"}`}>Drag: ::</span>
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
