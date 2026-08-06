import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account/AccountDashboard";
import { getAccountSession } from "@/lib/account/session";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
    const session = await getAccountSession();
    if (!session) redirect("/account/login");

    const items = await prisma.serviceRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
            id: true,
            reference: true,
            subject: true,
            description: true,
            status: true,
            priority: true,
            createdAt: true,
        },
    });

    return (
        <AccountDashboard
            displayName={session.displayName}
            email={session.email}
            phoneE164={session.phoneE164}
            initialItems={items}
        />
    );
}
