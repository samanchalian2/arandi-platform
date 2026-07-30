import { AdminEmptyState, AdminTable, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminUsersPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.users);

    return (
        <div className="space-y-4">
            <AdminToolbar title="Users" description="Role management shell for upcoming RBAC administration." />
            <AdminTable
                columns={[
                    { key: "name", label: "Name" },
                    { key: "role", label: "Role" },
                    { key: "status", label: "Status" },
                    { key: "lastSeen", label: "Last seen" },
                ]}
                rows={[
                    { name: "Super Admin", role: "SuperAdmin", status: "Active", lastSeen: "Now" },
                    { name: "Content Lead", role: "Editor", status: "Active", lastSeen: "5m ago" },
                ]}
            />
            <AdminEmptyState title="User actions disabled" description="Invite/edit/deactivate flows are not part of this phase." />
        </div>
    );
}
