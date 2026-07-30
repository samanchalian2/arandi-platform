"use client";

type AdminTabsItem = {
    key: string;
    label: string;
};

type AdminTabsProps = {
    value: string;
    onChange: (value: string) => void;
    items: AdminTabsItem[];
};

export function AdminTabs({ value, onChange, items }: AdminTabsProps) {
    return (
        <div className="inline-flex rounded-xl border border-border/70 bg-muted/30 p-1">
            {items.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    onClick={() => onChange(item.key)}
                    className={`rounded-lg px-3 py-1.5 text-sm ${value === item.key ? "bg-card font-semibold" : "text-muted-foreground"}`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
