import { AdminCardList } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";
import { requireCardRouteOwnership } from "@/lib/admin/cards/server";

type Params = {
    params: Promise<{ identifier: string; sectionId: string }>;
};

export default async function AdminCardsRoute({ params }: Params) {
    const session = await requireAdminRoles(ADMIN_ROUTE_ROLES.cards);
    const { identifier, sectionId } = await params;
    const { section } = await requireCardRouteOwnership(identifier, sectionId);

    return (
        <AdminCardList
            identifier={identifier}
            sectionId={sectionId}
            sectionKey={section.key}
            currentRole={session.roles[0]}
        />
    );
}
