import { cn } from "@/lib/utils";

type AdminSkeletonProps = {
    className?: string;
};

export function AdminSkeleton({ className }: AdminSkeletonProps) {
    return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}
