import type { ReactNode } from "react";

import { AdminLayoutShell, AdminQueryProvider } from "@/components/admin";
import { getRoleBadge } from "@/lib/admin/auth/service";
import { getAdminSession } from "@/lib/admin/auth/session";

type AdminLayoutProps = {
    children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const session = await getAdminSession();

    return (
        <AdminQueryProvider>
            <AdminLayoutShell
                displayName={session?.displayName ?? "Guest"}
                roleLabel={session ? getRoleBadge(session.roles) : "Unauthenticated"}
            >
                {children}
            </AdminLayoutShell>
        </AdminQueryProvider>
    );
}
