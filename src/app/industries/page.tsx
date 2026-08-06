import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnterprisePage, PageGrid } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { getPublicEnterprisePage } from "@/lib/public-content";

type PageProps = {
    searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    const page = await getPublicEnterprisePage("industries", lang).catch(() => null);
    return page
        ? buildLocalizedMetadata({ path: "/industries", lang, title: page.metadata.title, description: page.metadata.description })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function IndustriesPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const industriesPageContent = await getPublicEnterprisePage("industries", lang).catch(() => notFound());

    return (
        <EnterprisePage
            lang={lang}
            contentSource="prisma"
            breadcrumbLabel={industriesPageContent.breadcrumbLabel}
            hero={{
                badge: industriesPageContent.hero.badge,
                title: industriesPageContent.hero.title,
                description: industriesPageContent.hero.description,
                primaryAction: { label: industriesPageContent.hero.primaryAction, href: `/solutions?lang=${lang}` },
                secondaryAction: { label: industriesPageContent.hero.secondaryAction, href: `/projects?lang=${lang}` },
            }}
            sections={[
                {
                    key: "industries-list",
                    eyebrow: industriesPageContent.section.eyebrow,
                    title: industriesPageContent.section.title,
                    description: industriesPageContent.section.description,
                    content: (
                        <PageGrid columns={3}>
                            {industriesPageContent.section.cards.map((industry) => (
                                <article key={industry.id} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <h3 className="text-xl font-semibold text-foreground">{industry.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{industry.summary}</p>
                                    <Link className="mt-5 inline-flex font-semibold text-primary hover:underline" href={`/industries/${industry.id}?lang=${lang}`}>
                                        {lang === "fa" ? "جزئیات صنعت" : "Industry details"}
                                    </Link>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
            ]}
            cta={{
                eyebrow: industriesPageContent.cta.eyebrow,
                title: industriesPageContent.cta.title,
                description: industriesPageContent.cta.description,
                primaryAction: { label: industriesPageContent.cta.action, href: `/contact?lang=${lang}` },
            }}
        />
    );
}
