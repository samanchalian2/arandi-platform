import { cn } from "@/lib/utils";

type AdminStatusBadgeProps = {
    status: string;
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
    const normalized = status.toLowerCase();

    return (
        <span
            className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                normalized === "published"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            )}
        >
            {status}
        </span>
    );
}
