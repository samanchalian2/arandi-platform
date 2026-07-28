import type { Metadata } from "next";

import { contentProvider, type Language } from "@/content";

type SearchParams = Promise<{ lang?: string }> | { lang?: string };

export type LocalizedText = {
    en: string;
    fa: string;
};

type EnterprisePageMetadataInput = {
    searchParams?: SearchParams;
    title?: LocalizedText;
    description?: LocalizedText;
    getLocalizedMetadata?: (lang: Language) => { title: string; description: string };
};

export async function resolveLanguage(searchParams?: SearchParams): Promise<Language> {
    const params = await Promise.resolve(searchParams);
    return params?.lang === "fa" ? "fa" : "en";
}

export async function buildEnterprisePageMetadata({
    searchParams,
    title,
    description,
    getLocalizedMetadata,
}: EnterprisePageMetadataInput): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    const siteMetadata = contentProvider.getMetadata(lang);
    const localizedMetadata = getLocalizedMetadata?.(lang);
    const pageTitle = localizedMetadata?.title ?? (lang === "fa" ? title?.fa : title?.en) ?? siteMetadata.title;
    const pageDescription = localizedMetadata?.description ?? (lang === "fa" ? description?.fa : description?.en) ?? siteMetadata.description;

    return {
        title: `${pageTitle} | ${siteMetadata.title}`,
        description: pageDescription,
        keywords: [...siteMetadata.keywords, pageTitle],
    };
}