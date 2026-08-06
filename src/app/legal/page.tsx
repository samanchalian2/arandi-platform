import type { Metadata } from "next";

import { PublicDocumentList } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { listPublicDocuments } from "@/lib/public-content";

type Props = { searchParams?: Promise<{ lang?: string }> | { lang?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    return buildLocalizedMetadata({
        path: "/legal",
        lang,
        title: lang === "fa" ? "اطلاعات حقوقی" : "Legal information",
        description: lang === "fa" ? "صفحات و اطلاعیه‌های حقوقی آرن‌دی بنیان" : "Legal pages and notices from Arandi Bonyan",
    });
}

export default async function LegalPage({ searchParams }: Props) {
    const lang = await resolveLanguage(searchParams);
    return <PublicDocumentList type="legal" lang={lang} items={await listPublicDocuments("legal", lang)} />;
}
