import type { Metadata } from "next";

import { EnterprisePage, PageGrid } from "@/components/page";
import { getEnterpriseContent } from "@/content";
import { buildEnterprisePageMetadata, resolveLanguage } from "@/lib/pageMetadata";

type PageProps = {
    searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    return buildEnterprisePageMetadata({
        searchParams,
        getLocalizedMetadata: (lang) => {
            const metadata = getEnterpriseContent(lang).pages.industries.metadata;
            return {
                title: metadata.title,
                description: metadata.description,
            };
        },
    });
}

export default async function IndustriesPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const industriesPageContent = getEnterpriseContent(lang).pages.industries;

    return (
        <EnterprisePage
            lang={lang}
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