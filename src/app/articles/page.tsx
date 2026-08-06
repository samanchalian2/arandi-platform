import type { Metadata } from "next";

import { PublicDocumentList } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { listPublicDocuments } from "@/lib/public-content";

type Props = { searchParams?: Promise<{ lang?: string }> | { lang?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    return buildLocalizedMetadata({
        path: "/articles",
        lang,
        title: lang === "fa" ? "اخبار و مقالات" : "News and articles",
        description: lang === "fa" ? "مقالات و دیدگاه‌های منتشرشده آرن‌دی بنیان" : "Published articles and insights from Arandi Bonyan",
    });
}

export default async function ArticlesPage({ searchParams }: Props) {
    const lang = await resolveLanguage(searchParams);
    return <PublicDocumentList type="article" lang={lang} items={await listPublicDocuments("article", lang)} />;
}
