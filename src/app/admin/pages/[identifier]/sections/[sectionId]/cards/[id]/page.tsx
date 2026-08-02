import { AdminCardDetails } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";
import { requireCardRouteOwnership } from "@/lib/admin/cards/server";

type Params = {
    params: Promise<{ identifier: string; sectionId: string; id: string }>;
};

export default async function AdminCardDetailsRoute({ params }: Params) {
    const session = await requireAdminRoles(ADMIN_ROUTE_ROLES.cards);
    const { identifier, sectionId, id } = await params;
    await requireCardRouteOwnership(identifier, sectionId, id);

    return (
        <AdminCardDetails
            identifier={identifier}
            sectionId={sectionId}
            id={id}
            currentRole={session.roles[0]}
        />
    );
}
