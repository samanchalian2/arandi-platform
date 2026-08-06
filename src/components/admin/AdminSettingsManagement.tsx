"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cmsFetch } from "@/lib/admin/cms-fetch";

import { AdminToolbar } from "./AdminToolbar";

type SettingItem = {
    id: string;
    key: string;
    value: Record<string, unknown> | null;
    group: string | null;
    isPublic: boolean;
    redacted: boolean;
    updatedAt: string;
};

type ApiEnvelope<T> = { ok: boolean; data?: T; error?: { message?: string } };

async function readEnvelope<T>(response: Response): Promise<T> {
    const body = await response.json() as ApiEnvelope<T>;
    if (!response.ok || !body.ok || body.data === undefined) {
        throw new Error(body.error?.message ?? "Settings request failed.");
    }
    return body.data;
}

function SettingEditor({ setting }: { setting: SettingItem }) {
    const queryClient = useQueryClient();
    const [value, setValue] = useState(JSON.stringify(setting.value ?? {}, null, 2));
    const [error, setError] = useState<string | null>(null);
    const mutation = useMutation({
        mutationFn: async () => readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: setting.key, value: JSON.parse(value) }),
        })),
        onSuccess: async () => {
            setError(null);
            await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
        },
        onError: (mutationError) => setError(
            mutationError instanceof SyntaxError
                ? "Value must be valid JSON."
                : mutationError instanceof Error
                    ? mutationError.message
                    : "Unable to save setting.",
        ),
    });

    return (
        <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2 className="font-semibold">{setting.key}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{setting.group ?? "ungrouped"} · {setting.isPublic ? "Public allowlist" : "Private"}</p>
                </div>
                {setting.redacted ? <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs text-destructive">Redacted</span> : null}
            </div>
            <textarea aria-label={`${setting.key} JSON`} disabled={setting.redacted} value={value} onChange={(event) => setValue(event.target.value)} rows={6} spellCheck={false} className="mt-4 w-full resize-y rounded-xl border border-border/70 bg-background p-3 font-mono text-xs leading-5 disabled:opacity-60" />
            {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
            <div className="mt-3 flex justify-end">
                <Button size="sm" disabled={setting.redacted || mutation.isPending} onClick={() => mutation.mutate()}>
                    {mutation.isPending ? "Saving..." : "Save"}
                </Button>
            </div>
        </article>
    );
}

export function AdminSettingsManagement() {
    const settingsQuery = useQuery({
        queryKey: ["admin-settings"],
        queryFn: async () => readEnvelope<SettingItem[]>(
            await fetch("/api/cms/settings", { cache: "no-store" }),
        ),
    });
    return (
        <div className="space-y-5">
            <AdminToolbar title="Settings" description="Governed public settings and allowlisted non-secret runtime choices. Credentials remain server-only and are never exposed." />
            {settingsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading settings…</p> : null}
            {settingsQuery.error ? <p role="alert" className="text-sm text-destructive">{settingsQuery.error.message}</p> : null}
            <div className="grid gap-4 lg:grid-cols-2">
                {settingsQuery.data?.map((setting) => <SettingEditor key={setting.id} setting={setting} />)}
            </div>
        </div>
    );
}
