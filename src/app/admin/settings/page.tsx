import { AdminCard, AdminEmptyState, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminSettingsPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.settings);

    return (
        <div className="space-y-4">
            <AdminToolbar title="Settings" description="Global CMS setting placeholders for future governance controls." />
            <AdminCard title="System Flags" description="Read-only placeholders">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Public site mode: online</li>
                    <li>Localization mode: EN/FA</li>
                    <li>API auth mode: mock</li>
                </ul>
            </AdminCard>
            <AdminEmptyState title="Settings editor pending" description="Write controls are intentionally disabled in Phase 4.1." />
        </div>
    );
}
