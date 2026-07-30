import { AdminPagesManagement, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminPagesPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.pages);

    return (
        <div className="space-y-4">
            <AdminToolbar
                title="Pages Management"
                description="Read-only integration with CMS Pages API"
            />
            <AdminPagesManagement />
        </div>
    );
}
