import { redirect } from "next/navigation";

import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";

export default async function AdminRootPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.root);
    redirect("/admin/dashboard");
}
