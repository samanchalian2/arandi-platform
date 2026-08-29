import type { Metadata } from "next";

import { contentProvider, type Language } from "@/content";

type SearchParams = Promise<{ lang?: string }> | { lang?: string };

export type LocalizedText = {
    en: string;
    fa: string;
};

const DEFAULT_SITE_ORIGIN = "https://arandi.ir";

export function getSiteOrigin(
    value = process.env.ARANDI_SITE_URL?.trim() || DEFAULT_SITE_ORIGIN,
): string {
    const url = new URL(value);
    if (
        (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:"))
        || url.username
        || url.password
        || url.pathname !== "/"
        || url.search
        || url.hash
    ) {
        throw new Error("ARANDI_SITE_URL must be a bare HTTPS origin.");
    }
    return url.origin;
}

export function buildLocalizedMetadata({
    path,
    lang,
    title,
    description,
    keywords,
    robots,
}: {
    path: string;
    lang: Language;
    title: string;
    description?: string;
    keywords?: string[];
    robots?: Metadata["robots"];
}): Metadata {
    if (!/^\/(?:[a-z0-9][a-z0-9/-]*)?$/.test(path)) {
        throw new Error("Metadata path is invalid.");
    }
    const localized = (language: Language) => `${path || "/"}?lang=${language}`;
    return {
        title,
        description,
        keywords,
        robots,
        alternates: {
            canonical: localized(lang),
            languages: {
                "en": localized("en"),
                "fa": localized("fa"),
                "x-default": localized("fa"),
            },
        },
        openGraph: {
            type: "website",
            url: localized(lang),
            locale: lang === "fa" ? "fa_IR" : "en_US",
            alternateLocale: lang === "fa" ? ["en_US"] : ["fa_IR"],
            title,
            description,
            siteName: "Arandi Bonyan",
        },
    };
}

type EnterprisePageMetadataInput = {
    searchParams?: SearchParams;
    title?: LocalizedText;
    description?: LocalizedText;
    getLocalizedMetadata?: (lang: Language) => { title: string; description: string };
};

export async function resolveLanguage(searchParams?: SearchParams): Promise<Language> {
    const params = await Promise.resolve(searchParams);
    return params?.lang === "en" ? "en" : "fa";
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

    return buildLocalizedMetadata({
        path: "/",
        lang,
        title: `${pageTitle} | ${siteMetadata.title}`,
        description: pageDescription,
        keywords: [...siteMetadata.keywords, pageTitle],
    });
}
