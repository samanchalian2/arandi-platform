import type { Metadata } from "next";

import { PasswordRecovery } from "@/components/auth/PasswordRecovery";

export const metadata: Metadata = {
    title: "Password recovery",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
};

export default function RecoveryPage() {
    return (
        <section className="grid min-h-[70vh] place-items-center px-4 py-12">
            <PasswordRecovery />
        </section>
    );
}
