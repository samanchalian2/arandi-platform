"use client";

import { ArrowDownUp } from "lucide-react";

import type { LanguageFilter, PageSortField } from "@/lib/admin/pages";

type AdminFilterBarProps = {
    status: "all" | "published" | "draft";
    onStatusChange: (value: "all" | "published" | "draft") => void;
    language: LanguageFilter;
    onLanguageChange: (value: LanguageFilter) => void;
    sortBy: PageSortField;
    onSortByChange: (value: PageSortField) => void;
    sortDirection: "asc" | "desc";
    onSortDirectionChange: (value: "asc" | "desc") => void;
};

export function AdminFilterBar({
    status,
    onStatusChange,
    language,
    onLanguageChange,
    sortBy,
    onSortByChange,
    sortDirection,
    onSortDirectionChange,
}: AdminFilterBarProps) {
    return (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value as "all" | "published" | "draft")}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
                aria-label="Filter by status"
            >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
            </select>

            <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as LanguageFilter)}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
                aria-label="Filter by language"
            >
                <option value="all">All languages</option>
                <option value="en">English available</option>
                <option value="fa">Persian available</option>
                <option value="bilingual">Bilingual (EN + FA)</option>
            </select>

            <select
                value={sortBy}
                onChange={(event) => onSortByChange(event.target.value as PageSortField)}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
                aria-label="Sort by"
            >
                <option value="updatedAt">Last updated</option>
                <option value="title">Title</option>
                <option value="identifier">Identifier</option>
                <option value="status">Status</option>
                <option value="sectionsCount">Sections count</option>
            </select>

            <button
                type="button"
                onClick={() => onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-3 text-sm"
            >
                <ArrowDownUp className="size-4" />
                {sortDirection === "asc" ? "Ascending" : "Descending"}
            </button>
        </div>
    );
}
