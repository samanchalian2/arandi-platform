import Link from "next/link";

import { AdminCard } from "./AdminCard";
import { AdminLanguageBadge } from "./AdminLanguageBadge";
import { AdminStatusBadge } from "./AdminStatusBadge";

type AdminPageCardProps = {
    title: string;
    identifier: string;
    status: string;
    languages: string[];
    updatedAt: string;
    theme: string;
    sectionsCount: number;
    route: string;
    href: string;
};

export function AdminPageCard({
    title,
    identifier,
    status,
    languages,
    updatedAt,
    theme,
    sectionsCount,
    route,
    href,
}: AdminPageCardProps) {
    return (
        <AdminCard>
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                        <p className="text-xs text-muted-foreground">/{identifier}</p>
                    </div>
                    <AdminStatusBadge status={status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Theme: {theme}</p>
                    <p>Sections: {sectionsCount}</p>
                    <p className="truncate">Route: {route}</p>
                    <p>Updated: {new Date(updatedAt).toLocaleDateString()}</p>
                </div>

                <AdminLanguageBadge languages={languages} />

                <Link href={href} className="inline-flex text-sm font-medium text-primary hover:underline">
                    View details
                </Link>
            </div>
        </AdminCard>
    );
}
