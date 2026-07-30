import { Activity, Languages, LayoutGrid, Palette, FileStack, Image as ImageIcon, Users, Rows3 } from "lucide-react";

import { AdminCard, AdminStatCard, AdminToolbar } from "@/components/admin";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

const DASHBOARD_STATS = [
    { label: "Pages", value: "24", hint: "3 draft", icon: <FileStack className="size-5" /> },
    { label: "Sections", value: "78", hint: "All locales", icon: <Rows3 className="size-5" /> },
    { label: "Cards", value: "146", hint: "21 pending review", icon: <LayoutGrid className="size-5" /> },
    { label: "Media", value: "320", hint: "12 recent uploads", icon: <ImageIcon className="size-5" /> },
    { label: "Users", value: "9", hint: "5 active today", icon: <Users className="size-5" /> },
    { label: "Languages", value: "2", hint: "EN / FA", icon: <Languages className="size-5" /> },
    { label: "Theme", value: "1", hint: "Default active", icon: <Palette className="size-5" /> },
    { label: "Recent Activity", value: "18", hint: "Last 24 hours", icon: <Activity className="size-5" /> },
] as const;

export default async function AdminDashboardPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.dashboard);

    return (
        <div className="space-y-4">
            <AdminToolbar
                title="Dashboard"
                description="Admin foundation overview and operational placeholders"
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {DASHBOARD_STATS.map((item) => (
                    <AdminStatCard key={item.label} label={item.label} value={item.value} hint={item.hint} icon={item.icon} />
                ))}
            </div>
            <AdminCard title="Recent Activity" description="Placeholder feed until CRUD workflows are enabled.">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Page metadata synchronized for EN/FA.</li>
                    <li>Theme token validation completed.</li>
                    <li>Media governance policy draft updated.</li>
                </ul>
            </AdminCard>
        </div>
    );
}
