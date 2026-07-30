"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchPagesList } from "./api";
import type { PageListItem, UsePagesOptions, UsePagesResult } from "./types";

function matchesLanguage(page: PageListItem, language: UsePagesOptions["language"]): boolean {
    if (language === "all") {
        return true;
    }
    if (language === "bilingual") {
        return page.languages.includes("en") && page.languages.includes("fa");
    }

    return page.languages.includes(language);
}

function normalizeStatus(status: string): string {
    return status.toLowerCase();
}

function applySort(items: PageListItem[], sortBy: UsePagesOptions["sortBy"], sortDirection: UsePagesOptions["sortDirection"]): PageListItem[] {
    const direction = sortDirection === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
        if (sortBy === "sectionsCount") {
            return (a.sectionsCount - b.sectionsCount) * direction;
        }

        if (sortBy === "updatedAt") {
            const aTime = new Date(a.updatedAt).getTime();
            const bTime = new Date(b.updatedAt).getTime();
            return (aTime - bTime) * direction;
        }

        const left = String(a[sortBy]).toLowerCase();
        const right = String(b[sortBy]).toLowerCase();

        if (left < right) {
            return -1 * direction;
        }
        if (left > right) {
            return 1 * direction;
        }

        return 0;
    });
}

export function usePages(options: UsePagesOptions): UsePagesResult {
    const query = useQuery({
        queryKey: ["admin-pages", options.lang],
        queryFn: () => fetchPagesList(options.lang),
        staleTime: 30_000,
    });

    const allItems = useMemo(() => query.data ?? [], [query.data]);

    const filtered = useMemo(() => {
        const query = options.search.trim().toLowerCase();

        return allItems.filter((item) => {
            const statusMatches = options.status === "all" || normalizeStatus(item.status) === options.status;
            const languageMatches = matchesLanguage(item, options.language);
            const searchMatches =
                query.length === 0 ||
                item.title.toLowerCase().includes(query) ||
                item.identifier.toLowerCase().includes(query) ||
                item.route.toLowerCase().includes(query);

            return statusMatches && languageMatches && searchMatches;
        });
    }, [allItems, options.search, options.status, options.language]);

    const sorted = useMemo(
        () => applySort(filtered, options.sortBy, options.sortDirection),
        [filtered, options.sortBy, options.sortDirection],
    );

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / options.pageSize));
    const safePage = Math.min(Math.max(options.page, 1), totalPages);
    const start = (safePage - 1) * options.pageSize;
    const items = sorted.slice(start, start + options.pageSize);

    return {
        items,
        total,
        totalPages,
        isLoading: query.isLoading,
        isError: query.isError,
        errorMessage: query.error instanceof Error ? query.error.message : null,
        refetch: async () => {
            await query.refetch();
        },
    };
}
