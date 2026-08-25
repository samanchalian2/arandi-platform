"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cmsFetch } from "@/lib/admin/cms-fetch";
import { useMedia } from "@/lib/admin/media";

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
    if (setting.key === "contact.notifications") return <ContactNotificationSettingEditor setting={setting} />;
    if (setting.key === "site.social") return <SocialSettingEditor setting={setting} />;
    if (setting.key === "site.heroMedia") return <HeroMediaSettingEditor setting={setting} />;
    if (setting.key === "site.scrollwiseScenes") return <ScrollwiseScenesSettingEditor setting={setting} />;
    return <GenericSettingEditor setting={setting} />;
}

function ContactNotificationSettingEditor({ setting }: { setting: SettingItem }) {
    const queryClient = useQueryClient();
    const initial = setting.value ?? {};
    const [recipient, setRecipient] = useState(typeof initial.recipient === "string" ? initial.recipient : "info@arandi.io");
    const [error, setError] = useState<string | null>(null);
    const mutation = useMutation({
        mutationFn: async () => readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: setting.key, value: { recipient } }) })),
        onSuccess: async () => { setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-settings"] }); },
        onError: (value) => setError(value instanceof Error ? value.message : "Unable to save recipient."),
    });
    return <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)]"><h2 className="font-semibold">Contact notifications</h2><p className="mt-1 text-xs text-muted-foreground">Private destination for new contact-form notifications. SMTP credentials remain server-only.</p><label className="mt-4 grid gap-1.5 text-sm font-medium">Recipient email<input type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} required maxLength={254} className="h-10 rounded-xl border border-border/70 bg-background px-3" /></label>{error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}<div className="mt-4 flex justify-end"><Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : "Save recipient"}</Button></div></article>;
}

const scrollwiseSceneOptions = [
    { key: "gateway", label: "01 · Transformation gateway" },
    { key: "discover", label: "02 · Discover" },
    { key: "design", label: "03 · Design" },
    { key: "buildSecure", label: "04 · Build & secure" },
    { key: "oilGas", label: "05 · Oil & gas" },
    { key: "petrochemical", label: "06 · Petrochemicals" },
    { key: "connectedOperations", label: "07 · Connected energy" },
    { key: "intelligence", label: "08 · Intelligent enterprise" },
    { key: "outcomes", label: "09 · Durable outcomes" },
] as const;

type ScrollwiseSceneKey = typeof scrollwiseSceneOptions[number]["key"];
type ScrollwiseSceneValue = Record<ScrollwiseSceneKey, { desktopUrl: string; mobileUrl: string }>;

function ScrollwiseScenesSettingEditor({ setting }: { setting: SettingItem }) {
    const queryClient = useQueryClient();
    const media = useMedia({ search: "", type: "all", sortBy: "updatedAt", sortDirection: "desc", page: 1, pageSize: 100 });
    const images = media.items.filter((item) => item.type.toLowerCase().startsWith("image/"));
    const initial = setting.value ?? {};
    const [scenes, setScenes] = useState<ScrollwiseSceneValue>(() => Object.fromEntries(
        scrollwiseSceneOptions.map(({ key }) => {
            const value = initial[key];
            const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
            return [key, {
                desktopUrl: typeof record.desktopUrl === "string" ? record.desktopUrl : "",
                mobileUrl: typeof record.mobileUrl === "string" ? record.mobileUrl : "",
            }];
        }),
    ) as ScrollwiseSceneValue);
    const [error, setError] = useState<string | null>(null);
    const mutation = useMutation({
        mutationFn: async () => readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: setting.key, value: scenes }),
        })),
        onSuccess: async () => { setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-settings"] }); },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Unable to save Scrollwise scenes."),
    });
    const updateScene = (key: ScrollwiseSceneKey, field: "desktopUrl" | "mobileUrl", url: string) => {
        setScenes((current) => ({ ...current, [key]: { ...current[key], [field]: url } }));
    };
    const isComplete = scrollwiseSceneOptions.every(({ key }) => scenes[key].desktopUrl && scenes[key].mobileUrl);

    return (
        <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)] lg:col-span-2">
            <h2 className="font-semibold">Scrollwise narrative scenes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Select a 32:9 desktop panorama and a separately art-directed mobile image for each fixed story chapter. Only safe local Media Library paths are accepted.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {scrollwiseSceneOptions.map(({ key, label }) => <fieldset key={key} className="rounded-xl border border-border/70 p-3">
                    <legend className="px-1 text-sm font-semibold">{label}</legend>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {(["desktopUrl", "mobileUrl"] as const).map((field) => <label key={field} className="grid gap-1.5 text-xs font-medium">{field === "desktopUrl" ? "Desktop" : "Mobile"}
                            <select value={scenes[key][field]} onChange={(event) => updateScene(key, field, event.target.value)} className="h-10 min-w-0 rounded-xl border border-border/70 bg-background px-2 text-xs">
                                <option value="">Select image…</option>
                                {scenes[key][field] && !images.some((item) => item.url === scenes[key][field]) ? <option value={scenes[key][field]}>{scenes[key][field]}</option> : null}
                                {images.map((item) => <option key={item.id} value={item.url}>{item.title}</option>)}
                            </select>
                        </label>)}
                    </div>
                </fieldset>)}
            </div>
            {media.isLoading ? <p className="mt-3 text-xs text-muted-foreground">Loading Media Library…</p> : null}
            {media.isError ? <p role="alert" className="mt-3 text-xs text-destructive">Media Library could not be loaded.</p> : null}
            {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
            <div className="mt-4 flex justify-end"><Button size="sm" disabled={mutation.isPending || !isComplete} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : "Save Scrollwise scenes"}</Button></div>
        </article>
    );
}

