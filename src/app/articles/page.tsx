import type { Metadata } from "next";

import { PublicContentHub } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { listPublicDocuments } from "@/lib/public-content";

type Props = { searchParams?: Promise<{ lang?: string }> | { lang?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    return buildLocalizedMetadata({
        path: "/articles",
        lang,
        title: lang === "fa" ? "مقالات و راهنماها" : "Articles and guides",
        description: lang === "fa" ? "مقالات، دیدگاه‌ها و راهنماهای منتشرشده آرن دی بنیان" : "Published articles, insights, and guides from Arandi Bonyan",
    });
}

export default async function ArticlesPage({ searchParams }: Props) {
    const lang = await resolveLanguage(searchParams);
    const [articles, guides] = await Promise.all([
        listPublicDocuments("article", lang),
        listPublicDocuments("knowledge", lang),
    ]);
    return <PublicContentHub lang={lang} articles={articles} guides={guides} />;
}
