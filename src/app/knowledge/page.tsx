import type { Metadata } from "next";
import Link from "next/link";

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
    return <>
        {lang === "fa" ? <section className="mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8 lg:px-12" aria-labelledby="jupiter-guide-feature-title">
            <div className="rounded-[1.5rem] border border-[#796E89]/25 bg-[linear-gradient(120deg,#f8f7f9,#f0edf3)] p-6 sm:p-8">
                <p className="text-sm font-semibold text-[#61566F]">راهنمای محصول آرندی</p>
                <h2 id="jupiter-guide-feature-title" className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">آموزش راه‌اندازی و استفاده از ژوپیتر</h2>
                <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">مسیرهای جداگانه برای مدیر سازمان، کاربران سازمان و کاربران مستقل؛ همراه با راهنمای گام‌به‌گام و نسخهٔ PDF.</p>
                <Link href="/knowledge/jupiter-guide?lang=fa" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#61566F] px-5 text-sm font-semibold text-white hover:bg-[#4f455d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#61566F]">مشاهدهٔ راهنمای ژوپیتر</Link>
            </div>
        </section> : null}
        <PublicDocumentList type="knowledge" lang={lang} items={await listPublicDocuments("knowledge", lang)} />
    </>;
}
