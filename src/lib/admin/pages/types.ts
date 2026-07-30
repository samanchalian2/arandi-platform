export type ApiEnvelope<T> = {
    ok: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
};

export type CmsPageTranslation = {
    languageCode: string;
    title: string;
    seoTitle: string;
    seoDescription: string;
};

export type CmsPage = {
    id: string;
    slug: string;
    route: string;
    pageType: string;
    status: string;
    metadata: {
        seoTitle: string;
        seoDescription: string;
        seoKeywords: string[];
    };
    translation: CmsPageTranslation | null;
    translations?: CmsPageTranslation[];
    settings?: {
        themeSlug: string;
        navigationVisible: boolean;
        pageOrder: number;
    };
    createdAt: string;
    updatedAt: string;
};

export type CmsSection = {
    id: string;
    pageId: string;
    key: string;
    type: string;
    order: number;
};

export type CmsTheme = {
    id: string;
    slug: string;
    name: string;
    isDefault: boolean;
};

export type PageListItem = {
    id: string;
    title: string;
    identifier: string;
    status: string;
    languages: string[];
    updatedAt: string;
    theme: string;
    sectionsCount: number;
    route: string;
};

export type PageSortField = "title" | "identifier" | "status" | "updatedAt" | "sectionsCount";

export type LanguageFilter = "all" | "en" | "fa" | "bilingual";

export type UsePagesOptions = {
    lang: "en" | "fa";
    search: string;
    status: "all" | "published" | "draft";
    language: LanguageFilter;
    sortBy: PageSortField;
    sortDirection: "asc" | "desc";
    page: number;
    pageSize: number;
};

export type UsePagesResult = {
    items: PageListItem[];
    total: number;
    totalPages: number;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    refetch: () => Promise<void>;
};

export type PageDetailsData = {
    page: CmsPage;
    theme: CmsTheme | null;
    sections: CmsSection[];
};

export type EditableTranslation = {
    title: string;
    seoTitle: string;
    seoDescription: string;
};

export type UpdatePagePayload = {
    id: string;
    lang: "en" | "fa";
    slug: string;
    status: string;
    themeSlug: string;
    navigationVisible: boolean;
    pageOrder: number;
    seoKeywords: string[];
    translations: {
        en: EditableTranslation;
        fa: EditableTranslation;
    };
};
