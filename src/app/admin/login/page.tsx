import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAdminSession } from "@/lib/admin/auth/session";

const MOCK_ROLES = ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"] as const;

export default async function AdminLoginPage() {
    const session = await getAdminSession();

    if (session) {
        redirect("/admin/dashboard");
    }

    return (
        <div className="grid min-h-screen place-items-center px-4 py-12">
            <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--elevation-2)]">
                <h1 className="text-2xl font-semibold tracking-tight">Admin Login (Mock)</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Select a role to create a mock session. Real authentication provider will be integrated in the next phases.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {MOCK_ROLES.map((role) => (
                        <Button key={role} render={<Link href={`/admin/login?mockRole=${role}`} />} variant="outline">
                            Continue as {role}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
