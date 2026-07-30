type AdminLanguageBadgeProps = {
    languages: string[];
};

export function AdminLanguageBadge({ languages }: AdminLanguageBadgeProps) {
    const hasEn = languages.includes("en");
    const hasFa = languages.includes("fa");

    return (
        <div className="flex flex-wrap items-center gap-1">
            <span className={`rounded-full px-2 py-0.5 text-xs ${hasEn ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                EN
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${hasFa ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                FA
            </span>
        </div>
    );
}
