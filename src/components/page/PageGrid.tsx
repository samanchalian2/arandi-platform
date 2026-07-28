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
        "grid gap-6",
        columnClassNames[columns],
        dense ? "gap-4" : "gap-6 lg:gap-8",
        className,
      )}
      {...props}
    />
  );
}