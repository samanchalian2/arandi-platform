import { File, FileText, ImageIcon, Video } from "lucide-react";

type AdminMediaTypeBadgeProps = {
    type: string;
};

export function AdminMediaTypeBadge({ type }: AdminMediaTypeBadgeProps) {
    const normalized = type.toLowerCase();
    const Icon = normalized.startsWith("image/")
        ? ImageIcon
        : normalized.startsWith("video/")
          ? Video
          : normalized === "application/pdf" || normalized.startsWith("text/")
            ? FileText
            : File;

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Icon className="size-3.5" aria-hidden="true" />
            {type}
        </span>
    );
}
