import {
    CARD_PUBLISH_STATES,
    type CardAdminRole,
    type CardTranslation,
} from "@/lib/admin/cards";
import { useMedia } from "@/lib/admin/media";

import { AdminFormSection } from "./AdminFormSection";
import { AdminSaveBar } from "./AdminSaveBar";
import { AdminSelect } from "./AdminSelect";
import { AdminTabs } from "./AdminTabs";
import { AdminTextField } from "./AdminTextField";
import { AdminTextarea } from "./AdminTextarea";

export type CardEditDraft = {
    key: string;
    variant: string;
    publishState: string;
    order: string;
    mediaId: string;
    tags: string;
    metrics: string;
    payload: string;
    translations: Record<"en" | "fa", CardTranslation>;
};

type AdminCardEditFormProps = {
    draft: CardEditDraft;
    activeLang: "en" | "fa";
    role: CardAdminRole;
    dirty: boolean;
    saving: boolean;
    errors: Record<string, string>;
    errorMessage: string | null;
    onLangChange: (lang: "en" | "fa") => void;
    onChange: (draft: CardEditDraft) => void;
    onSave: () => void;
    onCancel: () => void;
};

export function AdminCardEditForm({
    draft,
    activeLang,
    role,
    dirty,
    saving,
    errors,
    errorMessage,
    onLangChange,
    onChange,
    onSave,
    onCancel,
}: AdminCardEditFormProps) {
    const structural = role === "SuperAdmin" || role === "Admin" || role === "Editor";
    const media = useMedia({ search: "", type: "image", sortBy: "updatedAt", sortDirection: "desc", page: 1, pageSize: 100 });
    const translation = draft.translations[activeLang];
    const mediaOptions = [
        { value: "", label: "No image attached" },
        ...media.items.map((item) => ({ value: item.id, label: item.alt ? `${item.title} — ${item.alt}` : item.title })),
    ];
    if (draft.mediaId && !mediaOptions.some((item) => item.value === draft.mediaId)) {
        mediaOptions.push({ value: draft.mediaId, label: `Current image (${draft.mediaId})` });
    }
    const setTranslation = (key: keyof CardTranslation, value: string) => {
        onChange({
            ...draft,
            translations: {
                ...draft.translations,
                [activeLang]: { ...translation, [key]: value },
            },
        });
    };

    return (
        <div className="space-y-4">
            {structural ? (
                <>
                    <AdminFormSection title="Card structure" description="Fields that control placement and rendering metadata.">
                        <div className="grid gap-3 md:grid-cols-2">
                            <AdminTextField
                                label="Key"
                                value={draft.key}
                                onChange={(key) => onChange({ ...draft, key })}
                                error={errors.key}
                                maxLength={120}
                            />
                            <AdminTextField
                                label="Variant"
                                value={draft.variant}
                                onChange={(variant) => onChange({ ...draft, variant })}
                                error={errors.variant}
                                maxLength={120}
                            />
                            <AdminSelect
                                label="Publish state"
                                value={draft.publishState}
                                onChange={(publishState) => onChange({ ...draft, publishState })}
                                options={CARD_PUBLISH_STATES.map((value) => ({ value, label: value.replace("_", " ") }))}
                                error={errors.publishState}
                            />
                            <AdminTextField
                                label="Order"
                                value={draft.order}
                                onChange={(order) => onChange({ ...draft, order })}
                                error={errors.order}
                            />
                            <AdminSelect
                                label="Card image"
                                value={draft.mediaId}
                                onChange={(mediaId) => onChange({ ...draft, mediaId })}
                                options={mediaOptions}
                                error={errors.mediaId}
                            />
                            <AdminTextField
                                label="Tags"
                                value={draft.tags}
                                onChange={(tags) => onChange({ ...draft, tags })}
                                placeholder="Comma-separated"
                                error={errors.tags}
                            />
                        </div>
                    </AdminFormSection>
                    <AdminFormSection title="JSON data" description="Objects are preserved as JSON and validated before save.">
                        <AdminTextarea
                            label="Metrics"
                            value={draft.metrics}
                            onChange={(metrics) => onChange({ ...draft, metrics })}
                            rows={8}
                            error={errors.metrics}
                        />
                        <AdminTextarea
                            label="Payload"
                            value={draft.payload}
                            onChange={(payload) => onChange({ ...draft, payload })}
                            rows={10}
                            error={errors.payload}
                        />
                    </AdminFormSection>
                </>
            ) : null}
            <AdminFormSection title="Translations" description={structural ? "Edit one or both languages independently." : "Translator access is limited to these fields."}>
                <AdminTabs
                    value={activeLang}
                    onChange={(value) => onLangChange(value === "fa" ? "fa" : "en")}
                    items={[
                        { key: "en", label: "English" },
                        { key: "fa", label: "فارسی" },
                    ]}
                />
                <div className="grid gap-3 md:grid-cols-2">
                    <AdminTextField
                        label={`${activeLang.toUpperCase()} title`}
                        value={translation.title}
                        onChange={(value) => setTranslation("title", value)}
                        error={errors[`${activeLang}.title`]}
                        maxLength={120}
                    />
                    <AdminTextField
                        label="Subtitle"
                        value={translation.subtitle}
                        onChange={(value) => setTranslation("subtitle", value)}
                        error={errors[`${activeLang}.subtitle`]}
                        maxLength={160}
                    />
                    <AdminTextField
                        label="Status badge"
                        value={translation.statusBadge}
                        onChange={(value) => setTranslation("statusBadge", value)}
                        error={errors[`${activeLang}.statusBadge`]}
                        maxLength={120}
                    />
                    <AdminTextField
                        label="CTA label"
                        value={translation.ctaLabel}
                        onChange={(value) => setTranslation("ctaLabel", value)}
                        error={errors[`${activeLang}.ctaLabel`]}
                        maxLength={160}
                    />
                    <AdminTextField
                        label="CTA href"
                        value={translation.ctaHref}
                        onChange={(value) => setTranslation("ctaHref", value)}
                        error={errors[`${activeLang}.ctaHref`]}
                        maxLength={2048}
                    />
                </div>
                <AdminTextarea
                    label="Description"
                    value={translation.description}
                    onChange={(value) => setTranslation("description", value)}
                    error={errors[`${activeLang}.description`]}
                    maxLength={4000}
                    rows={6}
                />
            </AdminFormSection>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            <AdminSaveBar dirty={dirty} saving={saving} onSave={onSave} onCancel={onCancel} />
        </div>
    );
}
