import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type PageGridProps = ComponentPropsWithoutRef<"div"> & {
    columns?: 1 | 2 | 3 | 4;
    dense?: boolean;
};

const columnClassNames: Record<NonNullable<PageGridProps["columns"]>, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

export function PageGrid({ columns = 3, dense = false, className, ...props }: PageGridProps) {
    return (
        <div
            className={cn(
                "ds-grid ds-motion-stagger grid gap-5 md:gap-6 xl:gap-7",
                columnClassNames[columns],
                dense ? "gap-4 md:gap-5" : "",
                className,
            )}
            {...props}
        />
    );
}