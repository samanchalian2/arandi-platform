"use client";

import { Search } from "lucide-react";

type AdminSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export function AdminSearchBar({
    value,
    onChange,
    placeholder = "Search by title, identifier, or route...",
}: AdminSearchBarProps) {
    return (
        <label className="flex w-full items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 shadow-[var(--elevation-1)]">
            <Search className="size-4 text-muted-foreground" />
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
        </label>
    );
}
