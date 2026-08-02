import { AdminPageSectionsManagement } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

type Params = {
    params: Promise<{
        identifier: string;
    }>;
};

export default async function AdminPageSectionsRoute({ params }: Params) {
    const session = await requireAdminRoles(ADMIN_ROUTE_ROLES.pages);
    const { identifier } = await params;

    return <AdminPageSectionsManagement identifier={identifier} currentRole={session.roles[0]} />;
}
