import type { ReactNode } from "react";

import { AdminToolbar } from "./AdminToolbar";

type AdminSectionToolbarProps = {
    title: string;
    description?: string;
    sectionCount: number;
    actions?: ReactNode;
};

export function AdminSectionToolbar({ title, description, sectionCount, actions }: AdminSectionToolbarProps) {
    return (
        <AdminToolbar
            title={title}
            description={`${description ?? "Section registry"} • ${sectionCount} section${sectionCount === 1 ? "" : "s"}`}
            actions={actions}
        />
    );
}
