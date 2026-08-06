import { requireAdminRoles } from "@/lib/admin/auth/guards";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin/auth/rbac";
import { prisma } from "@/lib/prisma";

export default async function AdminContactSubmissionsPage() {
    await requireAdminRoles(ADMIN_ROUTE_ROLES.users);
    const items = await prisma.contactSubmission.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 100,
        select: {
            reference: true,
            createdAt: true,
            fullName: true,
            email: true,
            organization: true,
            topic: true,
            message: true,
            languageCode: true,
            status: true,
            deliveryState: true,
        },
    });

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <header>
                <h1 className="text-2xl font-semibold text-foreground">Contact requests</h1>
                <p className="mt-2 text-sm text-muted-foreground">Latest 100 persisted enquiries. Client hashes and provider metadata are intentionally omitted.</p>
            </header>
            {items.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">No contact requests.</p>
            ) : (
                <div className="grid gap-4">
                    {items.map((item) => (
                        <article key={item.reference} className="rounded-2xl border border-border bg-card p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="font-semibold text-foreground">{item.topic}</h2>
                                <span className="text-xs text-muted-foreground">{item.reference} · {item.createdAt.toISOString()}</span>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{item.fullName} · {item.email}</p>
                            {item.organization ? <p className="mt-1 text-sm text-muted-foreground">{item.organization}</p> : null}
                            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{item.message}</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-muted px-3 py-1">{item.languageCode.toUpperCase()}</span>
                                <span className="rounded-full bg-muted px-3 py-1">{item.status}</span>
                                <span className="rounded-full bg-muted px-3 py-1">Delivery: {item.deliveryState}</span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
