import { AdminEmptyState } from "./AdminEmptyState";

type AdminSectionEmptyStateProps = {
    hasFilters?: boolean;
};

export function AdminSectionEmptyState({ hasFilters = false }: AdminSectionEmptyStateProps) {
    if (hasFilters) {
        return <AdminEmptyState title="No matching sections" description="Try changing filters or search query." />;
    }

    return <AdminEmptyState title="No sections found" description="This page currently has no sections in CMS." />;
}
