import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";
import { AdminContactInbox } from "@/components/admin";

export default async function AdminContactSubmissionsPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.contactSubmissions);

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <header><h1 className="text-2xl font-semibold text-foreground">Contact inbox</h1><p className="mt-2 text-sm text-muted-foreground">Protected requests, delivery status and reply history.</p></header>
            <AdminContactInbox />
        </div>
    );
}
