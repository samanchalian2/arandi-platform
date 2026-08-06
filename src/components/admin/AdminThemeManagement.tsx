"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cmsFetch } from "@/lib/admin/cms-fetch";

import { AdminToolbar } from "./AdminToolbar";

type ThemeData = {
    id: string;
    slug: string;
    name: string;
    isDefault: boolean;
    colors: Record<string, string>;
    typography: Record<string, string>;
    spacing: Record<string, string>;
    radius: Record<string, string>;
    shadows: Record<string, string>;
    semanticTokens: Record<string, string>;
    componentOverrides: Record<string, Record<string, string>>;
};

type ApiEnvelope<T> = { ok: boolean; data?: T; error?: { message?: string } };

async function readEnvelope<T>(response: Response): Promise<T> {
    const body = await response.json() as ApiEnvelope<T>;
    if (!response.ok || !body.ok || body.data === undefined) {
        throw new Error(body.error?.message ?? "Theme request failed.");
    }
    return body.data;
}

function stringify(value: unknown) {
    return JSON.stringify(value ?? {}, null, 2);
}

function ThemeEditor({ theme }: { theme: ThemeData }) {
    const queryClient = useQueryClient();
    const [name, setName] = useState(theme.name);
    const [fields, setFields] = useState({
        colors: stringify(theme.colors),
        typography: stringify(theme.typography),
        spacing: stringify(theme.spacing),
        radius: stringify(theme.radius),
        shadows: stringify(theme.shadows),
        semanticTokens: stringify(theme.semanticTokens),
        componentOverrides: stringify(theme.componentOverrides),
    });
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async () => {
            const parsed = Object.fromEntries(
                Object.entries(fields).map(([key, value]) => [key, JSON.parse(value)]),
            );
            return readEnvelope<ThemeData>(await cmsFetch("/api/cms/theme", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: theme.id,
                    slug: theme.slug,
                    name,
                    isDefault: true,
                    ...parsed,
                }),
            }));
        },
        onSuccess: async () => {
            setError(null);
            await queryClient.invalidateQueries({ queryKey: ["admin-theme"] });
        },
        onError: (mutationError) => setError(
            mutationError instanceof SyntaxError
                ? "Every token field must contain valid JSON."
                : mutationError instanceof Error
                    ? mutationError.message
                    : "Unable to save theme.",
        ),
    });

    return (
        <form onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }} className="space-y-5">
            <label className="block rounded-2xl border border-border/70 bg-card p-4">
                <span className="text-sm font-medium">Theme name</span>
                <input value={name} minLength={2} maxLength={100} required onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                <span className="mt-2 block text-xs text-muted-foreground">Slug: {theme.slug} · Default theme</span>
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
                {(Object.keys(fields) as Array<keyof typeof fields>).map((field) => (
                    <label key={field} className="block rounded-2xl border border-border/70 bg-card p-4">
                        <span className="text-sm font-semibold">{field}</span>
                        <textarea
                            aria-label={`${field} JSON`}
                            value={fields[field]}
                            onChange={(event) => setFields((current) => ({ ...current, [field]: event.target.value }))}
                            rows={field === "componentOverrides" ? 8 : 6}
                            spellCheck={false}
                            className="mt-2 w-full resize-y rounded-xl border border-border/70 bg-background p-3 font-mono text-xs leading-5"
                        />
                    </label>
                ))}
            </div>
            {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            <div className="sticky bottom-4 flex justify-end rounded-2xl border border-border/70 bg-card/95 p-3 shadow-[var(--elevation-2)] backdrop-blur">
                <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save theme"}</Button>
            </div>
        </form>
    );
}

export function AdminThemeManagement() {
    const themeQuery = useQuery({
        queryKey: ["admin-theme"],
        queryFn: async () => readEnvelope<ThemeData>(
            await fetch("/api/cms/theme", { cache: "no-store" }),
        ),
    });
    return (
        <div className="space-y-5">
            <AdminToolbar title="Theme" description="Constrained default-theme tokens. Unsafe CSS constructs are rejected by the API." />
            {themeQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading theme…</p> : null}
            {themeQuery.error ? <p role="alert" className="text-sm text-destructive">{themeQuery.error.message}</p> : null}
            {themeQuery.data ? <ThemeEditor key={themeQuery.data.id} theme={themeQuery.data} /> : null}
        </div>
    );
}
