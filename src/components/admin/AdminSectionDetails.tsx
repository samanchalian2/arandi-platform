"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { useSection, useSectionMutation, type SectionDetails as SectionDetailsType, SECTION_TYPES } from "@/lib/admin/sections";

import { AdminDescriptionList } from "./AdminDescriptionList";
import { AdminEmptyState } from "./AdminEmptyState";
import { AdminFormSection } from "./AdminFormSection";
import { AdminLanguageBadge } from "./AdminLanguageBadge";
import { AdminLoading } from "./AdminLoading";
import { AdminSectionEditForm } from "./AdminSectionEditForm";
import { AdminSectionTypeBadge } from "./AdminSectionTypeBadge";
import { AdminStatusBadge } from "./AdminStatusBadge";
import { AdminTable } from "./AdminTable";
import { AdminDeleteConfirmDialog } from "./AdminDeleteConfirmDialog";

type AdminSectionDetailsProps = {
    identifier: string;
    id: string;
    currentRole: "SuperAdmin" | "Admin" | "Editor" | "Translator" | "Viewer";
};

type SectionDraft = {
    key: string;
    type: string;
    order: string;
    enabled: boolean;
    translations: {
        en: {
            title: string;
            subtitle: string;
            description: string;
        };
        fa: {
            title: string;
            subtitle: string;
            description: string;
        };
    };
};

function createDraft(section: SectionDetailsType): SectionDraft {
    return {
        key: section.key,
        type: section.type,
        order: String(section.order),
        enabled: section.enabled,
        translations: {
            en: {
                title: section.translations.en.title,
                subtitle: section.translations.en.subtitle,
                description: section.translations.en.description,
            },
            fa: {
                title: section.translations.fa.title,
                subtitle: section.translations.fa.subtitle,
                description: section.translations.fa.description,
            },
        },
    };
}

function validateDraft(draft: SectionDraft, canEditStructure: boolean, canEditTranslations: boolean) {
    const errors: Record<string, string> = {};

    if (canEditStructure) {
        if (!draft.key.trim()) {
            errors.key = "Section key is required.";
        } else if (draft.key.length > 120) {
            errors.key = "Section key must be at most 120 characters.";
        }

        if (!draft.type.trim()) {
            errors.type = "Section type is required.";
        } else if (!SECTION_TYPES.includes(draft.type.toLowerCase() as (typeof SECTION_TYPES)[number])) {
            errors.type = "Invalid section type.";
        }

        if (!/^\d+$/.test(draft.order)) {
            errors.order = "Order must be a non-negative integer.";
        }
    }

    if (canEditTranslations) {
        (["en", "fa"] as const).forEach((lang) => {
            const translation = draft.translations[lang];
            if (!translation.title.trim()) {
                errors[`${lang}.title`] = "Title is required.";
            } else if (translation.title.length > 120) {
                errors[`${lang}.title`] = "Title must be at most 120 characters.";
            }

            if (translation.subtitle.length > 160) {
                errors[`${lang}.subtitle`] = "Subtitle must be at most 160 characters.";
            }

            if (translation.description.length > 4000) {
                errors[`${lang}.description`] = "Description must be at most 4000 characters.";
            }
        });
    }

    return errors;
}

