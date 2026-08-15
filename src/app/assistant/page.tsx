import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatPageClient } from "@/components/ai/ChatPageClient";
import { resolveLanguage } from "@/lib/pageMetadata";
import { getPublicHomepageContent } from "@/lib/public-content";

type PageProps = {
    searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    return {
        title: lang === "fa" ? "دستیار آرندی" : "Arandi Assistant",
        robots: { index: false, follow: true },
    };
}

export default async function AssistantPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const content = await getPublicHomepageContent(lang).catch(() => notFound());

    return <ChatPageClient content={content.chat.content} lang={lang} />;
}
