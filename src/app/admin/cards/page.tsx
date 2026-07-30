import { AdminEmptyState, AdminTable, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminCardsPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.cards);

    return (
        <div className="space-y-4">
            <AdminToolbar title="Cards" description="Card catalog placeholder for upcoming editorial tools." />
            <AdminTable
                columns={[
                    { key: "title", label: "Title" },
                    { key: "variant", label: "Variant" },
                    { key: "status", label: "Status" },
                    { key: "lang", label: "Lang" },
                ]}
                rows={[
                    { title: "Enterprise AI", variant: "serviceCard", status: "Published", lang: "EN" },
                    { title: "هوش سازمانی", variant: "serviceCard", status: "Published", lang: "FA" },
                ]}
            />
            <AdminEmptyState title="CRUD not enabled" description="Card create/edit/delete actions will be enabled in Phase 4.2." />
        </div>
    );
}
