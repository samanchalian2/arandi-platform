import Link from "next/link";

import { AdminEmptyState, AdminToolbar } from "@/components/admin";
import { buttonVariants } from "@/components/ui/button";
import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminSectionsPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.sections);

    return (
        <div className="space-y-4">
            <AdminToolbar
                title="Sections"
                description="Page Builder foundation is page-scoped. Open a page and manage sections from its details view."
                actions={
                    <Link href="/admin/pages" className={buttonVariants({ size: "sm", variant: "outline" })}>
                        Go to Pages
                    </Link>
                }
            />
            <AdminEmptyState
                title="Select a page to view sections"
                description="Use Pages Management to open /admin/pages/[identifier]/sections with live CMS data."
            />
        </div>
    );
}
