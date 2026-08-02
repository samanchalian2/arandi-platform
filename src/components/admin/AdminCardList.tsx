"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
    createCanonicalCardOrder,
    getCardCapabilities,
    isCardReorderDisabled,
    moveCard,
    useCardMutation,
    useCards,
    type CardAdminRole,
    type CardListItem,
} from "@/lib/admin/cards";

import { AdminCardEmptyState } from "./AdminCardEmptyState";
import { AdminCardItem } from "./AdminCardItem";
import { AdminCardOrderEditor } from "./AdminCardOrderEditor";
import { AdminCardToolbar } from "./AdminCardToolbar";
import { AdminLoading } from "./AdminLoading";

type AdminCardListProps = {
    identifier: string;
    sectionId: string;
    sectionKey: string;
    currentRole: CardAdminRole;
};

export function AdminCardList({ identifier, sectionId, sectionKey, currentRole }: AdminCardListProps) {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";
    const { items, cardCount, isLoading, isError, errorMessage } = useCards(sectionId, lang);
    const { reorderCards, isReordering, reorderError } = useCardMutation();
    const { canReorder } = getCardCapabilities(currentRole);

    const [search, setSearch] = useState("");
    const [publishState, setPublishState] = useState("all");
    const [language, setLanguage] = useState("all");
    const [media, setMedia] = useState("all");
    const [orderDraft, setOrderDraft] = useState<{ source: string; items: CardListItem[] } | null>(null);
    const [orderError, setOrderError] = useState<string | null>(null);

    const hasFilter = publishState !== "all" || language !== "all" || media !== "all";
    const reorderDisabled = !canReorder || isCardReorderDisabled(search, hasFilter);
    const canonicalIds = items.map((item) => item.id).join(",");
    const validDraft = orderDraft?.source === canonicalIds ? orderDraft.items : null;
    const orderedItems = validDraft ?? items;
    const orderDirty = Boolean(validDraft);

    const filtered = useMemo(() => {
        const normalized = search.trim().toLowerCase();
        return items.filter((card) => {
            if (normalized && !card.title.toLowerCase().includes(normalized) && !card.key.toLowerCase().includes(normalized)) {
                return false;
            }
            if (publishState !== "all" && card.publishState !== publishState) return false;
            if (language !== "all" && !card.languages.includes(language)) return false;
            if (media === "present" && !card.media) return false;
            if (media === "missing" && card.media) return false;
            return true;
        });
    }, [items, language, media, publishState, search]);

    const handleSaveOrder = async () => {
        if (reorderDisabled || !validDraft || validDraft.length !== items.length) return;
        setOrderError(null);
        try {
            await reorderCards({
                sectionId,
                lang,
                items: createCanonicalCardOrder(validDraft),
            });
            setOrderDraft(null);
        } catch (error) {
            setOrderDraft(null);
            setOrderError(error instanceof Error ? error.message : "Failed to save Card order.");
        }
    };

    if (isLoading) return <AdminLoading />;
    if (isError) return <AdminCardEmptyState />;

    const sectionsHref = `/admin/pages/${identifier}/sections?lang=${lang}`;
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Cards</h1>
                    <p className="text-sm text-muted-foreground">{sectionKey} · {cardCount} total</p>
                </div>
                <Link href={sectionsHref} className={buttonVariants({ size: "sm", variant: "outline" })}>
                    Back to Sections
                </Link>
            </div>
            <AdminCardToolbar
                search={search}
                publishState={publishState}
                language={language}
                media={media}
                onSearchChange={(value) => {
                    setSearch(value);
                    setOrderDraft(null);
                    setOrderError(null);
                }}
                onPublishStateChange={(value) => {
                    setPublishState(value);
                    setOrderDraft(null);
                    setOrderError(null);
                }}
                onLanguageChange={(value) => {
                    setLanguage(value);
                    setOrderDraft(null);
                    setOrderError(null);
                }}
                onMediaChange={(value) => {
                    setMedia(value);
                    setOrderDraft(null);
                    setOrderError(null);
                }}
            />
            {canReorder && items.length > 1 ? (
                <AdminCardOrderEditor
                    items={orderedItems}
                    disabled={reorderDisabled}
                    saving={isReordering}
                    dirty={orderDirty}
                    errorMessage={orderError ?? reorderError}
                    onMove={(id, direction) => setOrderDraft({
                        source: canonicalIds,
                        items: moveCard(orderedItems, id, direction),
                    })}
                    onSave={() => void handleSaveOrder()}
                    onReset={() => setOrderDraft(null)}
                />
            ) : null}
            {filtered.length === 0 ? (
                <AdminCardEmptyState />
            ) : (
                <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                    {filtered.map((card) => (
                        <AdminCardItem
                            key={card.id}
                            card={card}
                            href={`/admin/pages/${identifier}/sections/${sectionId}/cards/${card.id}?lang=${lang}`}
                        />
                    ))}
                </div>
            )}
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
        </div>
    );
}
