"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth/csrf";
import { MANAGEABLE_ROLE_KEYS } from "@/lib/admin/users/types";
import { Button } from "@/components/ui/button";

import { AdminModal } from "./AdminModal";
import { AdminToolbar } from "./AdminToolbar";

type ManagedUser = {
    id: string;
    displayName: string;
    email: string | null;
    phoneE164: string | null;
    status: string;
    lastLoginAt: string | null;
    lockedUntil: string | null;
    roles: Array<{ key: string; name: string }>;
    activeSessionCount: number;
};

type SecurityEventItem = {
    id: string;
    createdAt: string;
    eventType: string;
    outcome: string;
    user: {
        displayName: string;
        email: string | null;
        phoneE164: string | null;
    } | null;
};

type UserPayload = {
    displayName: string;
    email: string;
    phone: string;
    status: "active" | "suspended";
    roleKeys: string[];
    password?: string;
};

function cookieValue(name: string): string | null {
    const prefix = `${encodeURIComponent(name)}=`;
    const part = document.cookie.split("; ").find((item) => item.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : null;
}

async function responseJson<T>(response: Response): Promise<T> {
    const body = await response.json() as T & { message?: string };
    if (!response.ok) throw new Error(body.message ?? "Request failed.");
    return body;
}

function UserEditor({
    user,
    pending,
    onCancel,
    onSubmit,
}: {
    user: ManagedUser | null;
    pending: boolean;
    onCancel: () => void;
    onSubmit: (payload: UserPayload) => void;
}) {
    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [phone, setPhone] = useState(user?.phoneE164 ?? "");
    const [status, setStatus] = useState<"active" | "suspended">(
        user?.status === "suspended" ? "suspended" : "active",
    );
    const [roleKeys, setRoleKeys] = useState<string[]>(
        user?.roles.map(({ key }) => key) ?? ["Customer"],
    );
    const [password, setPassword] = useState("");

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit({
                    displayName,
                    email,
                    phone,
                    status,
                    roleKeys,
                    ...(!user && password ? { password } : {}),
                });
            }}
        >
            <label className="block">
                <span className="text-sm font-medium">Display name</span>
                <input required minLength={2} maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Iranian mobile</span>
                    <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                </label>
            </div>
            {!user ? (
                <label className="block">
                    <span className="text-sm font-medium">Initial password (optional)</span>
                    <input type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                </label>
            ) : (
                <label className="block">
                    <span className="text-sm font-medium">Status</span>
                    <select value={status} onChange={(event) => setStatus(event.target.value as "active" | "suspended")} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm">
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </label>
            )}
            <fieldset>
                <legend className="text-sm font-medium">Roles</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {MANAGEABLE_ROLE_KEYS.map((role) => (
                        <label key={role} className="flex items-center gap-2 rounded-xl border border-border/60 p-2 text-sm">
                            <input
                                type="checkbox"
                                checked={roleKeys.includes(role)}
                                onChange={(event) => setRoleKeys((current) =>
                                    event.target.checked
                                        ? [...current, role]
                                        : current.filter((item) => item !== role))}
                            />
                            {role}
                        </label>
                    ))}
                </div>
            </fieldset>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
                <Button type="submit" disabled={pending || roleKeys.length === 0}>
                    {pending ? "Saving..." : user ? "Save changes" : "Create user"}
                </Button>
            </div>
        </form>
    );
}

