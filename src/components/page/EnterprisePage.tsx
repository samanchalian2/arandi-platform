import type { ComponentProps, ReactNode } from "react";

import { PageBreadcrumb } from "./PageBreadcrumb";
import { PageCTA } from "./PageCTA";
import { PageHero } from "./PageHero";
import { PageSection } from "./PageSection";

type EnterprisePageSection = {
    key: string;
    eyebrow?: string;
    title?: string;
    description?: string;
    titleAs?: "h2" | "h3" | "h4";
    align?: "start" | "center";
    headerActions?: ReactNode;
    className?: string;
    contentClassName?: string;
    containerClassName?: string;
    surfaceClassName?: string;
    content: ReactNode;
};

type EnterprisePageProps = {
    lang: "en" | "fa";
    contentSource?: "local" | "prisma";
    breadcrumbLabel: string;
    hero: ComponentProps<typeof PageHero>;
    sections: EnterprisePageSection[];
    cta: ComponentProps<typeof PageCTA>;
};

export function EnterprisePage({ lang, contentSource, breadcrumbLabel, hero, sections, cta }: EnterprisePageProps) {
    return (
        <div
            className="flex flex-1 flex-col"
            data-content-source={contentSource}
            dir={lang === "fa" ? "rtl" : "ltr"}
            lang={lang}
        >
            <PageBreadcrumb lang={lang} currentLabel={breadcrumbLabel} />

            <PageHero {...hero} />

            {sections.map((section) => (
                <PageSection
                    key={section.key}
                    eyebrow={section.eyebrow}
                    title={section.title}
                    description={section.description}
                    titleAs={section.titleAs}
                    align={section.align}
                    headerActions={section.headerActions}
                    className={section.className}
                    contentClassName={section.contentClassName}
                    containerClassName={section.containerClassName}
                    surfaceClassName={section.surfaceClassName}
                >
                    {section.content}
                </PageSection>
            ))}

            <PageSection>
                <PageCTA {...cta} />
            </PageSection>
        </div>
    );
}
