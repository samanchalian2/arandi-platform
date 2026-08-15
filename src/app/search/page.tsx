import type { Metadata } from "next";

import { PublicSearchView } from "@/components/page";
import { resolveLanguage } from "@/lib/pageMetadata";
import { searchPublicContent } from "@/lib/public-content";

type Props = {
    searchParams?: Promise<{ lang?: string; q?: string }> | { lang?: string; q?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    return {
        title: lang === "fa" ? "جست‌وجو" : "Search",
        robots: { index: false, follow: true },
    };
}

export default async function SearchPage({ searchParams }: Props) {
    const resolved = await searchParams;
    const lang = await resolveLanguage(resolved);
    const query = typeof resolved?.q === "string" ? resolved.q.trim().slice(0, 100) : "";
    const results = await searchPublicContent(query, lang);
    return <PublicSearchView lang={lang} query={query} results={results} />;
}
