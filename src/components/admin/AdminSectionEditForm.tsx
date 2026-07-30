import { AdminFormSection } from "./AdminFormSection";
import { AdminSaveBar } from "./AdminSaveBar";
import { AdminSelect } from "./AdminSelect";
import { AdminSwitch } from "./AdminSwitch";
import { AdminTabs } from "./AdminTabs";
import { AdminTextField } from "./AdminTextField";
import { AdminTextarea } from "./AdminTextarea";
import { AdminValidationMessage } from "./AdminValidationMessage";

type SectionTranslationDraft = {
    title: string;
    subtitle: string;
    description: string;
};

type SectionEditDraft = {
    key: string;
    type: string;
    order: string;
    enabled: boolean;
    translations: {
        en: SectionTranslationDraft;
        fa: SectionTranslationDraft;
    };
};

type AdminSectionEditFormProps = {
    draft: SectionEditDraft;
    activeLang: "en" | "fa";
    onLangChange: (lang: "en" | "fa") => void;
    onChange: (draft: SectionEditDraft) => void;
    dirty: boolean;
    saving: boolean;
    canEditStructure: boolean;
    canEditTranslations: boolean;
    fieldErrors: Record<string, string>;
    errorMessage: string | null;
    onSave: () => void;
    onCancel: () => void;
};

const sectionTypeOptions = [
    { value: "hero", label: "Hero" },
    { value: "features", label: "Features" },
    { value: "text", label: "Text" },
    { value: "cards", label: "Cards" },
    { value: "gallery", label: "Gallery" },
    { value: "cta", label: "CTA" },
    { value: "contact", label: "Contact" },
    { value: "custom", label: "Custom" },
];

export function AdminSectionEditForm({
    draft,
    activeLang,
    onLangChange,
    onChange,
    dirty,
    saving,
    canEditStructure,
    canEditTranslations,
    fieldErrors,
    errorMessage,
    onSave,
    onCancel,
}: AdminSectionEditFormProps) {
    const currentTranslation = draft.translations[activeLang];

    return (
        <AdminFormSection title="Edit Section" description="Update section settings and translations.">
            <AdminTabs
                value={activeLang}
                onChange={(value) => onLangChange(value as "en" | "fa")}
                items={[
                    { key: "en", label: "EN" },
                    { key: "fa", label: "FA" },
                ]}
            />

            <div className="grid gap-3 sm:grid-cols-2">
                <AdminTextField
                    label="Section Key"
                    value={draft.key}
                    onChange={(value) => onChange({ ...draft, key: value })}
                    maxLength={120}
                    error={fieldErrors.key}
                    disabled={!canEditStructure || saving}
                />
                <AdminSelect
                    label="Section Type"
                    value={draft.type}
                    onChange={(value) => onChange({ ...draft, type: value })}
                    options={sectionTypeOptions}
                    error={fieldErrors.type}
                    disabled={!canEditStructure || saving}
                />
                <AdminTextField
                    label="Order"
                    value={draft.order}
                    onChange={(value) => onChange({ ...draft, order: value })}
                    error={fieldErrors.order}
                    disabled={!canEditStructure || saving}
                />
            </div>

            <AdminSwitch
                label="Enabled"
                checked={draft.enabled}
                onChange={(checked) => onChange({ ...draft, enabled: checked })}
                disabled={!canEditStructure || saving}
            />

            <AdminTextField
                label="Title"
                value={currentTranslation.title}
                onChange={(value) =>
                    onChange({
                        ...draft,
                        translations: {
                            ...draft.translations,
                            [activeLang]: {
                                ...draft.translations[activeLang],
                                title: value,
                            },
                        },
                    })
                }
                maxLength={120}
                error={fieldErrors[`${activeLang}.title`]}
                disabled={!canEditTranslations || saving}
            />

            <AdminTextField
                label="Subtitle"
                value={currentTranslation.subtitle}
                onChange={(value) =>
                    onChange({
                        ...draft,
                        translations: {
                            ...draft.translations,
                            [activeLang]: {
                                ...draft.translations[activeLang],
                                subtitle: value,
                            },
                        },
                    })
                }
                maxLength={160}
                error={fieldErrors[`${activeLang}.subtitle`]}
                disabled={!canEditTranslations || saving}
            />

            <AdminTextarea
                label="Description"
                value={currentTranslation.description}
                onChange={(value) =>
                    onChange({
                        ...draft,
                        translations: {
                            ...draft.translations,
                            [activeLang]: {
                                ...draft.translations[activeLang],
                                description: value,
                            },
                        },
                    })
                }
                maxLength={4000}
                error={fieldErrors[`${activeLang}.description`]}
                disabled={!canEditTranslations || saving}
            />

            <AdminValidationMessage message={errorMessage ?? undefined} />
            <AdminSaveBar dirty={dirty} saving={saving} onSave={onSave} onCancel={onCancel} />
        </AdminFormSection>
    );
}
