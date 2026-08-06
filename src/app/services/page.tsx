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
    const page = await getPublicEnterprisePage("services", lang).catch(() => null);
    return page
        ? buildLocalizedMetadata({ path: "/services", lang, title: page.metadata.title, description: page.metadata.description })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function ServicesPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const servicesPageContent = await getPublicEnterprisePage("services", lang).catch(() => notFound());

    return (
        <EnterprisePage
            lang={lang}
            contentSource="prisma"
            breadcrumbLabel={servicesPageContent.breadcrumbLabel}
            hero={{
                badge: servicesPageContent.hero.badge,
                title: servicesPageContent.hero.title,
                description: servicesPageContent.hero.description,
                primaryAction: { label: servicesPageContent.hero.primaryAction, href: `/solutions?lang=${lang}` },
                secondaryAction: { label: servicesPageContent.hero.secondaryAction, href: `/contact?lang=${lang}` },
            }}
            sections={[
                {
                    key: "services-list",
                    eyebrow: servicesPageContent.section.eyebrow,
                    title: servicesPageContent.section.title,
                    description: servicesPageContent.section.description,
                    content: (
                        <PageGrid columns={3}>
                            {servicesPageContent.cards.map((service) => (
                                <article key={service.id} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{service.label}</p>
                                    <h3 className="mt-4 text-xl font-semibold text-foreground">{service.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{service.summary}</p>
                                    <Link className="mt-5 inline-flex font-semibold text-primary hover:underline" href={`/services/${service.id}?lang=${lang}`}>
                                        {lang === "fa" ? "جزئیات خدمت" : "Service details"}
                                    </Link>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
            ]}
            cta={{
                eyebrow: servicesPageContent.cta.eyebrow,
                title: servicesPageContent.cta.title,
                description: servicesPageContent.cta.description,
                primaryAction: { label: servicesPageContent.cta.action, href: `/contact?lang=${lang}` },
            }}
        />
    );
}
