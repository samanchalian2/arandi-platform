"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    useMedia,
    type MediaSortField,
    type MediaTypeFilter,
} from "@/lib/admin/media";

import { AdminEmptyState } from "./AdminEmptyState";
import { AdminLoading } from "./AdminLoading";
import { AdminMediaItem } from "./AdminMediaItem";
import { AdminMediaToolbar } from "./AdminMediaToolbar";
import { AdminMediaTypeBadge } from "./AdminMediaTypeBadge";
import { AdminPagination } from "./AdminPagination";
import { AdminSearchBar } from "./AdminSearchBar";
import { AdminTable } from "./AdminTable";

const PAGE_SIZE = 12;

export function AdminMediaManagement() {
    const [search, setSearch] = useState("");
    const [type, setType] = useState<MediaTypeFilter>("all");
    const [sortBy, setSortBy] = useState<MediaSortField>("updatedAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);

    const result = useMedia({ search, type, sortBy, sortDirection, page, pageSize: PAGE_SIZE });
    const rows = useMemo(
        () =>
            result.items.map((item) => ({
                title: item.title,
                type: <AdminMediaTypeBadge type={item.type} />,
                dimensions: item.width && item.height ? `${item.width} × ${item.height}` : "—",
                alt: item.alt || "—",
                updatedAt: new Date(item.updatedAt).toLocaleDateString(),
                source: (
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        Open
                    </a>
                ),
            })),
        [result.items],
    );

    return (
        <div className="space-y-4">
            <AdminSearchBar
                value={search}
                placeholder="Search by title, URL, type, or alternative text..."
                onChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
            />
            <AdminMediaToolbar
                type={type}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onTypeChange={(value) => {
                    setType(value as MediaTypeFilter);
                    setPage(1);
                }}
                onSortByChange={(value) => setSortBy(value as MediaSortField)}
                onSortDirectionChange={(value) => setSortDirection(value as "asc" | "desc")}
            />

            {result.isLoading ? <AdminLoading /> : null}
            {result.isError ? (
                <AdminEmptyState title="Unable to load media" description={result.errorMessage ?? "Unexpected error"} />
            ) : null}
            {!result.isLoading && !result.isError && result.total === 0 ? (
                <AdminEmptyState
                    title="No media found"
                    description="No assets match the current search and type filter."
                />
            ) : null}

            {!result.isLoading && !result.isError && result.total > 0 ? (
                <>
                    <div className="hidden md:block">
                        <AdminTable
                            columns={[
                                { key: "title", label: "Title" },
                                { key: "type", label: "Type" },
                                { key: "dimensions", label: "Dimensions" },
                                { key: "alt", label: "Alternative text" },
                                { key: "updatedAt", label: "Updated" },
                                { key: "source", label: "Source" },
                            ]}
                            rows={rows}
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:hidden">
                        {result.items.map((item) => <AdminMediaItem key={item.id} item={item} />)}
                    </div>
                    <AdminPagination
                        page={page}
                        totalPages={result.totalPages}
                        totalItems={result.total}
                        onPageChange={setPage}
                    />
                </>
            ) : null}

            {!result.isLoading ? (
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => void result.refetch()}>
                        Refresh
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
