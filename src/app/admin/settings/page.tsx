import { AdminSettingsManagement } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminSettingsPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.settings);
    return <AdminSettingsManagement />;
}
