import type {
    ApiEnvelope,
    CmsPage,
    CmsSection,
    CmsTheme,
    PageDetailsData,
    PageListItem,
    UpdatePagePayload,
} from "./types";

async function readEnvelope<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        cache: "no-store",
    });

    const envelope = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !envelope.ok || !envelope.data) {
        throw new Error(envelope.error?.message ?? "Failed to load CMS data.");
    }

    return envelope.data;
}

function mapPageListItem(page: CmsPage, sectionsCount: number, themeName: string): PageListItem {
    const languages = (page.translations ?? []).map((item) => item.languageCode);
    const title = page.translation?.title || page.translations?.[0]?.title || page.slug;

    return {
        id: page.id,
        title,
        identifier: page.slug,
        status: page.status,
        languages,
        updatedAt: page.updatedAt,
        theme: themeName,
        sectionsCount,
        route: page.route,
    };
}

export async function fetchPagesList(lang: "en" | "fa"): Promise<PageListItem[]> {
    const pages = await readEnvelope<CmsPage[]>(`/api/cms/pages?lang=${lang}&translations=true`);

    let themeName = "Default";
    try {
        const theme = await readEnvelope<CmsTheme>(`/api/cms/theme`);
        themeName = theme.name;
    } catch {
        themeName = "Unavailable";
    }

    const counts = await Promise.all(
        pages.map(async (page) => {
            try {
                const sections = await readEnvelope<CmsSection[]>(`/api/cms/sections?pageId=${page.id}&lang=${lang}`);
                return [page.id, sections.length] as const;
            } catch {
                return [page.id, 0] as const;
            }
        }),
    );

    const byPageId = new Map<string, number>(counts);

    return pages.map((page) => mapPageListItem(page, byPageId.get(page.id) ?? 0, themeName));
}

export async function fetchPageDetails(identifier: string, lang: "en" | "fa"): Promise<PageDetailsData> {
    const page = await readEnvelope<CmsPage>(`/api/cms/pages/${identifier}?lang=${lang}&translations=true`);

    const [themeResult, sections] = await Promise.all([
        readEnvelope<CmsTheme>(`/api/cms/theme`).catch(() => null),
        readEnvelope<CmsSection[]>(`/api/cms/sections?pageId=${page.id}&lang=${lang}`),
    ]);

    return {
        page,
        theme: themeResult,
        sections,
    };
}

async function assertUniqueSlug(id: string, slug: string): Promise<void> {
    const pages = await readEnvelope<CmsPage[]>(`/api/cms/pages?lang=en&translations=true`);
    const duplicate = pages.find((page) => page.slug === slug && page.id !== id);
    if (duplicate) {
        throw new Error("Slug already exists. Please choose another identifier.");
    }
}

export async function updatePage(payload: UpdatePagePayload): Promise<CmsPage> {
    await assertUniqueSlug(payload.id, payload.slug);

    const data = await readEnvelope<CmsPage>(`/api/cms/pages/${payload.id}?lang=${payload.lang}`, {
        method: "PUT",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            slug: payload.slug,
            status: payload.status,
            seoKeywords: payload.seoKeywords,
            translations: {
                en: payload.translations.en,
                fa: payload.translations.fa,
            },
            settings: {
                themeSlug: payload.themeSlug,
                navigationVisible: payload.navigationVisible,
                pageOrder: payload.pageOrder,
            },
        }),
    });

    return data;
}