function GenericSettingEditor({ setting }: { setting: SettingItem }) {
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

type SocialKey = "instagram" | "telegram" | "whatsapp" | "bale";
const socialNetworks: Array<{ key: SocialKey; label: string; placeholder: string }> = [
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
    { key: "telegram", label: "Telegram", placeholder: "https://t.me/…" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/…" },
    { key: "bale", label: "Bale", placeholder: "https://ble.ir/…" },
];

function SocialSettingEditor({ setting }: { setting: SettingItem }) {
    const queryClient = useQueryClient();
    const initial = setting.value ?? {};
    const [links, setLinks] = useState<Record<SocialKey, string>>({
        instagram: typeof initial.instagram === "string" ? initial.instagram : "",
        telegram: typeof initial.telegram === "string" ? initial.telegram : "",
        whatsapp: typeof initial.whatsapp === "string" ? initial.whatsapp : "",
        bale: typeof initial.bale === "string" ? initial.bale : "",
    });
    const [error, setError] = useState<string | null>(null);
    const mutation = useMutation({
        mutationFn: async () => readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: setting.key, value: links }),
        })),
        onSuccess: async () => { setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-settings"] }); },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Unable to save social links."),
    });
    return (
        <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)]">
            <h2 className="font-semibold">Social links</h2>
            <p className="mt-1 text-xs text-muted-foreground">Public Footer links. Leave a field empty to show its icon as unavailable.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {socialNetworks.map((network) => <label key={network.key} className="grid gap-1.5 text-sm font-medium">{network.label}
                    <input type="url" inputMode="url" value={links[network.key]} onChange={(event) => setLinks({ ...links, [network.key]: event.target.value })} placeholder={network.placeholder} className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm" />
                </label>)}
            </div>
            {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
            <div className="mt-4 flex justify-end"><Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : "Save social links"}</Button></div>
        </article>
    );
}

function HeroMediaSettingEditor({ setting }: { setting: SettingItem }) {
    const queryClient = useQueryClient();
    const media = useMedia({ search: "", type: "all", sortBy: "updatedAt", sortDirection: "desc", page: 1, pageSize: 100 });
    const initial = setting.value ?? {};
    const [enabled, setEnabled] = useState(initial.enabled === true);
    const [videoUrl, setVideoUrl] = useState(typeof initial.videoUrl === "string" ? initial.videoUrl : "");
    const [posterUrl, setPosterUrl] = useState(typeof initial.posterUrl === "string" ? initial.posterUrl : "");
    const [error, setError] = useState<string | null>(null);
    const videos = media.items.filter((item) => item.type.toLowerCase().startsWith("video/"));
    const images = media.items.filter((item) => item.type.toLowerCase().startsWith("image/"));
    const mutation = useMutation({
        mutationFn: async () => readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: setting.key, value: { enabled, videoUrl, posterUrl } }),
        })),
        onSuccess: async () => { setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-settings"] }); },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Unable to save hero media."),
    });
    const selectedVideoMissing = videoUrl && !videos.some((item) => item.url === videoUrl);
    const selectedPosterMissing = posterUrl && !images.some((item) => item.url === posterUrl);

    return (
        <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--elevation-1)]">
            <h2 className="font-semibold">Hero background video</h2>
            <p className="mt-1 text-xs text-muted-foreground">Silent, decorative video. It automatically stops for visitors who prefer reduced motion.</p>
            <label className="mt-4 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> Enable video background</label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">Video
                    <select value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm">
                        {selectedVideoMissing ? <option value={videoUrl}>{videoUrl}</option> : null}
                        {videos.map((item) => <option key={item.id} value={item.url}>{item.title}</option>)}
                    </select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium">Poster image
                    <select value={posterUrl} onChange={(event) => setPosterUrl(event.target.value)} className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm">
                        {selectedPosterMissing ? <option value={posterUrl}>{posterUrl}</option> : null}
                        {images.map((item) => <option key={item.id} value={item.url}>{item.title}</option>)}
                    </select>
                </label>
            </div>
            {media.isLoading ? <p className="mt-3 text-xs text-muted-foreground">Loading Media Library…</p> : null}
            {media.isError ? <p role="alert" className="mt-3 text-xs text-destructive">Media Library could not be loaded.</p> : null}
            {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
            <div className="mt-4 flex justify-end"><Button size="sm" disabled={mutation.isPending || !videoUrl || !posterUrl} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : "Save hero media"}</Button></div>
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
                {settingsQuery.data?.filter((setting) => !setting.key.startsWith("site.scrollwise")).map((setting) => <SettingEditor key={setting.id} setting={setting} />)}
            </div>
        </div>
    );
}
