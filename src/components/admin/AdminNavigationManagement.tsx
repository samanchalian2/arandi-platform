"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cmsFetch } from "@/lib/admin/cms-fetch";

import { AdminDeleteConfirmDialog } from "./AdminDeleteConfirmDialog";
import { AdminModal } from "./AdminModal";
import { AdminToolbar } from "./AdminToolbar";

type NavigationItem = {
    id: string;
    key: string;
    href: string;
    order: number;
    isExternal: boolean;
    openInNewTab: boolean;
    translations: Array<{ languageCode: string; label: string }>;
};

type NavigationPayload = {
    key: string;
    href: string;
    isExternal: boolean;
    openInNewTab: boolean;
    translations: { en: { label: string }; fa: { label: string } };
};

type ApiEnvelope<T> = {
    ok: boolean;
    data?: T;
    error?: { message?: string };
};

async function readEnvelope<T>(response: Response): Promise<T> {
    const body = await response.json() as ApiEnvelope<T>;
    if (!response.ok || !body.ok || body.data === undefined) {
        throw new Error(body.error?.message ?? "Navigation request failed.");
    }
    return body.data;
}

function labelFor(item: NavigationItem, language: "en" | "fa") {
    return item.translations.find(({ languageCode }) => languageCode === language)?.label ?? "";
}

