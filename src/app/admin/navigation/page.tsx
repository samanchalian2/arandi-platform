import { AdminEmptyState, AdminTable, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminNavigationPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.navigation);

    return (
        <div className="space-y-4">
            <AdminToolbar title="Navigation" description="Navigation map and ordering placeholders." />
            <AdminTable
                columns={[
                    { key: "label", label: "Label" },
                    { key: "href", label: "Href" },
                    { key: "order", label: "Order" },
                    { key: "locale", label: "Locale" },
                ]}
                rows={[
                    { label: "Services", href: "/services", order: 2, locale: "EN" },
                    { label: "خدمات", href: "/services", order: 2, locale: "FA" },
                ]}
            />
            <AdminEmptyState title="Editor locked" description="Navigation editor remains disabled until CRUD phase." />
        </div>
    );
}
