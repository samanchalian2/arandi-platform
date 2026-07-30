import { AdminPageDetails, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

type Params = {
    params: Promise<{
        identifier: string;
    }>;
};

export default async function AdminPageDetailsRoute({ params }: Params) {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.pages);
    const { identifier } = await params;

    return (
        <div className="space-y-4">
            <AdminToolbar title="Page Details" description={`Read-only CMS view for ${identifier}`} />
            <AdminPageDetails identifier={identifier} />
        </div>
    );
}
