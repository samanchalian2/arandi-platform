import type { Metadata } from "next";

import { PublicDocumentList } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { listPublicDocuments } from "@/lib/public-content";

type Props = { searchParams?: Promise<{ lang?: string }> | { lang?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    return buildLocalizedMetadata({
        path: "/knowledge",
        lang,
        title: lang === "fa" ? "دانش‌نامه" : "Knowledge",
        description: lang === "fa" ? "محتوای دانشی تأییدشده آرن‌دی بنیان" : "Approved knowledge from Arandi Bonyan",
    });
}

export default async function KnowledgePage({ searchParams }: Props) {
    const lang = await resolveLanguage(searchParams);
    return <PublicDocumentList type="knowledge" lang={lang} items={await listPublicDocuments("knowledge", lang)} />;
}
