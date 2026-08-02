import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAdminSession } from "@/lib/admin/auth/session";
import { DEV_MOCK_AUTH_FLAG, isDevelopmentMockAuthEnabled } from "@/lib/admin/auth/types";

const MOCK_ROLES = ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"] as const;

export default async function AdminLoginPage() {
    const session = await getAdminSession();
    const mockAuthEnabled = isDevelopmentMockAuthEnabled();

    if (session) {
        redirect("/admin/dashboard");
    }

    return (
        <div className="grid min-h-screen place-items-center px-4 py-12">
            <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--elevation-2)]">
                <h1 className="text-2xl font-semibold tracking-tight">Admin Login (Mock)</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {mockAuthEnabled
                        ? "Select a role to create a local mock session. This flow is disabled in production."
                        : `Mock login is disabled. For local development only, set ${DEV_MOCK_AUTH_FLAG}=true.`}
                </p>
                {mockAuthEnabled ? (
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        {MOCK_ROLES.map((role) => (
                            <Button key={role} render={<Link href={`/admin/login?mockRole=${role}`} />} variant="outline">
                                Continue as {role}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
