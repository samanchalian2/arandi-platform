"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
    createPage,
    PAGE_TEMPLATES,
    type PageTemplateKey,
} from "@/lib/admin/pages";
import { Button } from "@/components/ui/button";

import { AdminModal } from "./AdminModal";

type AdminPageCreateDialogProps = {
    open: boolean;
    onClose: () => void;
    onCreated: () => Promise<void>;
};

export function AdminPageCreateDialog({
    open,
    onClose,
    onCreated,
}: AdminPageCreateDialogProps) {
    const router = useRouter();
    const [template, setTemplate] = useState<PageTemplateKey>("standard");
    const [slug, setSlug] = useState("");
    const [route, setRoute] = useState("/");
    const [routeEdited, setRouteEdited] = useState(false);
    const [keywords, setKeywords] = useState("");
    const [enTitle, setEnTitle] = useState("");
    const [enSeoTitle, setEnSeoTitle] = useState("");
    const [enSeoDescription, setEnSeoDescription] = useState("");
    const [faTitle, setFaTitle] = useState("");
    const [faSeoTitle, setFaSeoTitle] = useState("");
    const [faSeoDescription, setFaSeoDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: () => createPage({
            slug,
            route,
            template,
            seoKeywords: keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
            translations: {
                en: {
                    title: enTitle,
                    seoTitle: enSeoTitle,
                    seoDescription: enSeoDescription,
                },
                fa: {
                    title: faTitle,
                    seoTitle: faSeoTitle,
                    seoDescription: faSeoDescription,
                },
            },
        }),
        onSuccess: async (page) => {
            setError(null);
            await onCreated();
            onClose();
            router.push(`/admin/pages/${page.slug}?lang=en`);
        },
        onError: (mutationError) => setError(
            mutationError instanceof Error ? mutationError.message : "Unable to create Page.",
        ),
    });

    const selectedTemplate = PAGE_TEMPLATES.find(({ key }) => key === template)!;

    return (
        <AdminModal
            open={open}
            title="Create bilingual Page"
            description="Every new Page starts as Draft. Starter Sections are created in the same transaction."
            onClose={() => !mutation.isPending && onClose()}
        >
            <form
                className="space-y-5"
                onSubmit={(event) => {
                    event.preventDefault();
                    setError(null);
                    mutation.mutate();
                }}
            >
                <label className="block">
                    <span className="text-sm font-medium">Editorial template</span>
                    <select value={template} onChange={(event) => setTemplate(event.target.value as PageTemplateKey)} disabled={mutation.isPending} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm">
                        {PAGE_TEMPLATES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                    <span className="mt-1 block text-xs text-muted-foreground">
                        {selectedTemplate.description} {selectedTemplate.sections.length} starter section(s).
                    </span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="text-sm font-medium">Slug</span>
                        <input
                            required
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            maxLength={100}
                            value={slug}
                            onChange={(event) => {
                                const nextSlug = event.target.value.toLowerCase();
                                setSlug(nextSlug);
                                if (!routeEdited) setRoute(nextSlug ? `/${nextSlug}` : "/");
                            }}
                            disabled={mutation.isPending}
                            className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Canonical route</span>
                        <input
                            required
                            value={route}
                            onChange={(event) => { setRoute(event.target.value.toLowerCase()); setRouteEdited(true); }}
                            disabled={mutation.isPending}
                            className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                        />
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-medium">SEO keywords (comma separated)</span>
                    <input value={keywords} onChange={(event) => setKeywords(event.target.value)} disabled={mutation.isPending} className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                </label>

                <fieldset className="rounded-2xl border border-border/70 p-4">
                    <legend className="px-1 text-sm font-semibold">English</legend>
                    <div className="space-y-3">
                        <input aria-label="English title" placeholder="Page title" required minLength={2} maxLength={160} value={enTitle} onChange={(event) => setEnTitle(event.target.value)} className="h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                        <input aria-label="English SEO title" placeholder="SEO title" required minLength={2} maxLength={160} value={enSeoTitle} onChange={(event) => setEnSeoTitle(event.target.value)} className="h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                        <textarea aria-label="English SEO description" placeholder="SEO description (20–500 characters)" required minLength={20} maxLength={500} rows={3} value={enSeoDescription} onChange={(event) => setEnSeoDescription(event.target.value)} className="w-full rounded-xl border border-border/70 bg-background p-3 text-sm" />
                    </div>
                </fieldset>
                <fieldset dir="rtl" className="rounded-2xl border border-border/70 p-4">
                    <legend className="px-1 text-sm font-semibold">فارسی</legend>
                    <div className="space-y-3">
                        <input aria-label="عنوان فارسی" placeholder="عنوان صفحه" required minLength={2} maxLength={160} value={faTitle} onChange={(event) => setFaTitle(event.target.value)} className="h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                        <input aria-label="عنوان سئوی فارسی" placeholder="عنوان سئو" required minLength={2} maxLength={160} value={faSeoTitle} onChange={(event) => setFaSeoTitle(event.target.value)} className="h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm" />
                        <textarea aria-label="توضیح سئوی فارسی" placeholder="توضیح سئو، ۲۰ تا ۵۰۰ نویسه" required minLength={20} maxLength={500} rows={3} value={faSeoDescription} onChange={(event) => setFaSeoDescription(event.target.value)} className="w-full rounded-xl border border-border/70 bg-background p-3 text-sm" />
                    </div>
                </fieldset>
                {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create Draft"}</Button>
                </div>
            </form>
        </AdminModal>
    );
}
