"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
    CmsApiError,
    getCardCapabilities,
    parseCardJsonObject,
    useCard,
    useCardMutation,
    type CardAdminRole,
    type CardDetails,
    type CardTranslation,
    type UpdateCardPayload,
} from "@/lib/admin/cards";

import { AdminCardEditForm, type CardEditDraft } from "./AdminCardEditForm";
import { AdminCardTypeBadge } from "./AdminCardTypeBadge";
import { AdminDeleteConfirmDialog } from "./AdminDeleteConfirmDialog";
import { AdminDescriptionList } from "./AdminDescriptionList";
import { AdminEmptyState } from "./AdminEmptyState";
import { AdminFormSection } from "./AdminFormSection";
import { AdminLanguageBadge } from "./AdminLanguageBadge";
import { AdminLoading } from "./AdminLoading";
import { AdminStatusBadge } from "./AdminStatusBadge";

type AdminCardDetailsProps = {
    identifier: string;
    sectionId: string;
    id: string;
    currentRole: CardAdminRole;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createDraft(card: CardDetails): CardEditDraft {
    return {
        key: card.key,
        variant: card.variant,
        publishState: card.publishState,
        order: String(card.order),
        mediaId: card.media?.id ?? "",
        tags: card.tags.join(", "),
        metrics: JSON.stringify(card.metrics, null, 2),
        payload: JSON.stringify(card.payload, null, 2),
        translations: {
            en: { ...card.translations.en },
            fa: { ...card.translations.fa },
        },
    };
}

function changedTranslation(
    current: CardTranslation,
    baseline: CardTranslation,
): boolean {
    return JSON.stringify(current) !== JSON.stringify(baseline);
}

export function validateCardDraft(
    draft: CardEditDraft,
    baseline: CardEditDraft,
    canEditStructure: boolean,
): { errors: Record<string, string>; metrics?: Record<string, unknown>; payload?: Record<string, unknown> } {
    const errors: Record<string, string> = {};
    let metrics: Record<string, unknown> | undefined;
    let payload: Record<string, unknown> | undefined;

    if (canEditStructure) {
        if (!draft.key.trim()) errors.key = "Key is required.";
        if (!draft.variant.trim()) errors.variant = "Variant is required.";
        if (!/^\d+$/.test(draft.order)) errors.order = "Order must be a non-negative integer.";
        if (draft.mediaId && !UUID_PATTERN.test(draft.mediaId.trim())) errors.mediaId = "Media must be a valid UUID.";

        const tags = draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
        if (tags.some((tag) => tag.length > 80)) errors.tags = "Tags must be at most 80 characters.";
        if (new Set(tags).size !== tags.length) errors.tags = "Duplicate tags are not allowed.";

        try {
            metrics = parseCardJsonObject(draft.metrics, "Metrics");
        } catch (error) {
            errors.metrics = error instanceof Error ? error.message : "Metrics JSON is invalid.";
        }
        try {
            payload = parseCardJsonObject(draft.payload, "Payload");
        } catch (error) {
            errors.payload = error instanceof Error ? error.message : "Payload JSON is invalid.";
        }
    }

    (["en", "fa"] as const).forEach((lang) => {
        if (!changedTranslation(draft.translations[lang], baseline.translations[lang])) return;
        const translation = draft.translations[lang];
        if (!translation.title.trim()) errors[`${lang}.title`] = "Title is required.";
        if (translation.title.length > 120) errors[`${lang}.title`] = "Title must be at most 120 characters.";
        if (translation.subtitle.length > 160) errors[`${lang}.subtitle`] = "Subtitle must be at most 160 characters.";
        if (translation.description.length > 4000) errors[`${lang}.description`] = "Description must be at most 4000 characters.";
        if (translation.statusBadge.length > 120) errors[`${lang}.statusBadge`] = "Status badge must be at most 120 characters.";
        if (translation.ctaLabel.length > 160) errors[`${lang}.ctaLabel`] = "CTA label must be at most 160 characters.";
        if (translation.ctaHref.length > 2048) errors[`${lang}.ctaHref`] = "CTA href must be at most 2048 characters.";
    });

    return { errors, metrics, payload };
}

export function AdminCardDetails({ identifier, sectionId, id, currentRole }: AdminCardDetailsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";
    const { card, isLoading, isError, errorMessage, refetch } = useCard(id, lang);
    const { updateCard, deleteCard, isUpdating, isDeleting, updateError, deleteError } = useCardMutation();
    const capabilities = getCardCapabilities(currentRole);

    const [editing, setEditing] = useState(false);
    const [activeLang, setActiveLang] = useState<"en" | "fa">("en");
    const [draft, setDraft] = useState<CardEditDraft | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [clientError, setClientError] = useState<string | null>(null);
    const [stale, setStale] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const baseline = useMemo(() => (card ? createDraft(card) : null), [card]);
    const dirty = Boolean(draft && baseline && JSON.stringify(draft) !== JSON.stringify(baseline));
    const listHref = `/admin/pages/${identifier}/sections/${sectionId}/cards?lang=${lang}`;

    useEffect(() => {
        if (!editing || !dirty) return;
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty, editing]);

    if (isLoading) return <AdminLoading />;
    if (isError || !card || card.sectionId !== sectionId) {
        return <AdminEmptyState title="Unable to load Card" description={errorMessage ?? "Card does not belong to this Section."} />;
    }

    const confirmDiscard = () => !dirty || window.confirm("Discard unsaved Card changes?");
    const handleBack = () => {
        if (confirmDiscard()) router.push(listHref);
    };
    const toggleEdit = () => {
        if (editing) {
            if (!confirmDiscard()) return;
            setEditing(false);
            setDraft(null);
            setErrors({});
            setClientError(null);
            setStale(false);
        } else if (capabilities.canEditTranslations && baseline) {
            setDraft(baseline);
            setEditing(true);
        }
    };

    const handleSave = async () => {
        if (!draft || !baseline) return;
        const validation = validateCardDraft(draft, baseline, capabilities.canEditStructure);
        setErrors(validation.errors);
        setClientError(null);
        setStale(false);
        if (Object.keys(validation.errors).length > 0) {
            setClientError("Fix the validation errors before saving.");
            return;
        }

        const translations: UpdateCardPayload["translations"] = {};
        (["en", "fa"] as const).forEach((languageCode) => {
            if (changedTranslation(draft.translations[languageCode], baseline.translations[languageCode])) {
                translations[languageCode] = {
                    ...draft.translations[languageCode],
                    title: draft.translations[languageCode].title.trim(),
                };
            }
        });

        const payload: UpdateCardPayload = {
            id: card.id,
            sectionId,
            lang,
            expectedUpdatedAt: card.updatedAt,
            translations: Object.keys(translations).length > 0 ? translations : undefined,
        };
        if (capabilities.canEditStructure) {
            payload.key = draft.key.trim();
            payload.variant = draft.variant.trim();
            payload.order = Number.parseInt(draft.order, 10);
            payload.publishState = draft.publishState;
            payload.mediaId = draft.mediaId.trim() || null;
            payload.tags = draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
            payload.metrics = validation.metrics;
            payload.payload = validation.payload;
        }

        try {
            await updateCard(payload);
            setEditing(false);
            setDraft(null);
        } catch (error) {
            if (error instanceof CmsApiError && error.code === "CONFLICT") {
                setStale(true);
            }
            setClientError(error instanceof Error ? error.message : "Failed to save Card.");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCard({ id: card.id, sectionId, lang });
            router.push(listHref);
            router.refresh();
        } catch {
            setDeleteOpen(false);
        }
    };

    const reloadAfterConflict = async () => {
        await refetch();
        setEditing(false);
        setDraft(null);
        setErrors({});
        setClientError(null);
        setStale(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <button type="button" className={buttonVariants({ size: "sm", variant: "outline" })} onClick={handleBack}>
                    Back to Cards
                </button>
                <div className="flex gap-2">
                    {capabilities.canDelete ? (
                        <button type="button" className={buttonVariants({ size: "sm", variant: "destructive" })} onClick={() => setDeleteOpen(true)}>
                            Delete
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className={buttonVariants({ size: "sm", variant: editing ? "outline" : "default" })}
                        onClick={toggleEdit}
                        disabled={!capabilities.canEditTranslations}
                    >
                        {editing ? "Back to Read-only" : "Edit"}
                    </button>
                </div>
            </div>

            {stale ? (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
                    <p className="font-semibold text-destructive">This Card changed after you loaded it.</p>
                    <p className="text-sm text-muted-foreground">Reload the latest version before applying your changes again.</p>
                    <button
                        type="button"
                        className={buttonVariants({ size: "sm", variant: "outline", className: "mt-3" })}
                        onClick={() => void reloadAfterConflict()}
                    >
                        Reload Card
                    </button>
                </div>
            ) : null}

            {editing && draft ? (
                <AdminCardEditForm
                    draft={draft}
                    activeLang={activeLang}
                    role={currentRole}
                    dirty={dirty}
                    saving={isUpdating}
                    errors={errors}
                    errorMessage={clientError ?? (updateError instanceof Error ? updateError.message : null)}
                    onLangChange={setActiveLang}
                    onChange={setDraft}
                    onSave={() => void handleSave()}
                    onCancel={toggleEdit}
                />
            ) : null}

            <AdminFormSection title={card.title} description="Read-only Card snapshot.">
                <AdminDescriptionList
                    items={[
                        { term: "Key", description: card.key },
                        { term: "Variant", description: <AdminCardTypeBadge variant={card.variant} /> },
                        { term: "Publish state", description: <AdminStatusBadge status={card.publishState} /> },
                        { term: "Order", description: card.order },
                        { term: "Languages", description: <AdminLanguageBadge languages={card.languages} /> },
                        { term: "Media", description: card.media ? `${card.media.type}: ${card.media.url}` : "None" },
                        { term: "Updated", description: new Date(card.updatedAt).toLocaleString() },
                    ]}
                />
            </AdminFormSection>

            <AdminDeleteConfirmDialog
                open={deleteOpen}
                title="Delete Card"
                description="This permanently removes the Card and its translations."
                deleting={isDeleting}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={() => void handleDelete()}
            />
            {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
        </div>
    );
}
