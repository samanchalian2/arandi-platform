"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
    AdminFormSection,
    AdminDescriptionList,
    AdminEmptyState,
    AdminLanguageBadge,
    AdminLoading,
    AdminSaveBar,
    AdminSelect,
    AdminStatusBadge,
    AdminSwitch,
    AdminTable,
    AdminTabs,
    AdminTextField,
    AdminTextarea,
    AdminValidationMessage,
} from "@/components/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePage } from "@/lib/admin/pages";

type TranslationDraft = {
    title: string;
    seoTitle: string;
    seoDescription: string;
};

type PageDraft = {
    slug: string;
    status: string;
    themeSlug: string;
    navigationVisible: boolean;
    pageOrder: string;
    seoKeywords: string;
    translations: {
        en: TranslationDraft;
        fa: TranslationDraft;
    };
};

function createDraftFromData(data: NonNullable<ReturnType<typeof usePage>["data"]>): PageDraft {
    const en = data.page.translations?.find((item) => item.languageCode === "en");
    const fa = data.page.translations?.find((item) => item.languageCode === "fa");

    return {
        slug: data.page.slug,
        status: data.page.status,
        themeSlug: data.page.settings?.themeSlug ?? data.theme?.slug ?? "default",
        navigationVisible: data.page.settings?.navigationVisible ?? true,
        pageOrder: String(data.page.settings?.pageOrder ?? 0),
        seoKeywords: data.page.metadata.seoKeywords.join(", "),
        translations: {
            en: {
                title: en?.title ?? "",
                seoTitle: en?.seoTitle ?? "",
                seoDescription: en?.seoDescription ?? "",
            },
            fa: {
                title: fa?.title ?? "",
                seoTitle: fa?.seoTitle ?? "",
                seoDescription: fa?.seoDescription ?? "",
            },
        },
    };
}

function validateDraft(draft: PageDraft, activeLang: "en" | "fa") {
    const errors: Record<string, string> = {};

    if (!draft.slug.trim()) {
        errors.slug = "Identifier is required.";
    } else if (draft.slug.length > 120) {
        errors.slug = "Identifier must be at most 120 characters.";
    }

    if (!draft.pageOrder.trim()) {
        errors.pageOrder = "Page order is required.";
    } else if (!/^\d+$/.test(draft.pageOrder)) {
        errors.pageOrder = "Page order must be a non-negative integer.";
    }

    const translation = draft.translations[activeLang];

    if (!translation.title.trim()) {
        errors[`${activeLang}.title`] = "Page title is required.";
    } else if (translation.title.length > 120) {
        errors[`${activeLang}.title`] = "Page title must be at most 120 characters.";
    }

    if (!translation.seoTitle.trim()) {
        errors[`${activeLang}.seoTitle`] = "SEO title is required.";
    } else if (translation.seoTitle.length > 160) {
        errors[`${activeLang}.seoTitle`] = "SEO title must be at most 160 characters.";
    }

    if (!translation.seoDescription.trim()) {
        errors[`${activeLang}.seoDescription`] = "SEO description is required.";
    } else if (translation.seoDescription.length > 320) {
        errors[`${activeLang}.seoDescription`] = "SEO description must be at most 320 characters.";
    }

    const keywords = draft.seoKeywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    if (keywords.length > 25) {
        errors.seoKeywords = "At most 25 SEO keywords are allowed.";
    }
    if (keywords.some((item) => item.length > 50)) {
        errors.seoKeywords = "Each SEO keyword must be at most 50 characters.";
    }

    return errors;
}

type AdminPageDetailsProps = {
    identifier: string;
};

