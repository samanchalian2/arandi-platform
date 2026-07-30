import { AdminCard, AdminEmptyState, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminThemePage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.theme);

    return (
        <div className="space-y-4">
            <AdminToolbar title="Theme" description="Theme token overview placeholder aligned with current design system." />
            <AdminCard title="Active Theme" description="No editing in this phase.">
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Slug</dt>
                        <dd>default</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd>Active</dd>
                    </div>
                </dl>
            </AdminCard>
            <AdminEmptyState title="Theme editor pending" description="Token editing and preview controls start in the next admin phase." />
        </div>
    );
}
