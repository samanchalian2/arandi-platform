import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnterprisePage, PageGrid } from "@/components/page";
import { ContactSubmissionForm } from "@/components/contact";
import { buildLocalizedMetadata, resolveLanguage } from "@/lib/pageMetadata";
import { getPublicContactDetails, getPublicFixedPage } from "@/lib/public-content";

type PageProps = {
    searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    const page = await getPublicFixedPage("contact", lang).catch(() => null);
    return page
        ? buildLocalizedMetadata({ path: "/contact", lang, title: page.metadata.title, description: page.metadata.description })
        : { title: "Content unavailable", robots: { index: false, follow: false } };
}

export default async function ContactPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const [contactPageContent, contact] = await Promise.all([
        getPublicFixedPage("contact", lang),
        getPublicContactDetails(lang),
    ]).catch(() => notFound());

    return (
        <EnterprisePage
            lang={lang}
            contentSource="prisma"
            breadcrumbLabel={contactPageContent.breadcrumbLabel}
            hero={{
                badge: contactPageContent.hero.badge,
                title: contactPageContent.hero.title,
                description: contactPageContent.hero.description,
            }}
            sections={[
                {
                    key: "contact-methods",
                    eyebrow: contactPageContent.methods.eyebrow,
                    title: contactPageContent.methods.title,
                    description: contactPageContent.methods.description,
                    content: (
                        <PageGrid columns={3}>
                            {contactPageContent.methods.items.map((method) => (
                                <article key={method.key} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{method.label}</p>
                                    <p className="mt-4 text-base font-medium text-foreground">
                                        {method.key === "email" ? contact.primaryEmail : method.key === "phone" ? contact.primaryPhone : contact.address}
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{method.note}</p>
                                </article>
                            ))}
                        </PageGrid>
                    ),
                },
                {
                    key: "office-information",
                    eyebrow: contactPageContent.office.eyebrow,
                    title: contactPageContent.office.title,
                    content: (
                        <PageGrid columns={2}>
                            <article className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                <h3 className="text-lg font-semibold text-foreground">{contactPageContent.office.businessHoursTitle}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                    {contactPageContent.office.businessHoursValue}
                                </p>
                            </article>
                            <article className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                                <h3 className="text-lg font-semibold text-foreground">{contactPageContent.office.responseTimeTitle}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                    {contactPageContent.office.responseTimeValue}
                                </p>
                            </article>
                        </PageGrid>
                    ),
                },
                {
                    key: "contact-form-layout",
                    eyebrow: contactPageContent.form.eyebrow,
                    title: contactPageContent.form.title,
                    description: contactPageContent.form.description,
                    content: <ContactSubmissionForm lang={lang} content={contactPageContent.form} />,
                },
            ]}
            cta={{
                eyebrow: contactPageContent.cta.eyebrow,
                title: contactPageContent.cta.title,
                description: contactPageContent.cta.description,
                primaryAction: {
                    label: contactPageContent.cta.action,
                    href: `mailto:${contact.primaryEmail}`,
                },
            }}
        />
    );
}
