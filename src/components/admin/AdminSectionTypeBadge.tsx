import { cn } from "@/lib/utils";

type AdminSectionTypeBadgeProps = {
    type: string;
};

const TYPE_LABELS: Record<string, string> = {
    hero: "Hero",
    features: "Features",
    text: "Text",
    cards: "Cards",
    gallery: "Gallery",
    cta: "CTA",
    contact: "Contact",
    custom: "Custom",
};

export function AdminSectionTypeBadge({ type }: AdminSectionTypeBadgeProps) {
    const normalized = type.trim().toLowerCase();
    const label = TYPE_LABELS[normalized] ?? "Custom";

    return (
        <span className={cn("inline-flex rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300")}>
            {label}
        </span>
    );
}
