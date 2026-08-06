import { redirect } from "next/navigation";

import { AdminProductionLogin } from "@/components/admin";
import { getAccountSession } from "@/lib/account/session";

export default async function AccountLoginPage() {
    if (await getAccountSession()) redirect("/account");

    return (
        <section className="grid min-h-[70vh] place-items-center px-4 py-12">
            <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--elevation-2)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Customer portal</p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">Account sign in</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sign in with your verified mobile number or email.
                </p>
                <AdminProductionLogin
                    nextPath="/account"
                    recoveryHref="/recover?audience=customer"
                />
            </div>
        </section>
    );
}
