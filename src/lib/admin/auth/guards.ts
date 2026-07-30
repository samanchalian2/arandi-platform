import { redirect } from "next/navigation";

import { canAccess } from "./service";
import { getAdminSession } from "./session";
import type { AdminRole, AdminSession } from "./types";

export async function requireAdminRoles(requiredRoles: AdminRole[]): Promise<AdminSession> {
    const session = await getAdminSession();

    if (!session) {
        redirect("/admin/login");
    }

    if (!canAccess(session, requiredRoles)) {
        redirect("/admin/forbidden");
    }

    return session;
}
