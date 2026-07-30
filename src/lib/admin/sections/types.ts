export type ApiEnvelope<T> = {
    ok: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
};

type RawSectionTranslation = {
    languageCode: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    data?: Record<string, unknown>;
};

type RawCmsSection = {
    id: string;
    pageId: string;
    key: string;
    type: string;
    order: number;
    visibility: {
        enabled: boolean;
    };
    translation: RawSectionTranslation | null;
    translations?: RawSectionTranslation[];
    style?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
};

export type SectionType = "hero" | "features" | "text" | "cards" | "gallery" | "cta" | "contact" | "custom";

export const SECTION_TYPES: SectionType[] = ["hero", "features", "text", "cards", "gallery", "cta", "contact", "custom"];

export type SectionListItem = {
    id: string;
    pageId: string;
    key: string;
    type: SectionType | string;
    order: number;
    enabled: boolean;
    status: "enabled" | "disabled";
    languages: string[];
    title: string;
    subtitle: string;
    updatedAt: string;
};

export type SectionTranslationDraft = {
    title: string;
    subtitle: string;
    description: string;
};

export type SectionDetails = SectionListItem & {
    description: string;
    createdAt: string;
    translations: {
        en: SectionTranslationDraft;
        fa: SectionTranslationDraft;
    };
    style: Record<string, unknown>;
    payload: Record<string, unknown>;
};

export type UseSectionsResult = {
    items: SectionListItem[];
    sectionCount: number;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    refetch: () => Promise<void>;
};

export type UseSectionResult = {
    section: SectionDetails | null;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    refetch: () => Promise<void>;
};

export type UpdateSectionPayload = {
    id: string;
    pageId: string;
    lang: "en" | "fa";
    key?: string;
    type?: SectionType | string;
    order?: number;
    enabled?: boolean;
    style?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    translations?: Partial<Record<"en" | "fa", SectionTranslationDraft>>;
};

export type ReorderSectionsPayload = {
    pageId: string;
    lang: "en" | "fa";
    items: Array<{
        id: string;
        order: number;
    }>;
};

export type DeleteSectionPayload = {
    id: string;
    pageId: string;
    lang: "en" | "fa";
};

export type UseSectionMutationResult = {
    updateSection: (payload: UpdateSectionPayload) => Promise<SectionDetails>;
    reorderSections: (payload: ReorderSectionsPayload) => Promise<SectionListItem[]>;
    deleteSection: (payload: DeleteSectionPayload) => Promise<{ id: string; deleted: true }>;
    isUpdating: boolean;
    isReordering: boolean;
    isDeleting: boolean;
    updateError: string | null;
    reorderError: string | null;
    deleteError: string | null;
};

function translationOrEmpty(value: RawSectionTranslation | undefined): SectionTranslationDraft {
    return {
        title: value?.title ?? "",
        subtitle: value?.subtitle ?? "",
        description: value?.description ?? "",
    };
}

export function mapRawSection(section: RawCmsSection): SectionDetails {
    const translations = section.translations ?? [];
    const languages = translations.map((item) => item.languageCode);
    const en = translations.find((item) => item.languageCode === "en");
    const fa = translations.find((item) => item.languageCode === "fa");
    const fallbackTitle = section.translation?.title ?? translations.find((item) => item.title)?.title ?? section.key;
    const fallbackSubtitle = section.translation?.subtitle ?? translations.find((item) => item.subtitle)?.subtitle ?? "";
    const fallbackDescription =
        section.translation?.description ?? translations.find((item) => item.description)?.description ?? "";

    return {
        id: section.id,
        pageId: section.pageId,
        key: section.key,
        type: section.type,
        order: section.order,
        enabled: section.visibility.enabled,
        status: section.visibility.enabled ? "enabled" : "disabled",
        languages,
        title: fallbackTitle,
        subtitle: fallbackSubtitle,
        description: fallbackDescription,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
        translations: {
            en: translationOrEmpty(en),
            fa: translationOrEmpty(fa),
        },
        style: section.style ?? {},
        payload: section.payload ?? {},
    };
}

export type { RawCmsSection };
