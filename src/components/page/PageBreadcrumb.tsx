import Link from "next/link";

import { getLocalizedHomeLabel } from "@/content/navigation";
import { PageContainer } from "./PageContainer";

type PageBreadcrumbProps = {
    lang: "en" | "fa";
    currentLabel: string;
    homeLabel?: string;
    className?: string;
};

export function PageBreadcrumb({ lang, currentLabel, homeLabel, className }: PageBreadcrumbProps) {
    const resolvedHomeLabel = homeLabel ?? getLocalizedHomeLabel(lang);

    return (
        <PageContainer className="py-6 md:py-7" surfaceClassName="bg-background">
            <nav aria-label="Breadcrumb" className={className}>
                <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <li>
                        <Link href={`/?lang=${lang}`} className="rounded-md px-1 py-0.5 transition-colors hover:text-foreground">
                            {resolvedHomeLabel}
                        </Link>
                    </li>
                    <li aria-hidden="true" className="text-muted-foreground/70">/</li>
                    <li className="font-medium text-foreground">{currentLabel}</li>
                </ol>
            </nav>
        </PageContainer>
    );
}