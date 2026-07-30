import { AdminCard } from "./AdminCard";
import { AdminLanguageBadge } from "./AdminLanguageBadge";
import { AdminSectionTypeBadge } from "./AdminSectionTypeBadge";

type AdminSectionCardProps = {
    keyName: string;
    type: string;
    order: number;
    status: "enabled" | "disabled";
    languages: string[];
    updatedAt: string;
    title: string;
    subtitle: string;
};

export function AdminSectionCard({
    keyName,
    type,
    order,
    status,
    languages,
    updatedAt,
    title,
    subtitle,
}: AdminSectionCardProps) {
    return (
        <AdminCard>
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                        <p className="text-xs text-muted-foreground">{keyName}</p>
                    </div>
                    <AdminSectionTypeBadge type={type} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Order: {order}</p>
                    <p>Status: {status}</p>
                    <p className="truncate">Updated: {new Date(updatedAt).toLocaleDateString()}</p>
                    <p className="truncate">Preview: {subtitle || "No subtitle"}</p>
                </div>

                <AdminLanguageBadge languages={languages} />
            </div>
        </AdminCard>
    );
}
