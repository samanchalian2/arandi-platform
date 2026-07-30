"use client";

import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
};

export function AdminPagination({ page, totalPages, totalItems, onPageChange }: AdminPaginationProps) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
                {totalItems} item{totalItems === 1 ? "" : "s"} • Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );
}
