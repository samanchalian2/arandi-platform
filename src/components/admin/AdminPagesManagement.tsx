"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
    AdminEmptyState,
    AdminFilterBar,
    AdminLanguageBadge,
    AdminLoading,
    AdminPagination,
    AdminPageCard,
    AdminPageCreateDialog,
    AdminSearchBar,
    AdminStatusBadge,
    AdminTable,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { usePages, type LanguageFilter, type PageSortField } from "@/lib/admin/pages";

const PAGE_SIZE = 10;

export function AdminPagesManagement({ canCreate }: { canCreate: boolean }) {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"all" | "published" | "draft">("all");
    const [language, setLanguage] = useState<LanguageFilter>("all");
    const [sortBy, setSortBy] = useState<PageSortField>("updatedAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);

    const result = usePages({
        lang,
        search,
        status,
        language,
        sortBy,
        sortDirection,
        page,
        pageSize: PAGE_SIZE,
    });

    const rows = useMemo(
        () =>
            result.items.map((item) => ({
                title: (
                    <Link href={`/admin/pages/${item.identifier}?lang=${lang}`} className="font-medium text-primary hover:underline">
                        {item.title}
                    </Link>
                ),
                identifier: item.identifier,
                status: <AdminStatusBadge status={item.status} />,
                languages: <AdminLanguageBadge languages={item.languages} />,
                updatedAt: new Date(item.updatedAt).toLocaleDateString(),
                theme: item.theme,
                sectionsCount: item.sectionsCount,
            })),
        [lang, result.items],
    );

    return (
        <div className="space-y-4">
            {canCreate ? (
                <div className="flex justify-end">
                    <Button onClick={() => setCreateOpen(true)}>Create Page</Button>
                </div>
            ) : null}
            <AdminSearchBar
                value={search}
                onChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
            />

            <AdminFilterBar
                status={status}
                onStatusChange={(value) => {
                    setStatus(value);
                    setPage(1);
                }}
                language={language}
                onLanguageChange={(value) => {
                    setLanguage(value);
                    setPage(1);
                }}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortDirection={sortDirection}
                onSortDirectionChange={setSortDirection}
            />

            {result.isLoading ? <AdminLoading /> : null}

            {result.isError ? (
                <AdminEmptyState title="Unable to load pages" description={result.errorMessage ?? "Unexpected error"} />
            ) : null}

            {!result.isLoading && !result.isError && result.total === 0 ? (
                <AdminEmptyState
                    title="No pages found"
                    description="No items match the current filters. Try changing search, status, or language filters."
                />
            ) : null}

            {!result.isLoading && !result.isError && result.total > 0 ? (
                <>
                    <div className="hidden md:block">
                        <AdminTable
                            columns={[
                                { key: "title", label: "Page Title" },
                                { key: "identifier", label: "Identifier" },
                                { key: "status", label: "Status" },
                                { key: "languages", label: "Languages" },
                                { key: "updatedAt", label: "Last Updated" },
                                { key: "theme", label: "Theme" },
                                { key: "sectionsCount", label: "Sections" },
                            ]}
                            rows={rows}
                        />
                    </div>

                    <div className="grid gap-3 md:hidden">
                        {result.items.map((item) => (
                            <AdminPageCard
                                key={item.id}
                                title={item.title}
                                identifier={item.identifier}
                                status={item.status}
                                languages={item.languages}
                                updatedAt={item.updatedAt}
                                theme={item.theme}
                                sectionsCount={item.sectionsCount}
                                route={item.route}
                                href={`/admin/pages/${item.identifier}?lang=${lang}`}
                            />
                        ))}
                    </div>

                    <AdminPagination page={page} totalPages={result.totalPages} totalItems={result.total} onPageChange={setPage} />
                </>
            ) : null}

            {!result.isLoading ? (
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => void result.refetch()}>
                        Refresh
                    </Button>
                </div>
            ) : null}

            <AdminPageCreateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={result.refetch}
            />
        </div>
    );
}