export function AdminSectionDetails({ identifier, id, currentRole }: AdminSectionDetailsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";

    const { section, isLoading, isError, errorMessage } = useSection(id, lang);
    const { updateSection, deleteSection, isUpdating, isDeleting, updateError, deleteError } = useSectionMutation();

    const canEditStructure = currentRole === "SuperAdmin" || currentRole === "Admin" || currentRole === "Editor";
    const canEditTranslations = canEditStructure || currentRole === "Translator";
    const canDelete = currentRole === "SuperAdmin" || currentRole === "Admin";

    const [isEditing, setIsEditing] = useState(false);
    const [activeLang, setActiveLang] = useState<"en" | "fa">("en");
    const [draft, setDraft] = useState<SectionDraft | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [clientError, setClientError] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const baseline = useMemo(() => (section ? createDraft(section) : null), [section]);
    const dirty = useMemo(() => {
        if (!draft || !baseline) {
            return false;
        }

        return JSON.stringify(draft) !== JSON.stringify(baseline);
    }, [baseline, draft]);

    useEffect(() => {
        if (!isEditing || !dirty) {
            return;
        }

        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty, isEditing]);

    if (isLoading) {
        return <AdminLoading />;
    }

    if (isError || !section) {
        return <AdminEmptyState title="Unable to load section" description={errorMessage ?? "Unexpected error"} />;
    }

    const backHref = `/admin/pages/${identifier}/sections?lang=${lang}`;

    const toggleEdit = () => {
        if (isEditing) {
            if (dirty && !window.confirm("Discard unsaved changes?")) {
                return;
            }

            setDraft(null);
            setFieldErrors({});
            setClientError(null);
            setIsEditing(false);
            return;
        }

        if (!canEditStructure && !canEditTranslations) {
            return;
        }

        if (baseline) {
            setDraft(baseline);
            setFieldErrors({});
            setClientError(null);
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (!draft) {
            return;
        }

        const errors = validateDraft(draft, canEditStructure, canEditTranslations);
        setFieldErrors(errors);
        setClientError(null);

        if (Object.keys(errors).length > 0) {
            setClientError("Please fix validation errors before saving.");
            return;
        }

        try {
            await updateSection({
                id: section.id,
                pageId: section.pageId,
                lang,
                key: canEditStructure ? draft.key.trim() : undefined,
                type: canEditStructure ? draft.type.trim().toLowerCase() : undefined,
                order: canEditStructure ? Number.parseInt(draft.order, 10) : undefined,
                enabled: canEditStructure ? draft.enabled : undefined,
                translations: canEditTranslations
                    ? {
                        en: {
                            title: draft.translations.en.title.trim(),
                            subtitle: draft.translations.en.subtitle.trim(),
                            description: draft.translations.en.description.trim(),
                        },
                        fa: {
                            title: draft.translations.fa.title.trim(),
                            subtitle: draft.translations.fa.subtitle.trim(),
                            description: draft.translations.fa.description.trim(),
                        },
                    }
                    : undefined,
            });

            setDraft(null);
            setFieldErrors({});
            setClientError(null);
            setIsEditing(false);
        } catch (error) {
            setClientError(error instanceof Error ? error.message : "Failed to save section.");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteSection({
                id: section.id,
                pageId: section.pageId,
                lang,
            });
            router.push(backHref);
            router.refresh();
        } catch {
            setDeleteOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={backHref} className={buttonVariants({ size: "sm", variant: "outline" })}>
                    Back to Sections
                </Link>
                <div className="flex items-center gap-2">
                    {canDelete ? (
                        <button
                            type="button"
                            className={buttonVariants({ size: "sm", variant: "destructive" })}
                            onClick={() => setDeleteOpen(true)}
                        >
                            Delete
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className={buttonVariants({ size: "sm", variant: isEditing ? "outline" : "default" })}
                        onClick={toggleEdit}
                        disabled={!canEditStructure && !canEditTranslations}
                    >
                        {isEditing ? "Back to Read-only" : "Edit"}
                    </button>
                </div>
            </div>

            {isEditing && draft ? (
                <AdminSectionEditForm
                    draft={draft}
                    activeLang={activeLang}
                    onLangChange={setActiveLang}
                    onChange={setDraft}
                    dirty={dirty}
                    saving={isUpdating}
                    canEditStructure={canEditStructure}
                    canEditTranslations={canEditTranslations}
                    fieldErrors={fieldErrors}
                    errorMessage={clientError ?? updateError}
                    onSave={() => void handleSave()}
                    onCancel={toggleEdit}
                />
            ) : null}

            <AdminFormSection title="Section Details" description="Read-only section snapshot.">
                <AdminDescriptionList
                    items={[
                        { term: "Key", description: section.key },
                        { term: "Type", description: <AdminSectionTypeBadge type={section.type} /> },
                        { term: "Order", description: section.order },
                        { term: "Status", description: <AdminStatusBadge status={section.status} /> },
                        { term: "Last Updated", description: new Date(section.updatedAt).toLocaleString() },
                    ]}
                />
            </AdminFormSection>

            <AdminFormSection title="Languages" description="Translation coverage for this section.">
                <AdminLanguageBadge languages={section.languages} />
                <div className="mt-3">
                    <AdminTable
                        columns={[
                            { key: "language", label: "Language" },
                            { key: "title", label: "Title" },
                            { key: "subtitle", label: "Subtitle" },
                        ]}
                        rows={[
                            {
                                language: "EN",
                                title: section.translations.en.title || "N/A",
                                subtitle: section.translations.en.subtitle || "N/A",
                            },
                            {
                                language: "FA",
                                title: section.translations.fa.title || "N/A",
                                subtitle: section.translations.fa.subtitle || "N/A",
                            },
                        ]}
                    />
                </div>
            </AdminFormSection>

            <AdminDeleteConfirmDialog
                open={deleteOpen}
                title="Delete section"
                description="This action permanently removes the section and its translations."
                deleting={isDeleting}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={() => void handleDelete()}
            />

            {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
        </div>
    );
}
