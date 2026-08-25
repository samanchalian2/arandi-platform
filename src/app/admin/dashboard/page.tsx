import { AdminAnalyticsDashboard, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminDashboardPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.dashboard);

    return (
        <div className="space-y-4">
            <AdminToolbar
                title="Dashboard"
                description="Consent-based first-party visitor analytics"
            />
            <AdminAnalyticsDashboard />
        </div>
    );
}
