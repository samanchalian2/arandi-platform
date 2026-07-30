"use client";

import { useSearchParams } from "next/navigation";

import {
    AdminCard,
    AdminDescriptionList,
    AdminEmptyState,
    AdminLanguageBadge,
    AdminLoading,
    AdminStatusBadge,
    AdminTable,
} from "@/components/admin";
import { usePage } from "@/lib/admin/pages";

type AdminPageDetailsProps = {
    identifier: string;
};

export function AdminPageDetails({ identifier }: AdminPageDetailsProps) {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";
    const { data, isLoading, isError, errorMessage } = usePage(identifier, lang);

    if (isLoading) {
        return <AdminLoading />;
    }

    if (isError || !data) {
        return <AdminEmptyState title="Unable to load page details" description={errorMessage ?? "Unexpected error"} />;
    }

    const { page, sections, theme } = data;

    return (
        <div className="space-y-4">
            <AdminCard title="General Information" description="Read-only metadata from CMS API.">
                <AdminDescriptionList
                    items={[
                        { term: "Title", description: page.translation?.title ?? page.slug },
                        { term: "Identifier", description: page.slug },
                        { term: "Route", description: page.route },
                        { term: "Status", description: <AdminStatusBadge status={page.status} /> },
                        { term: "Type", description: page.pageType },
                        { term: "Last Updated", description: new Date(page.updatedAt).toLocaleString() },
                    ]}
                />
            </AdminCard>

            <AdminCard title="Translations" description="Available languages for this page.">
                <AdminLanguageBadge languages={(page.translations ?? []).map((item) => item.languageCode)} />
                <div className="mt-3">
                    <AdminTable
                        columns={[
                            { key: "languageCode", label: "Language" },
                            { key: "title", label: "Title" },
                            { key: "seoTitle", label: "SEO Title" },
                        ]}
                        rows={(page.translations ?? []).map((translation) => ({
                            languageCode: translation.languageCode.toUpperCase(),
                            title: translation.title,
                            seoTitle: translation.seoTitle,
                        }))}
                    />
                </div>
            </AdminCard>

            <AdminCard title="Theme" description="Theme assignment based on active CMS theme endpoint.">
                <AdminDescriptionList
                    items={[
                        { term: "Theme Name", description: theme?.name ?? "Unavailable" },
                        { term: "Theme Slug", description: theme?.slug ?? "N/A" },
                    ]}
                />
            </AdminCard>

            <AdminCard title="Sections" description="Sections mapped to this page.">
                <AdminTable
                    columns={[
                        { key: "key", label: "Key" },
                        { key: "type", label: "Type" },
                        { key: "order", label: "Order" },
                    ]}
                    rows={sections.map((section) => ({
                        key: section.key,
                        type: section.type,
                        order: section.order,
                    }))}
                />
            </AdminCard>

            <AdminCard title="SEO" description="Read-only placeholders sourced from current page metadata.">
                <AdminDescriptionList
                    items={[
                        { term: "SEO Title", description: page.metadata.seoTitle || "N/A" },
                        { term: "SEO Description", description: page.metadata.seoDescription || "N/A" },
                        {
                            term: "SEO Keywords",
                            description: page.metadata.seoKeywords.length > 0 ? page.metadata.seoKeywords.join(", ") : "N/A",
                        },
                    ]}
                />
            </AdminCard>

            <AdminCard title="Navigation Information" description="Derived from current read-only page route data.">
                <AdminDescriptionList
                    items={[
                        { term: "Primary Route", description: page.route },
                        { term: "Navigation Link", description: "Available via route mapping" },
                        { term: "External", description: "No" },
                    ]}
                />
            </AdminCard>
        </div>
    );
}
