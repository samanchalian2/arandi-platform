import type { ReactNode } from "react";

import { AdminCard } from "./AdminCard";

type AdminStatCardProps = {
    label: string;
    value: string;
    hint?: string;
    icon?: ReactNode;
};

export function AdminStatCard({ label, value, hint, icon }: AdminStatCardProps) {
    return (
        <AdminCard>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="pt-1 text-2xl font-semibold tracking-tight">{value}</p>
                    {hint ? <p className="pt-1 text-xs text-muted-foreground">{hint}</p> : null}
                </div>
                {icon ? <div className="text-primary">{icon}</div> : null}
            </div>
        </AdminCard>
    );
}
