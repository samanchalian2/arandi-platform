import { AdminSectionDetails } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

type Params = {
    params: Promise<{
        identifier: string;
        sectionId: string;
    }>;
};

export default async function AdminPageSectionDetailsRoute({ params }: Params) {
    const session = await requireAdminRoles(ADMIN_ROUTE_ROLES.pages);
    const { identifier, sectionId } = await params;

    return <AdminSectionDetails identifier={identifier} id={sectionId} currentRole={session.roles[0]} />;
}
