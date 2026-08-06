import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminProductionLogin } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { getAdminSession } from "@/lib/admin/auth/session";
import { isDevelopmentMockAuthEnabled } from "@/lib/admin/auth/types";

const MOCK_ROLES = ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"] as const;

type AdminLoginPageProps = {
    searchParams: Promise<{ next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
    const session = await getAdminSession();
    const mockAuthEnabled = isDevelopmentMockAuthEnabled();

    if (session) {
        redirect("/admin/dashboard");
    }
    const requestedNext = (await searchParams).next;
    const nextPath = requestedNext?.startsWith("/admin/") && !requestedNext.startsWith("//")
        ? requestedNext
        : "/admin/dashboard";

    return (
        <main className="grid min-h-screen place-items-center px-4 py-12">
            <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--elevation-2)]">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {mockAuthEnabled ? "Admin Login (Mock)" : "Admin Login"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {mockAuthEnabled
                        ? "Select a role to create a local mock session. This flow is disabled in production."
                        : "Sign in with your verified mobile number or email and password."}
                </p>
                {mockAuthEnabled ? (
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        {MOCK_ROLES.map((role) => (
                            <Button
                                key={role}
                                render={<Link href={`/admin/login?mockRole=${role}`} />}
                                nativeButton={false}
                                variant="outline"
                            >
                                Continue as {role}
                            </Button>
                        ))}
                    </div>
                ) : <AdminProductionLogin nextPath={nextPath} />}
            </div>
        </main>
    );
}
