import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicCollectionDetailView } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { getPublicCollectionDetail } from "@/lib/public-content";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ lang?: string }> | { lang?: string } };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [{ slug }, lang] = await Promise.all([params, resolveLanguage(searchParams)]);
    const detail = await getPublicCollectionDetail("industries", slug, lang).catch(() => null);
    return detail
        ? buildLocalizedMetadata({ path: `/industries/${slug}`, lang, title: detail.title, description: detail.summary })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function IndustryDetailPage({ params, searchParams }: Props) {
    const [{ slug }, lang] = await Promise.all([params, resolveLanguage(searchParams)]);
    const detail = await getPublicCollectionDetail("industries", slug, lang).catch(() => notFound());
    return <PublicCollectionDetailView detail={detail} lang={lang} />;
}
