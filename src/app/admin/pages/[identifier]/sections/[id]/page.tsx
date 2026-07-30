import { AdminSectionDetails } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";
import { getAdminSession } from "@/lib/admin/auth/session";

type Params = {
    params: Promise<{
        identifier: string;
        id: string;
    }>;
};

export default async function AdminPageSectionDetailsRoute({ params }: Params) {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.pages);
    const { identifier, id } = await params;
    const session = await getAdminSession();

    return <AdminSectionDetails identifier={identifier} id={id} currentRole={session?.roles[0] ?? "Viewer"} />;
}
