"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cmsFetch } from "@/lib/admin/cms-fetch";

import { AdminToolbar } from "./AdminToolbar";
import { ScrollwiseThemeSettings } from "./ScrollwiseThemeSettings";

type ThemeData = {
    id: string; slug: string; name: string; isDefault: boolean;
    colors: Record<string, string>; typography: Record<string, string>; spacing: Record<string, string>;
    radius: Record<string, string>; shadows: Record<string, string>; semanticTokens: Record<string, string>;
    componentOverrides: Record<string, Record<string, string>>;
};

type ApiEnvelope<T> = { ok: boolean; data?: T; error?: { message?: string } };

async function readEnvelope<T>(response: Response): Promise<T> {
    const body = await response.json() as ApiEnvelope<T>;
    if (!response.ok || !body.ok || body.data === undefined) throw new Error(body.error?.message ?? "Theme request failed.");
    return body.data;
}

function stringify(value: unknown) { return JSON.stringify(value ?? {}, null, 2); }

function ThemeEditor({ theme }: { theme: ThemeData }) {
    const queryClient = useQueryClient();
    const [name, setName] = useState(theme.name);
    const [fields, setFields] = useState({ colors: stringify(theme.colors), typography: stringify(theme.typography), spacing: stringify(theme.spacing), radius: stringify(theme.radius), shadows: stringify(theme.shadows), semanticTokens: stringify(theme.semanticTokens), componentOverrides: stringify(theme.componentOverrides) });
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async () => {
            const parsed = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, JSON.parse(value)]));
            return readEnvelope<ThemeData>(await cmsFetch("/api/cms/theme", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: theme.id, slug: theme.slug, name, isDefault: theme.isDefault, ...parsed }) }));
        },
        onSuccess: async () => { setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-themes"] }); },
        onError: (mutationError) => setError(mutationError instanceof SyntaxError ? "Every token field must contain valid JSON." : mutationError instanceof Error ? mutationError.message : "Unable to save theme."),
    });

    return <div className="space-y-8">
    <form onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }} className="space-y-5">
        <label className="block rounded-2xl border border-border/70 bg-card p-4"><span className="text-sm font-medium">Theme name</span><input value={name} minLength={2} maxLength={100} required onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" /><span className="mt-2 block text-xs text-muted-foreground">Slug: {theme.slug} {theme.isDefault ? "- Published public theme" : "- Draft public theme"}</span></label>
        <div className="grid gap-4 lg:grid-cols-2">{(Object.keys(fields) as Array<keyof typeof fields>).map((field) => <label key={field} className="block rounded-2xl border border-border/70 bg-card p-4"><span className="text-sm font-semibold">{field}</span><textarea aria-label={`${field} JSON`} value={fields[field]} onChange={(event) => setFields((current) => ({ ...current, [field]: event.target.value }))} rows={field === "componentOverrides" ? 8 : 6} spellCheck={false} className="mt-2 w-full resize-y rounded-xl border border-border/70 bg-background p-3 font-mono text-xs leading-5" /></label>)}</div>
        {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        <div className="sticky bottom-4 flex justify-end rounded-2xl border border-border/70 bg-card/95 p-3 shadow-[var(--elevation-2)] backdrop-blur"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save theme"}</Button></div>
    </form>
    {theme.slug === "scrollwise" ? <ScrollwiseThemeSettings /> : null}
    </div>;
}

export function AdminThemeManagement() {
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const themeQuery = useQuery({ queryKey: ["admin-themes"], queryFn: async () => readEnvelope<ThemeData[]>(await fetch("/api/cms/themes", { cache: "no-store" })) });
    const themes = themeQuery.data ?? [];
    const selectedTheme = themes.find((theme) => theme.slug === selectedSlug) ?? themes[0];
    const refresh = async () => queryClient.invalidateQueries({ queryKey: ["admin-themes"] });
    const publish = useMutation({ mutationFn: async (slug: string) => readEnvelope<ThemeData>(await cmsFetch("/api/cms/themes/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) })), onSuccess: refresh });
    const preview = useMutation({ mutationFn: async (slug: string | null) => readEnvelope<{ previewing: string | null }>(await cmsFetch("/api/cms/themes/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) })) });
    const operationError = publish.error ?? preview.error;

    return <div className="space-y-5">
        <AdminToolbar title="Public themes" description="Edit tokens safely, preview privately for 30 minutes, then publish one global public theme. Admin screens never inherit these tokens." />
        {themeQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading themes...</p> : null}
        {themeQuery.error ? <p role="alert" className="text-sm text-destructive">{themeQuery.error.message}</p> : null}
        {themes.length > 0 ? <>
            <div className="grid gap-4 md:grid-cols-2">{themes.map((theme) => <article key={theme.id} className={`rounded-2xl border p-5 ${selectedTheme?.id === theme.id ? "border-primary bg-primary/5" : "border-border/70 bg-card"}`}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-foreground">{theme.name}</h2><p className="mt-1 text-xs text-muted-foreground">{theme.slug}</p></div>{theme.isDefault ? <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">Published</span> : <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Draft</span>}</div><div className="mt-5 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setSelectedSlug(theme.slug)}>Edit</Button><Button type="button" variant="outline" size="sm" disabled={preview.isPending} onClick={() => preview.mutate(theme.slug, { onSuccess: () => window.open("/?lang=fa", "_blank", "noopener") })}>Preview</Button>{theme.isDefault ? <Button type="button" variant="ghost" size="sm" disabled={preview.isPending} onClick={() => preview.mutate(null)}>Stop preview</Button> : <Button type="button" size="sm" disabled={publish.isPending} onClick={() => { if (window.confirm(`Publish ${theme.name} for all public visitors?`)) publish.mutate(theme.slug); }}>Publish</Button>}</div></article>)}</div>
            {operationError ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{operationError instanceof Error ? operationError.message : "Unable to update theme state."}</p> : null}
            {selectedTheme ? <ThemeEditor key={selectedTheme.id} theme={selectedTheme} /> : null}
        </> : null}
    </div>;
}
