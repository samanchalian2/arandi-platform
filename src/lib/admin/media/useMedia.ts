"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchMediaList } from "./api";
import type { MediaItem, MediaTypeFilter, UseMediaOptions, UseMediaResult } from "./types";

function matchesType(item: MediaItem, filter: MediaTypeFilter): boolean {
    if (filter === "all") return true;

    const type = item.type.toLowerCase();
    if (filter === "image") return type.startsWith("image/");
    if (filter === "video") return type.startsWith("video/");
    if (filter === "document") {
        return type === "application/pdf" || type.includes("document") || type.startsWith("text/");
    }

    return !type.startsWith("image/") && !type.startsWith("video/") && type !== "application/pdf" && !type.includes("document") && !type.startsWith("text/");
}

function sortItems(items: MediaItem[], options: UseMediaOptions): MediaItem[] {
    const direction = options.sortDirection === "asc" ? 1 : -1;

    return [...items].sort((left, right) => {
        if (options.sortBy === "updatedAt") {
            return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * direction;
        }

        return left[options.sortBy].localeCompare(right[options.sortBy]) * direction;
    });
}

export function useMedia(options: UseMediaOptions): UseMediaResult {
    const query = useQuery({
        queryKey: ["admin-media"],
        queryFn: fetchMediaList,
        staleTime: 30_000,
    });

    const filtered = useMemo(() => {
        const search = options.search.trim().toLowerCase();

        return (query.data ?? []).filter((item) => {
            const searchMatches =
                search.length === 0 ||
                item.title.toLowerCase().includes(search) ||
                item.url.toLowerCase().includes(search) ||
                item.type.toLowerCase().includes(search) ||
                item.alt?.toLowerCase().includes(search) === true;

            return searchMatches && matchesType(item, options.type);
        });
    }, [options.search, options.type, query.data]);

    const sorted = useMemo(() => sortItems(filtered, options), [filtered, options]);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / options.pageSize));
    const safePage = Math.min(Math.max(options.page, 1), totalPages);
    const start = (safePage - 1) * options.pageSize;

    return {
        items: sorted.slice(start, start + options.pageSize),
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
