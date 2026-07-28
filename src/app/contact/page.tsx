import type { Metadata } from "next";

import { EnterprisePage, PageGrid } from "@/components/page";
import { contentProvider, getEnterpriseContent } from "@/content";
import { buildEnterprisePageMetadata, resolveLanguage } from "@/lib/pageMetadata";

type PageProps = {
    searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    return buildEnterprisePageMetadata({
        searchParams,
        getLocalizedMetadata: (lang) => {
            const metadata = getEnterpriseContent(lang).pages.contact.metadata;
            return {
                title: metadata.title,
                description: metadata.description,
            };
        },
    });
}

export default async function ContactPage({ searchParams }: PageProps) {
    const lang = await resolveLanguage(searchParams);
    const domainContent = contentProvider.getDomainContent(lang);
    const contact = domainContent.contact;
    const contactPageContent = getEnterpriseContent(lang).pages.contact;

    return (
        <EnterprisePage
            lang={lang}
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
                    content: (
                        <form className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)] md:p-8">
                            <PageGrid columns={2}>
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="text-sm font-medium text-foreground">{contactPageContent.form.labels.fullName}</label>
                                    <input id="fullName" name="fullName" type="text" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" placeholder={contactPageContent.form.placeholders.fullName} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="workEmail" className="text-sm font-medium text-foreground">{contactPageContent.form.labels.workEmail}</label>
                                    <input id="workEmail" name="workEmail" type="email" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" placeholder={contactPageContent.form.placeholders.workEmail} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="organization" className="text-sm font-medium text-foreground">{contactPageContent.form.labels.organization}</label>
                                    <input id="organization" name="organization" type="text" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" placeholder={contactPageContent.form.placeholders.organization} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="topic" className="text-sm font-medium text-foreground">{contactPageContent.form.labels.topic}</label>
                                    <input id="topic" name="topic" type="text" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" placeholder={contactPageContent.form.placeholders.topic} />
                                </div>
                            </PageGrid>
                            <div className="mt-6 space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-foreground">{contactPageContent.form.labels.message}</label>
                                <textarea id="message" name="message" rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" placeholder={contactPageContent.form.placeholders.message} />
                            </div>
                            <div className="mt-6 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
                                {contactPageContent.form.note}
                            </div>
                        </form>
                    ),
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