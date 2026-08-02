import { AdminMediaManagement, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminMediaPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.media);

    return (
        <div className="space-y-4">
            <AdminToolbar
                title="Media"
                description="Browse and inspect the CMS media library. Upload and destructive actions remain disabled until a storage strategy is approved."
            />
            <AdminMediaManagement />
        </div>
    );
}