function NavigationEditor({
    item,
    canStructure,
    pending,
    onCancel,
    onSubmit,
}: {
    item: NavigationItem | null;
    canStructure: boolean;
    pending: boolean;
    onCancel: () => void;
    onSubmit: (payload: NavigationPayload) => void;
}) {
    const [key, setKey] = useState(item?.key ?? "");
    const [href, setHref] = useState(item?.href ?? "/");
    const [isExternal, setIsExternal] = useState(item?.isExternal ?? false);
    const [openInNewTab, setOpenInNewTab] = useState(item?.openInNewTab ?? false);
    const [enLabel, setEnLabel] = useState(item ? labelFor(item, "en") : "");
    const [faLabel, setFaLabel] = useState(item ? labelFor(item, "fa") : "");

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit({
                    key,
                    href,
                    isExternal,
                    openInNewTab,
                    translations: {
                        en: { label: enLabel },
                        fa: { label: faLabel },
                    },
                });
            }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-medium">Key</span>
                    <input required pattern="[a-z][a-z0-9_-]{1,63}" disabled={!canStructure || pending} value={key} onChange={(event) => setKey(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm disabled:opacity-60" />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Destination</span>
                    <input required disabled={!canStructure || pending} value={href} onChange={(event) => setHref(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm disabled:opacity-60" />
                </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-medium">English label</span>
                    <input required maxLength={100} disabled={pending} value={enLabel} onChange={(event) => setEnLabel(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                </label>
                <label className="block" dir="rtl">
                    <span className="text-sm font-medium">برچسب فارسی</span>
                    <input required maxLength={100} disabled={pending} value={faLabel} onChange={(event) => setFaLabel(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                </label>
            </div>
            <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" disabled={!canStructure || pending} checked={isExternal} onChange={(event) => setIsExternal(event.target.checked)} />
                    External HTTPS link
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" disabled={!canStructure || pending} checked={openInNewTab} onChange={(event) => setOpenInNewTab(event.target.checked)} />
                    Open in new tab
                </label>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
                <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
            </div>
        </form>
    );
}

export function AdminNavigationManagement({
    canStructure,
    canTranslate,
    canDelete,
}: {
    canStructure: boolean;
    canTranslate: boolean;
    canDelete: boolean;
}) {
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<NavigationItem | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<NavigationItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    const navigationQuery = useQuery({
        queryKey: ["admin-navigation"],
        queryFn: async () => readEnvelope<NavigationItem[]>(
            await fetch("/api/cms/navigation?lang=en", { cache: "no-store" }),
        ),
    });
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-navigation"] });

    const saveMutation = useMutation({
        mutationFn: async (payload: NavigationPayload) => {
            const translatingOnly = selected && !canStructure;
            return readEnvelope<NavigationItem>(await cmsFetch(
                selected ? `/api/cms/navigation/${selected.id}?lang=en` : "/api/cms/navigation?lang=en",
                {
                    method: selected ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(translatingOnly ? { translations: payload.translations } : payload),
                },
            ));
        },
        onSuccess: async () => {
            setEditorOpen(false);
            setSelected(null);
            setError(null);
            await invalidate();
        },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Unable to save navigation."),
    });
    const reorderMutation = useMutation({
        mutationFn: async (items: NavigationItem[]) => readEnvelope<NavigationItem[]>(
            await cmsFetch("/api/cms/navigation/reorder?lang=en", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map(({ id }, index) => ({ id, order: index + 1 })),
                }),
            }),
        ),
        onSuccess: async () => { setError(null); await invalidate(); },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Unable to reorder navigation."),
    });
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => readEnvelope<{ id: string }>(
            await cmsFetch(`/api/cms/navigation/${id}`, { method: "DELETE" }),
        ),
        onSuccess: async () => { setDeleteTarget(null); setError(null); await invalidate(); },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Unable to delete navigation."),
    });

    const items = navigationQuery.data ?? [];
    const move = (index: number, delta: number) => {
        const destination = index + delta;
        if (destination < 0 || destination >= items.length) return;
        const next = [...items];
        [next[index], next[destination]] = [next[destination], next[index]];
        reorderMutation.mutate(next);
    };

    return (
        <div className="space-y-5">
            <AdminToolbar
                title="Navigation"
                description="Ordered global menu with independent English and Persian labels."
                actions={canStructure ? (
                    <Button onClick={() => { setSelected(null); setEditorOpen(true); setError(null); }}>
                        <Plus aria-hidden="true" /> Add item
                    </Button>
                ) : null}
            />
            {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            {navigationQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading navigation…</p> : null}
            {navigationQuery.error ? <p role="alert" className="text-sm text-destructive">{navigationQuery.error.message}</p> : null}
            <div className="space-y-3">
                {items.map((item, index) => (
                    <article key={item.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-semibold">{labelFor(item, "en")}</h2>
                                    <span dir="rtl" className="text-sm text-muted-foreground">{labelFor(item, "fa")}</span>
                                    {item.isExternal ? <ExternalLink className="size-4 text-muted-foreground" aria-label="External link" /> : null}
                                </div>
                                <p className="mt-1 break-all text-xs text-muted-foreground">{item.key} · {item.href}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {canStructure ? (
                                    <>
                                        <Button size="icon-sm" variant="outline" aria-label={`Move ${labelFor(item, "en")} up`} disabled={index === 0 || reorderMutation.isPending} onClick={() => move(index, -1)}><ArrowUp /></Button>
                                        <Button size="icon-sm" variant="outline" aria-label={`Move ${labelFor(item, "en")} down`} disabled={index === items.length - 1 || reorderMutation.isPending} onClick={() => move(index, 1)}><ArrowDown /></Button>
                                    </>
                                ) : null}
                                {canTranslate ? <Button size="sm" variant="outline" onClick={() => { setSelected(item); setEditorOpen(true); setError(null); }}><Pencil /> Edit</Button> : null}
                                {canDelete ? <Button size="icon-sm" variant="destructive" aria-label={`Delete ${labelFor(item, "en")}`} onClick={() => setDeleteTarget(item)}><Trash2 /></Button> : null}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
            <AdminModal open={editorOpen} title={selected ? "Edit navigation item" : "Add navigation item"} description={canStructure ? "Structure and both locale labels are editable." : "Translation-only access; structure is locked."} onClose={() => !saveMutation.isPending && setEditorOpen(false)}>
                <NavigationEditor key={selected?.id ?? "new"} item={selected} canStructure={canStructure} pending={saveMutation.isPending} onCancel={() => setEditorOpen(false)} onSubmit={(payload) => saveMutation.mutate(payload)} />
            </AdminModal>
            <AdminDeleteConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete navigation item?"
                description={deleteTarget ? `Delete “${labelFor(deleteTarget, "en")}” and both translations?` : ""}
                deleting={deleteMutation.isPending}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            />
        </div>
    );
}
