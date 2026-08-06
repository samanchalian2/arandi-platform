import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicDocumentView } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { getPublicDocument } from "@/lib/public-content";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [{ slug }, lang] = await Promise.all([params, resolveLanguage(searchParams)]);
    const document = await getPublicDocument("article", slug, lang).catch(() => null);
    return document
        ? buildLocalizedMetadata({
            path: `/articles/${slug}`,
            lang,
            title: document.metadata.title,
            description: document.metadata.description,
            keywords: document.metadata.keywords,
        })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function ArticlePage({ params, searchParams }: Props) {
    const [{ slug }, lang] = await Promise.all([params, resolveLanguage(searchParams)]);
    const document = await getPublicDocument("article", slug, lang).catch(() => notFound());
    return <PublicDocumentView document={document} lang={lang} />;
}
