import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicCollectionDetailView } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { getPublicCollectionDetail } from "@/lib/public-content";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ lang?: string }> | { lang?: string } };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [{ slug }, lang] = await Promise.all([params, resolveLanguage(searchParams)]);
    const detail = await getPublicCollectionDetail("projects", slug, lang).catch(() => null);
    return detail
        ? buildLocalizedMetadata({ path: `/projects/${slug}`, lang, title: detail.title, description: detail.summary })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
    const [{ slug }, lang] = await Promise.all([params, resolveLanguage(searchParams)]);
    const detail = await getPublicCollectionDetail("projects", slug, lang).catch(() => notFound());
    return <PublicCollectionDetailView detail={detail} lang={lang} />;
}