export function AdminPageDetails({ identifier }: AdminPageDetailsProps) {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";
    const { data, isLoading, isError, errorMessage, savePage, isSaving, saveError } = usePage(identifier, lang);

    const [isEditing, setIsEditing] = useState(false);
    const [activeLang, setActiveLang] = useState<"en" | "fa">("en");
    const [draft, setDraft] = useState<PageDraft | null>(null);
    const [clientError, setClientError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const baseline = useMemo(() => (data ? createDraftFromData(data) : null), [data]);
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

    if (isError || !data) {
        return <AdminEmptyState title="Unable to load page details" description={errorMessage ?? "Unexpected error"} />;
    }

    const { page, sections, theme } = data;
    const sectionsPreview = sections.slice(0, 3).map((section) => section.type).join(", ");

    const currentTranslation = draft?.translations[activeLang];

    const onSave = async () => {
        setClientError(null);
        if (!draft) {
            return;
        }

        const errors = validateDraft(draft, activeLang);
        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            setClientError("Please fix the validation errors before saving.");
            return;
        }

        try {
            await savePage({
                id: page.id,
                lang,
                slug: draft.slug.trim(),
                status: draft.status,
                themeSlug: draft.themeSlug,
                navigationVisible: draft.navigationVisible,
                pageOrder: Number.parseInt(draft.pageOrder, 10),
                seoKeywords: draft.seoKeywords
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                translations: {
                    en: {
                        title: draft.translations.en.title.trim(),
                        seoTitle: draft.translations.en.seoTitle.trim(),
                        seoDescription: draft.translations.en.seoDescription.trim(),
                    },
                    fa: {
                        title: draft.translations.fa.title.trim(),
                        seoTitle: draft.translations.fa.seoTitle.trim(),
                        seoDescription: draft.translations.fa.seoDescription.trim(),
                    },
                },
            });

            setIsEditing(false);
            setDraft(null);
            setClientError(null);
            setFieldErrors({});
        } catch (error) {
            setClientError(error instanceof Error ? error.message : "Failed to save changes.");
        }
    };

    const onCancel = () => {
        if (dirty && !window.confirm("Discard unsaved changes?")) {
            return;
        }

        setDraft(null);
        setIsEditing(false);
        setClientError(null);
        setFieldErrors({});
    };

    const onToggleEdit = () => {
        if (isEditing) {
            onCancel();
            return;
        }

        if (!baseline) {
            return;
        }

        setDraft(baseline);
        setClientError(null);
        setFieldErrors({});
        setIsEditing(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant={isEditing ? "outline" : "default"} size="sm" onClick={onToggleEdit}>
                    {isEditing ? "Back to Read-only" : "Edit"}
                </Button>
            </div>

            {isEditing && draft && currentTranslation ? (
                <AdminFormSection title="Edit Page" description="Edit mode updates page content without full page reload.">
                    <AdminTabs
                        value={activeLang}
                        onChange={(value) => setActiveLang(value as "en" | "fa")}
                        items={[
                            { key: "en", label: "EN" },
                            { key: "fa", label: "FA" },
                        ]}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AdminTextField
                            label="Slug / Identifier"
                            value={draft.slug}
                            onChange={(value) => setDraft((prev) => (prev ? { ...prev, slug: value } : prev))}
                            maxLength={120}
                            error={fieldErrors.slug}
                            disabled={isSaving}
                        />
                        <AdminSelect
                            label="Status"
                            value={draft.status}
                            onChange={(value) => setDraft((prev) => (prev ? { ...prev, status: value } : prev))}
                            options={[
                                { value: "published", label: "Published" },
                                { value: "draft", label: "Draft" },
                            ]}
                            disabled={isSaving}
                        />
                        <AdminSelect
                            label="Theme"
                            value={draft.themeSlug}
                            onChange={(value) => setDraft((prev) => (prev ? { ...prev, themeSlug: value } : prev))}
                            options={[
                                { value: draft.themeSlug, label: draft.themeSlug },
                                ...(draft.themeSlug !== "default" ? [{ value: "default", label: "default" }] : []),
                            ]}
                            disabled={isSaving}
                        />
                        <AdminTextField
                            label="Page Order"
                            value={draft.pageOrder}
                            onChange={(value) => setDraft((prev) => (prev ? { ...prev, pageOrder: value } : prev))}
                            error={fieldErrors.pageOrder}
                            disabled={isSaving}
                        />
                    </div>

                    <AdminSwitch
                        label="Navigation visibility"
                        checked={draft.navigationVisible}
                        onChange={(checked) => setDraft((prev) => (prev ? { ...prev, navigationVisible: checked } : prev))}
                        disabled={isSaving}
                    />

                    <AdminTextField
                        label="Page Title"
                        value={currentTranslation.title}
                        onChange={(value) =>
                            setDraft((prev) =>
                                prev
                                    ? {
                                        ...prev,
                                        translations: {
                                            ...prev.translations,
                                            [activeLang]: {
                                                ...prev.translations[activeLang],
                                                title: value,
                                            },
                                        },
                                    }
                                    : prev,
                            )
                        }
                        maxLength={120}
                        error={fieldErrors[`${activeLang}.title`]}
                        disabled={isSaving}
                    />

                    <AdminTextField
                        label="SEO Title"
                        value={currentTranslation.seoTitle}
                        onChange={(value) =>
                            setDraft((prev) =>
                                prev
                                    ? {
                                        ...prev,
                                        translations: {
                                            ...prev.translations,
                                            [activeLang]: {
                                                ...prev.translations[activeLang],
                                                seoTitle: value,
                                            },
                                        },
                                    }
                                    : prev,
                            )
                        }
                        maxLength={160}
                        error={fieldErrors[`${activeLang}.seoTitle`]}
                        disabled={isSaving}
                    />

                    <AdminTextarea
                        label="SEO Description"
                        value={currentTranslation.seoDescription}
                        onChange={(value) =>
                            setDraft((prev) =>
                                prev
                                    ? {
                                        ...prev,
                                        translations: {
                                            ...prev.translations,
                                            [activeLang]: {
                                                ...prev.translations[activeLang],
                                                seoDescription: value,
                                            },
                                        },
                                    }
                                    : prev,
                            )
                        }
                        maxLength={320}
                        error={fieldErrors[`${activeLang}.seoDescription`]}
                        disabled={isSaving}
                    />

                    <AdminTextarea
                        label="SEO Keywords (comma separated)"
                        value={draft.seoKeywords}
                        onChange={(value) => setDraft((prev) => (prev ? { ...prev, seoKeywords: value } : prev))}
                        rows={3}
                        error={fieldErrors.seoKeywords}
                        disabled={isSaving}
                    />

                    <AdminValidationMessage message={clientError ?? saveError ?? undefined} />
                    <AdminSaveBar dirty={dirty} saving={isSaving} onSave={() => void onSave()} onCancel={onCancel} />
                </AdminFormSection>
            ) : null}

            <AdminFormSection title="General Information" description="Read-only metadata from CMS API.">
                <AdminDescriptionList
                    items={[
                        { term: "Title", description: page.translation?.title ?? page.slug },
                        { term: "Identifier", description: page.slug },
                        { term: "Route", description: page.route },
                        { term: "Status", description: <AdminStatusBadge status={page.status} /> },
                        { term: "Type", description: page.pageType },
                        { term: "Last Updated", description: new Date(page.updatedAt).toLocaleString() },
                    ]}
                />
            </AdminFormSection>

            <AdminFormSection title="Translations" description="Available languages for this page.">
                <AdminLanguageBadge languages={(page.translations ?? []).map((item) => item.languageCode)} />
                <div className="mt-3">
                    <AdminTable
                        columns={[
                            { key: "languageCode", label: "Language" },
                            { key: "title", label: "Title" },
                            { key: "seoTitle", label: "SEO Title" },
                        ]}
                        rows={(page.translations ?? []).map((translation) => ({
                            languageCode: translation.languageCode.toUpperCase(),
                            title: translation.title,
                            seoTitle: translation.seoTitle,
                        }))}
                    />
                </div>
            </AdminFormSection>

            <AdminFormSection title="Theme" description="Theme assignment based on active CMS theme endpoint.">
                <AdminDescriptionList
                    items={[
                        { term: "Theme Name", description: theme?.name ?? "Unavailable" },
                        { term: "Theme Slug", description: page.settings?.themeSlug ?? theme?.slug ?? "N/A" },
                    ]}
                />
            </AdminFormSection>

            <AdminFormSection title="Sections" description="Sections mapped to this page.">
                <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/10 p-3 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Section Count</p>
                        <p className="text-lg font-semibold">{sections.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Preview</p>
                        <p className="text-sm">{sectionsPreview || "No sections available"}</p>
                    </div>
                    <div className="flex items-end sm:justify-end">
                        <Link
                            href={`/admin/pages/${identifier}/sections?lang=${lang}`}
                            className={buttonVariants({ size: "sm", variant: "outline" })}
                        >
                            Manage Sections
                        </Link>
                    </div>
                </div>

                <AdminTable
                    columns={[
                        { key: "key", label: "Key" },
                        { key: "type", label: "Type" },
                        { key: "order", label: "Order" },
                    ]}
                    rows={sections.map((section) => ({
                        key: section.key,
                        type: section.type,
                        order: section.order,
                    }))}
                />
            </AdminFormSection>

            <AdminFormSection title="SEO" description="Read-only placeholders sourced from current page metadata.">
                <AdminDescriptionList
                    items={[
                        { term: "SEO Title", description: page.metadata.seoTitle || "N/A" },
                        { term: "SEO Description", description: page.metadata.seoDescription || "N/A" },
                        {
                            term: "SEO Keywords",
                            description: page.metadata.seoKeywords.length > 0 ? page.metadata.seoKeywords.join(", ") : "N/A",
                        },
                    ]}
                />
            </AdminFormSection>

            <AdminFormSection title="Navigation Information" description="Derived from current read-only page route data.">
                <AdminDescriptionList
                    items={[
                        { term: "Primary Route", description: page.route },
                        {
                            term: "Navigation Visibility",
                            description: page.settings?.navigationVisible === false ? "Hidden" : "Visible",
                        },
                        {
                            term: "Page Order",
                            description: String(page.settings?.pageOrder ?? 0),
                        },
                        { term: "External", description: "No" },
                    ]}
                />
            </AdminFormSection>
        </div>
    );
}
