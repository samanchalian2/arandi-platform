import { AdminEmptyState, AdminTable, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminSectionsPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.sections);

    return (
        <div className="space-y-4">
            <AdminToolbar title="Sections" description="Read-only section registry for initial admin foundation." />
            <AdminTable
                columns={[
                    { key: "key", label: "Key" },
                    { key: "type", label: "Type" },
                    { key: "page", label: "Page" },
                    { key: "order", label: "Order" },
                ]}
                rows={[
                    { key: "hero", type: "hero", page: "home", order: 1 },
                    { key: "features", type: "features", page: "home", order: 2 },
                ]}
            />
            <AdminEmptyState title="Editing disabled" description="Section editors and schema builders are intentionally out of scope in 4.1." />
        </div>
    );
}