export function AdminUsersManagement({ canManage }: { canManage: boolean }) {
    const queryClient = useQueryClient();
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const [role, setRole] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const [selected, setSelected] = useState<ManagedUser | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const usersQuery = useQuery({
        queryKey: ["admin-users", query, status, role],
        queryFn: async () => {
            const params = new URLSearchParams({ pageSize: "100" });
            if (query) params.set("query", query);
            if (status) params.set("status", status);
            if (role) params.set("role", role);
            return responseJson<{ items: ManagedUser[]; total: number }>(
                await fetch(`/api/admin/users?${params}`, { cache: "no-store" }),
            );
        },
    });
    const eventsQuery = useQuery({
        queryKey: ["admin-security-events"],
        queryFn: async () => responseJson<{ items: SecurityEventItem[] }>(
            await fetch("/api/admin/security-events?pageSize=20", { cache: "no-store" }),
        ),
    });

    const saveMutation = useMutation({
        mutationFn: async (payload: UserPayload) => {
            const csrf = cookieValue(CSRF_COOKIE);
            if (!csrf) throw new Error("A production session is required for user changes.");
            return responseJson<{ item: ManagedUser }>(await fetch(
                selected ? `/api/admin/users/${selected.id}` : "/api/admin/users",
                {
                    method: selected ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json", [CSRF_HEADER]: csrf },
                    body: JSON.stringify(payload),
                },
            ));
        },
        onSuccess: async () => {
            setEditorOpen(false);
            setSelected(null);
            setActionError(null);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-security-events"] }),
            ]);
        },
        onError: (error) => setActionError(error instanceof Error ? error.message : "Unable to save user."),
    });

    const revokeMutation = useMutation({
        mutationFn: async (userId: string) => {
            const csrf = cookieValue(CSRF_COOKIE);
            if (!csrf) throw new Error("A production session is required.");
            return responseJson<{ revokedCount: number }>(await fetch(
                `/api/admin/users/${userId}/sessions/revoke`,
                { method: "POST", headers: { [CSRF_HEADER]: csrf } },
            ));
        },
        onSuccess: async () => {
            setActionError(null);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-security-events"] }),
            ]);
        },
        onError: (error) => setActionError(error instanceof Error ? error.message : "Unable to revoke sessions."),
    });

    return (
        <div className="space-y-6">
            <AdminToolbar
                title="Users & security"
                description="Persistent users, roles, session state, and minimized security audit events."
                actions={canManage ? (
                    <Button onClick={() => { setSelected(null); setEditorOpen(true); setActionError(null); }}>
                        Create user
                    </Button>
                ) : null}
            />
            {!canManage ? (
                <p className="rounded-xl border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                    Read-only access. User mutations require a persistent SuperAdmin session.
                </p>
            ) : null}
            {actionError ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{actionError}</p> : null}

            <div className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
                <input aria-label="Search users" placeholder="Search name, email, mobile" value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm" />
                <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm">
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
                <select aria-label="Filter by role" value={role} onChange={(event) => setRole(event.target.value)} className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm">
                    <option value="">All roles</option>
                    {MANAGEABLE_ROLE_KEYS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
            </div>

            <section aria-labelledby="users-list-title">
                <h2 id="users-list-title" className="mb-3 text-lg font-semibold">
                    Users {usersQuery.data ? `(${usersQuery.data.total})` : ""}
                </h2>
                {usersQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading users…</p> : null}
                {usersQuery.error ? <p role="alert" className="text-sm text-destructive">{usersQuery.error.message}</p> : null}
                <div className="grid gap-3 lg:grid-cols-2">
                    {usersQuery.data?.items.map((user) => (
                        <article key={user.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)]">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate font-semibold">{user.displayName}</h3>
                                    <p className="mt-1 break-all text-xs text-muted-foreground">{user.email ?? user.phoneE164 ?? "No identifier"}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                                    {user.status}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {user.roles.map(({ key }) => key).join(", ")} · {user.activeSessionCount} active session(s)
                            </p>
                            {user.lockedUntil ? <p className="mt-1 text-xs text-destructive">Credential temporarily locked</p> : null}
                            {canManage ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" onClick={() => { setSelected(user); setEditorOpen(true); setActionError(null); }}>Edit</Button>
                                    <Button size="sm" variant="destructive" disabled={revokeMutation.isPending || user.activeSessionCount === 0} onClick={() => revokeMutation.mutate(user.id)}>Revoke sessions</Button>
                                </div>
                            ) : null}
                        </article>
                    ))}
                </div>
            </section>

            <section aria-labelledby="security-events-title">
                <h2 id="security-events-title" className="mb-3 text-lg font-semibold">Recent security events</h2>
                <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                    <table className="min-w-full divide-y divide-border/70 text-sm">
                        <thead className="bg-muted/40"><tr><th className="px-4 py-3 text-start">Time</th><th className="px-4 py-3 text-start">Event</th><th className="px-4 py-3 text-start">User</th><th className="px-4 py-3 text-start">Outcome</th></tr></thead>
                        <tbody className="divide-y divide-border/50">
                            {eventsQuery.data?.items.map((event) => (
                                <tr key={event.id}>
                                    <td className="whitespace-nowrap px-4 py-3">{new Date(event.createdAt).toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-4 py-3">{event.eventType}</td>
                                    <td className="px-4 py-3">{event.user?.displayName ?? "Unknown/removed"}</td>
                                    <td className="px-4 py-3">{event.outcome}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <AdminModal
                open={editorOpen}
                title={selected ? "Edit user" : "Create user"}
                description="Identifiers must be unique. Role and status changes are audited."
                onClose={() => { if (!saveMutation.isPending) setEditorOpen(false); }}
            >
                <UserEditor
                    key={selected?.id ?? "new"}
                    user={selected}
                    pending={saveMutation.isPending}
                    onCancel={() => setEditorOpen(false)}
                    onSubmit={(payload) => saveMutation.mutate(payload)}
                />
            </AdminModal>
        </div>
    );
}
