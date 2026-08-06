import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnterprisePage, PageGrid } from "@/components/page";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { getPublicFixedPage } from "@/lib/public-content";

type PageProps = {
    searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    const page = await getPublicFixedPage("company", lang).catch(() => null);
    return page
        ? buildLocalizedMetadata({ path: "/company", lang, title: page.metadata.title, description: page.metadata.description })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function CompanyPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const companyPageContent = await getPublicFixedPage("company", lang).catch(() => notFound());

    return (
        <EnterprisePage
            lang={lang}
            contentSource="prisma"
            breadcrumbLabel={companyPageContent.breadcrumbLabel}
            hero={{
                badge: companyPageContent.hero.badge,
                title: companyPageContent.hero.title,
                description: companyPageContent.hero.description,
                primaryAction: { label: companyPageContent.hero.primaryAction, href: `/contact?lang=${lang}` },
                secondaryAction: { label: companyPageContent.hero.secondaryAction, href: `/services?lang=${lang}` },
            }}
            sections={[
                {
                    key: "company-overview",
                    eyebrow: companyPageContent.overview.eyebrow,
                    title: companyPageContent.overview.title,
                    description: companyPageContent.overview.description,
                    content: (
                        <PageGrid columns={3}>
                            {companyPageContent.overview.highlights.map((item) => (
                                <article key={item} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <p className="text-base leading-7 text-muted-foreground">{item}</p>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
                {
                    key: "company-mission-vision",
                    eyebrow: companyPageContent.missionVision.eyebrow,
                    title: companyPageContent.missionVision.title,
                    content: (
                        <PageGrid columns={2}>
                            <article className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                <h3 className="text-xl font-semibold text-foreground">{companyPageContent.missionVision.missionTitle}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                    {companyPageContent.missionVision.missionText}
                                </p>
                            </article>
                            <article className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                <h3 className="text-xl font-semibold text-foreground">{companyPageContent.missionVision.visionTitle}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                    {companyPageContent.missionVision.visionText}
                                </p>
                            </article>
                        </PageGrid>
                    ),
                },
                {
                    key: "company-values",
                    eyebrow: companyPageContent.coreValues.eyebrow,
                    title: companyPageContent.coreValues.title,
                    content: (
                        <PageGrid columns={2}>
                            {companyPageContent.coreValues.values.map((value) => (
                                <article key={value.title} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{value.description}</p>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
                {
                    key: "company-why-arandi",
                    eyebrow: companyPageContent.whyArandi.eyebrow,
                    title: companyPageContent.whyArandi.title,
                    content: (
                        <PageGrid columns={3}>
                            {companyPageContent.whyArandi.points.map((item) => (
                                <article key={item} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <p className="text-base leading-7 text-muted-foreground">{item}</p>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
            ]}
            cta={{
                eyebrow: companyPageContent.cta.eyebrow,
                title: companyPageContent.cta.title,
                description: companyPageContent.cta.description,
                primaryAction: { label: companyPageContent.cta.action, href: `/contact?lang=${lang}` },
            }}
        />
    );
}
