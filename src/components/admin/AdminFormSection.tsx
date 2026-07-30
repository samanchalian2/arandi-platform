import type { ReactNode } from "react";

import { AdminCard } from "./AdminCard";

type AdminFormSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

export function AdminFormSection({ title, description, children }: AdminFormSectionProps) {
    return (
        <AdminCard title={title} description={description}>
            <div className="space-y-3">{children}</div>
        </AdminCard>
    );
}
