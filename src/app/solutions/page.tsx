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
    const page = await getPublicEnterprisePage("solutions", lang).catch(() => null);
    return page
        ? buildLocalizedMetadata({ path: "/solutions", lang, title: page.metadata.title, description: page.metadata.description })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function SolutionsPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const solutionsPageContent = await getPublicEnterprisePage("solutions", lang).catch(() => notFound());

    return (
        <EnterprisePage
            lang={lang}
            contentSource="prisma"
            breadcrumbLabel={solutionsPageContent.breadcrumbLabel}
            hero={{
                badge: solutionsPageContent.hero.badge,
                title: solutionsPageContent.hero.title,
                description: solutionsPageContent.hero.description,
                primaryAction: { label: solutionsPageContent.hero.primaryAction, href: `/projects?lang=${lang}` },
                secondaryAction: { label: solutionsPageContent.hero.secondaryAction, href: `/services?lang=${lang}` },
            }}
            sections={[
                {
                    key: "solutions-list",
                    eyebrow: solutionsPageContent.catalog.eyebrow,
                    title: solutionsPageContent.catalog.title,
                    description: solutionsPageContent.catalog.description,
                    content: (
                        <PageGrid columns={2}>
                            {solutionsPageContent.catalog.cards.map((solution) => (
                                <article key={solution.id} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <h3 className="text-xl font-semibold text-foreground">{solution.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{solution.summary}</p>
                                    <p className="mt-6 text-sm font-medium text-primary">{solution.outcome}</p>
                                    <Link className="mt-5 inline-flex font-semibold text-primary hover:underline" href={`/solutions/${solution.id}?lang=${lang}`}>
                                        {lang === "fa" ? "جزئیات راهکار" : "Solution details"}
                                    </Link>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
                {
                    key: "solutions-delivery-model",
                    eyebrow: solutionsPageContent.delivery.eyebrow,
                    title: solutionsPageContent.delivery.title,
                    content: (
                        <PageGrid columns={3}>
                            {solutionsPageContent.delivery.steps.map((item) => (
                                <article key={item.key} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
            ]}
            cta={{
                eyebrow: solutionsPageContent.cta.eyebrow,
                title: solutionsPageContent.cta.title,
                description: solutionsPageContent.cta.description,
                primaryAction: { label: solutionsPageContent.cta.action, href: `/contact?lang=${lang}` },
            }}
        />
    );
}
