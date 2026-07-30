import { AdminEmptyState, AdminTable, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminMediaPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.media);

    return (
        <div className="space-y-4">
            <AdminToolbar title="Media" description="Media library shell. Upload and editing are intentionally disabled." />
            <AdminTable
                columns={[
                    { key: "title", label: "Title" },
                    { key: "type", label: "Type" },
                    { key: "size", label: "Size" },
                    { key: "updatedAt", label: "Updated" },
                ]}
                rows={[
                    { title: "Logo", type: "image/svg+xml", size: "12 KB", updatedAt: "1d ago" },
                    { title: "Hero Background", type: "image/webp", size: "160 KB", updatedAt: "3d ago" },
                ]}
            />
            <AdminEmptyState title="Upload pending" description="Asset upload pipeline is not implemented in Phase 4.1." />
        </div>
    );
}
