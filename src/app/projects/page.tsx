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
    const page = await getPublicEnterprisePage("projects", lang).catch(() => null);
    return page
        ? buildLocalizedMetadata({ path: "/projects", lang, title: page.metadata.title, description: page.metadata.description })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const projectsPageContent = await getPublicEnterprisePage("projects", lang).catch(() => notFound());

    return (
        <EnterprisePage
            lang={lang}
            contentSource="prisma"
            breadcrumbLabel={projectsPageContent.breadcrumbLabel}
            hero={{
                badge: projectsPageContent.hero.badge,
                title: projectsPageContent.hero.title,
                description: projectsPageContent.hero.description,
                primaryAction: { label: projectsPageContent.hero.primaryAction, href: `/industries?lang=${lang}` },
                secondaryAction: { label: projectsPageContent.hero.secondaryAction, href: `/solutions?lang=${lang}` },
            }}
            sections={[
                {
                    key: "projects-list",
                    eyebrow: projectsPageContent.section.eyebrow,
                    title: projectsPageContent.section.title,
                    description: projectsPageContent.section.description,
                    content: (
                        <PageGrid columns={2}>
                            {projectsPageContent.section.cards.map((project) => (
                                <article key={project.id} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{project.summary}</p>
                                    <p className="mt-6 text-sm font-medium text-primary">{project.impact}</p>
                                    <Link className="mt-5 inline-flex font-semibold text-primary hover:underline" href={`/projects/${project.id}?lang=${lang}`}>
                                        {lang === "fa" ? "جزئیات پروژه" : "Project details"}
                                    </Link>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
            ]}
            cta={{
                eyebrow: projectsPageContent.cta.eyebrow,
                title: projectsPageContent.cta.title,
                description: projectsPageContent.cta.description,
                primaryAction: { label: projectsPageContent.cta.action, href: `/contact?lang=${lang}` },
            }}
        />
    );
}
