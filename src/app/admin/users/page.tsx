import { AdminUsersManagement } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminUsersPage() {
    const session = await requireAdminRoles(ADMIN_ROUTE_ROLES.users);

    return <AdminUsersManagement canManage={!session.isMock && session.roles.includes("SuperAdmin")} />;
}
