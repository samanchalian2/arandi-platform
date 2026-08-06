import { AdminNavigationManagement } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminNavigationPage() {
    const session = await requireAdminRoles(ADMIN_ROUTE_ROLES.navigation);
    const canStructure = session.roles.some((role) =>
        role === "SuperAdmin" || role === "Admin" || role === "Editor");
    const canTranslate = canStructure || session.roles.includes("Translator");
    const canDelete = session.roles.some((role) => role === "SuperAdmin" || role === "Admin");

    return (
        <AdminNavigationManagement
            canStructure={canStructure}
            canTranslate={canTranslate}
            canDelete={canDelete}
        />
    );
}
