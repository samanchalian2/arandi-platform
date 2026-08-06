import { AdminPagesManagement, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminPagesPage() {
    const session = await requireAdminRoles(ADMIN_ROUTE_ROLES.pages);
    const canCreate = session.roles.some((role) =>
        role === "SuperAdmin" || role === "Admin" || role === "Editor");

    return (
        <div className="space-y-4">
            <AdminToolbar
                title="Pages Management"
                description="Bilingual Draft creation and Page → Section → Card → Media management"
            />
            <AdminPagesManagement canCreate={canCreate} />
        </div>
    );
}
