"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth/csrf";

type ServiceRequestItem = {
    id: string;
    reference: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    createdAt: Date | string;
};

type AccountDashboardProps = {
    displayName: string;
    email: string | null;
    phoneE164: string | null;
    initialItems: ServiceRequestItem[];
};

function cookieValue(name: string): string | null {
    const prefix = `${encodeURIComponent(name)}=`;
    const part = document.cookie.split("; ").find((item) => item.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : null;
}

export function AccountDashboard({
    displayName,
    email,
    phoneE164,
    initialItems,
}: AccountDashboardProps) {
    const [items, setItems] = useState(initialItems);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--elevation-1)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Customer portal</p>
                    <h1 className="mt-2 text-2xl font-semibold">{displayName}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{email ?? phoneE164 ?? "Verified account"}</p>
                </div>
                <Button
                    variant="outline"
                    disabled={pending}
                    onClick={async () => {
                        const csrf = cookieValue(CSRF_COOKIE);
                        if (csrf) {
                            await fetch("/api/auth/logout", {
                                method: "POST",
                                headers: { [CSRF_HEADER]: csrf },
                            });
                        }
                        window.location.assign("/account/login");
                    }}
                >
                    Sign out
                </Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <form
                    className="rounded-3xl border border-border/70 bg-card p-6"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        setPending(true);
                        setError(null);
                        try {
                            const csrf = cookieValue(CSRF_COOKIE);
                            if (!csrf) throw new Error("Your session must be refreshed.");
                            const response = await fetch("/api/account/service-requests", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    [CSRF_HEADER]: csrf,
                                },
                                body: JSON.stringify({ subject, description }),
                            });
                            const body = await response.json() as { item?: ServiceRequestItem; message?: string };
                            if (!response.ok || !body.item) throw new Error(body.message ?? "Unable to submit request.");
                            setItems((current) => [body.item!, ...current]);
                            setSubject("");
                            setDescription("");
                        } catch (submitError) {
                            setError(submitError instanceof Error ? submitError.message : "Unable to submit request.");
                        } finally {
                            setPending(false);
                        }
                    }}
                >
                    <h2 className="text-xl font-semibold">New service request</h2>
                    <label className="mt-5 block">
                        <span className="text-sm font-medium">Subject</span>
                        <input
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            minLength={5}
                            maxLength={120}
                            required
                            className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                        />
                    </label>
                    <label className="mt-4 block">
                        <span className="text-sm font-medium">Description</span>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            minLength={20}
                            maxLength={4000}
                            rows={6}
                            required
                            className="mt-1 w-full resize-y rounded-xl border border-border/70 bg-background p-3 text-sm"
                        />
                    </label>
                    {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
                    <Button type="submit" className="mt-4 w-full" disabled={pending}>
                        {pending ? "Submitting..." : "Submit request"}
                    </Button>
                </form>

                <section className="rounded-3xl border border-border/70 bg-card p-6" aria-labelledby="requests-title">
                    <h2 id="requests-title" className="text-xl font-semibold">Your requests</h2>
                    {items.length === 0 ? (
                        <p className="mt-5 text-sm text-muted-foreground">No service requests yet.</p>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {items.map((item) => (
                                <article key={item.id} className="rounded-2xl border border-border/60 bg-background p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-semibold">{item.subject}</h3>
                                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{item.status}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">{item.reference}</p>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.description}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
