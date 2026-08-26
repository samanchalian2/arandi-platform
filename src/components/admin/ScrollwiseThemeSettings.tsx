"use client";

import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, ImageIcon, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cmsFetch } from "@/lib/admin/cms-fetch";
import { useMedia } from "@/lib/admin/media";
import { defaultScrollwiseCopy, type ScrollwiseCardCopy, type ScrollwiseCopy, type ScrollwiseLanguage } from "@/lib/scrollwise-copy";

type SettingItem = {
    id: string;
    key: string;
    value: Record<string, unknown> | null;
    updatedAt: string;
};

type ApiEnvelope<T> = { ok: boolean; data?: T; error?: { message?: string } };

const sceneOptions = [
    { key: "gateway", label: "Prelude · The disconnect" },
    { key: "discover", label: "Chapter 1 · Seeing" },
    { key: "design", label: "Chapter 2 · Designing the path" },
    { key: "buildSecure", label: "Chapter 3 · Building the foundation" },
    { key: "oilGas", label: "Chapter 4 · Field episode" },
    { key: "petrochemical", label: "Chapter 4 · Plant episode" },
    { key: "connectedOperations", label: "Chapter 4 · Energy episode" },
    { key: "intelligence", label: "Chapter 5 · Intelligence" },
    { key: "outcomes", label: "Chapter 6 · Proof" },
    { key: "finale", label: "Finale · The complete picture" },
] as const;

type SceneKey = typeof sceneOptions[number]["key"];
type SceneMap = Record<SceneKey, { desktopUrl: string; mobileUrl: string }>;
type ExperienceSettings = {
    motionPreset: "subtle" | "balanced" | "cinematic";
    showMotionControl: boolean;
    menuMode: "narrative" | "classic";
    headerLogoSize: number;
    headerTitleSize: number;
    headingScale: number;
    veilOpacity: number;
    storyHeight: number;
    interludeHeight: number;
};

const defaultExperience: ExperienceSettings = {
    motionPreset: "cinematic",
    showMotionControl: false,
    menuMode: "narrative",
    headerLogoSize: 48,
    headerTitleSize: 16,
    headingScale: 100,
    veilOpacity: 0.94,
    storyHeight: 150,
    interludeHeight: 90,
};

async function readEnvelope<T>(response: Response): Promise<T> {
    const body = await response.json() as ApiEnvelope<T>;
    if (!response.ok || !body.ok || body.data === undefined) throw new Error(body.error?.message ?? "Settings request failed.");
    return body.data;
}

function initialScenes(setting: SettingItem): SceneMap {
    const root = setting.value ?? {};
    return Object.fromEntries(sceneOptions.map(({ key }) => {
        const value = root[key];
        const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
        return [key, {
            desktopUrl: typeof record.desktopUrl === "string" ? record.desktopUrl : "",
            mobileUrl: typeof record.mobileUrl === "string" ? record.mobileUrl : "",
        }];
    })) as SceneMap;
}

function initialExperience(setting: SettingItem): ExperienceSettings {
    const value = setting.value ?? {};
    return {
        motionPreset: value.motionPreset === "subtle" || value.motionPreset === "balanced" || value.motionPreset === "cinematic" ? value.motionPreset : defaultExperience.motionPreset,
        showMotionControl: typeof value.showMotionControl === "boolean" ? value.showMotionControl : defaultExperience.showMotionControl,
        menuMode: value.menuMode === "classic" ? "classic" : defaultExperience.menuMode,
        headerLogoSize: typeof value.headerLogoSize === "number" ? value.headerLogoSize : defaultExperience.headerLogoSize,
        headerTitleSize: typeof value.headerTitleSize === "number" ? value.headerTitleSize : defaultExperience.headerTitleSize,
        headingScale: typeof value.headingScale === "number" ? value.headingScale : defaultExperience.headingScale,
        veilOpacity: typeof value.veilOpacity === "number" ? value.veilOpacity : defaultExperience.veilOpacity,
        storyHeight: typeof value.storyHeight === "number" ? value.storyHeight : defaultExperience.storyHeight,
        interludeHeight: typeof value.interludeHeight === "number" ? value.interludeHeight : defaultExperience.interludeHeight,
    };
}

function initialCopy(setting: SettingItem): ScrollwiseCopy {
    const root = setting.value ?? {};
    return Object.fromEntries((["en", "fa"] as const).map((language) => {
        const localized = root[language];
        const localizedRecord = localized && typeof localized === "object" && !Array.isArray(localized) ? localized as Record<string, unknown> : {};
        return [language, Object.fromEntries(sceneOptions.map(({ key }) => {
            const value = localizedRecord[key];
            const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
            const fallback = defaultScrollwiseCopy[language][key];
            return [key, Object.fromEntries((Object.keys(fallback) as Array<keyof ScrollwiseCardCopy>).map((field) => [
                field,
                typeof record[field] === "string" ? record[field] : fallback[field],
            ]))];
        }))];
    })) as ScrollwiseCopy;
}

function ImagePreview({ src, mobile }: { src: string; mobile?: boolean }) {
    return (
        <div className={`relative overflow-hidden rounded-xl border border-border/70 bg-muted ${mobile ? "aspect-[3/4]" : "aspect-[32/9]"}`}>
            {src ? <Image src={src} alt="" fill sizes={mobile ? "160px" : "480px"} className="object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="size-5" aria-hidden="true" /></div>}
        </div>
    );
}

function ScrollwiseThemeSettingsForm({ sceneSetting, experienceSetting, copySetting }: { sceneSetting: SettingItem; experienceSetting: SettingItem; copySetting: SettingItem }) {
    const queryClient = useQueryClient();
    const media = useMedia({ search: "", type: "all", sortBy: "updatedAt", sortDirection: "desc", page: 1, pageSize: 100 });
    const images = media.items.filter((item) => item.type.toLowerCase().startsWith("image/"));
    const [scenes, setScenes] = useState<SceneMap>(() => initialScenes(sceneSetting));
    const [experience, setExperience] = useState<ExperienceSettings>(() => initialExperience(experienceSetting));
    const [copy, setCopy] = useState<ScrollwiseCopy>(() => initialCopy(copySetting));
    const [activeLanguage, setActiveLanguage] = useState<ScrollwiseLanguage>("fa");
    const [saved, setSaved] = useState(false);
    const mutation = useMutation({
        mutationFn: async () => Promise.all([
            readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: sceneSetting.key, value: scenes }),
            })),
            readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: experienceSetting.key, value: experience }),
            })),
            readEnvelope<SettingItem>(await cmsFetch("/api/cms/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: copySetting.key, value: copy }),
            })),
        ]),
        onSuccess: async () => {
            setSaved(true);
            await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
        },
        onMutate: () => setSaved(false),
    });
    const updateScene = (key: SceneKey, field: "desktopUrl" | "mobileUrl", url: string) => {
        setSaved(false);
        setScenes((current) => ({ ...current, [key]: { ...current[key], [field]: url } }));
    };
    const updateCopy = (key: SceneKey, field: keyof ScrollwiseCardCopy, value: string) => {
        setSaved(false);
        setCopy((current) => ({
            ...current,
            [activeLanguage]: {
                ...current[activeLanguage],
                [key]: { ...current[activeLanguage][key], [field]: value },
            },
        }));
    };
    const complete = sceneOptions.every(({ key }) => scenes[key].desktopUrl && scenes[key].mobileUrl)
        && (["en", "fa"] as const).every((language) => sceneOptions.every(({ key }) => Object.values(copy[language][key]).every((value) => value.trim().length >= 2)));

    return (
        <section className="space-y-5" aria-labelledby="scrollwise-settings-title">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                    <SlidersHorizontal className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                        <h2 id="scrollwise-settings-title" className="font-semibold">Scrollwise experience</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">Edit the bilingual Scrollwise narrative, its governed imagery, and presentation settings here. Linked service, solution, industry, and project cards continue to use Published CMS content.</p>
                    </div>
                </div>
            </div>

            <fieldset className="rounded-2xl border border-border/70 bg-card p-5">
                <legend className="px-1 text-base font-semibold">Motion and pacing</legend>
                <div className="mt-3 grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">Camera movement
                        <select value={experience.motionPreset} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, motionPreset: event.target.value as ExperienceSettings["motionPreset"] })); }} className="h-11 rounded-xl border border-border/70 bg-background px-3">
                            <option value="subtle">Subtle</option>
                            <option value="balanced">Balanced</option>
                            <option value="cinematic">Cinematic</option>
                        </select>
                        <span className="text-xs font-normal text-muted-foreground">Controls horizontal travel and zoom depth. Reduced-motion visitors still receive static scenes.</span>
                    </label>
                    <label className="flex min-h-11 items-start gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 text-sm font-medium">
                        <input type="checkbox" checked={experience.showMotionControl} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, showMotionControl: event.target.checked })); }} className="mt-0.5 size-4 accent-primary" />
                        <span>Show pause/play control <span className="mt-1 block text-xs font-normal text-muted-foreground">Keep this hidden for a cleaner public header; enable it when visitors should control cinematic motion.</span></span>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">Navigation menu
                        <select value={experience.menuMode} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, menuMode: event.target.value as ExperienceSettings["menuMode"] })); }} className="h-11 rounded-xl border border-border/70 bg-background px-3">
                            <option value="narrative">Scrollwise story chapters</option>
                            <option value="classic">Classic public pages</option>
                        </select>
                        <span className="text-xs font-normal text-muted-foreground">Choose the story anchors or the CMS-managed Company, Services, Solutions, Industries, Projects, Contact and Articles menu.</span>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">Header logo size <output>{experience.headerLogoSize}px</output>
                        <input type="range" min="40" max="64" step="1" value={experience.headerLogoSize} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, headerLogoSize: Number(event.target.value) })); }} className="h-11 w-full accent-primary" />
                        <span className="text-xs font-normal text-muted-foreground">Sets the Arandi symbol size in the public Scrollwise header.</span>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">Header title size <output>{experience.headerTitleSize}px</output>
                        <input type="range" min="13" max="22" step="1" value={experience.headerTitleSize} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, headerTitleSize: Number(event.target.value) })); }} className="h-11 w-full accent-primary" />
                        <span className="text-xs font-normal text-muted-foreground">Sets the desktop Arandi brand-title size; compact mobile navigation keeps the title hidden.</span>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">Heading size <output>{experience.headingScale}%</output>
                        <input type="range" min="90" max="115" step="5" value={experience.headingScale} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, headingScale: Number(event.target.value) })); }} className="h-11 w-full accent-primary" />
                        <span className="text-xs font-normal text-muted-foreground">Adjusts chapter, interlude and closing headings together while preserving their hierarchy.</span>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">White transition veil <output>{Math.round(experience.veilOpacity * 100)}%</output>
                        <input type="range" min="0.5" max="0.98" step="0.01" value={experience.veilOpacity} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, veilOpacity: Number(event.target.value) })); }} className="h-11 w-full accent-primary" />
                        <span className="text-xs font-normal text-muted-foreground">Higher values create a softer, brighter handoff between scenes.</span>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">Story length <output>{experience.storyHeight} svh</output>
                        <input type="range" min="120" max="220" step="5" value={experience.storyHeight} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, storyHeight: Number(event.target.value) })); }} className="h-11 w-full accent-primary" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">Menu interlude length <output>{experience.interludeHeight} svh</output>
                        <input type="range" min="60" max="140" step="5" value={experience.interludeHeight} onChange={(event) => { setSaved(false); setExperience((current) => ({ ...current, interludeHeight: Number(event.target.value) })); }} className="h-11 w-full accent-primary" />
                    </label>
                </div>
            </fieldset>

            <section className="rounded-2xl border border-border/70 bg-card p-5" aria-labelledby="scrollwise-copy-title">
                <h3 id="scrollwise-copy-title" className="font-semibold">Narrative card content</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Edit every narrative beat, transition bridge and chapter-aware assistant suggestion. Persian and English remain independent.</p>
                <div className="mt-4 inline-flex rounded-xl border border-border/70 bg-muted/50 p-1" role="tablist" aria-label="Scrollwise content language">
                    {(["fa", "en"] as const).map((language) => (
                        <button key={language} type="button" role="tab" aria-selected={activeLanguage === language} onClick={() => setActiveLanguage(language)} className={`min-h-11 min-w-24 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeLanguage === language ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            {language === "fa" ? "فارسی" : "English"}
                        </button>
                    ))}
                </div>
                <div className="mt-4 space-y-3" dir={activeLanguage === "fa" ? "rtl" : "ltr"}>
                    {sceneOptions.map(({ key, label }, index) => {
                        const value = copy[activeLanguage][key];
                        const fieldClass = "min-h-11 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm leading-6 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring";
                        return (
                            <details key={`${activeLanguage}-${key}`} open={index === 0} className="group rounded-xl border border-border/70 bg-background p-3">
                                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <span>{label}</span><ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                                </summary>
                                <div className="mt-3 grid gap-4 border-t border-border/70 pt-4 lg:grid-cols-2">
                                    <label className="grid gap-2 text-sm font-medium">Chapter title
                                        <input required maxLength={160} value={value.title} onChange={(event) => updateCopy(key, "title", event.target.value)} className={fieldClass} />
                                        <span className="text-xs font-normal text-muted-foreground">{value.title.length}/160</span>
                                    </label>
                                    <label className="grid gap-2 text-sm font-medium">Contextual card title
                                        <input required maxLength={160} value={value.interludeTitle} onChange={(event) => updateCopy(key, "interludeTitle", event.target.value)} className={fieldClass} />
                                        <span className="text-xs font-normal text-muted-foreground">{value.interludeTitle.length}/160</span>
                                    </label>
                                    <label className="grid gap-2 text-sm font-medium">Chapter text
                                        <textarea required maxLength={600} rows={4} value={value.description} onChange={(event) => updateCopy(key, "description", event.target.value)} className={fieldClass} />
                                        <span className="text-xs font-normal text-muted-foreground">{value.description.length}/600</span>
                                    </label>
                                    <label className="grid gap-2 text-sm font-medium">Contextual card text
                                        <textarea required maxLength={600} rows={4} value={value.interludeDescription} onChange={(event) => updateCopy(key, "interludeDescription", event.target.value)} className={fieldClass} />
                                        <span className="text-xs font-normal text-muted-foreground">{value.interludeDescription.length}/600</span>
                                    </label>
                                    <label className="grid gap-2 text-sm font-medium">Bridge to the next beat
                                        <textarea required maxLength={300} rows={3} value={value.bridge} onChange={(event) => updateCopy(key, "bridge", event.target.value)} className={fieldClass} />
                                        <span className="text-xs font-normal text-muted-foreground">{value.bridge.length}/300</span>
                                    </label>
                                    <label className="grid gap-2 text-sm font-medium">Assistant suggested prompt
                                        <textarea required maxLength={240} rows={3} value={value.assistantPrompt} onChange={(event) => updateCopy(key, "assistantPrompt", event.target.value)} className={fieldClass} />
                                        <span className="text-xs font-normal text-muted-foreground">{value.assistantPrompt.length}/240</span>
                                    </label>
                                </div>
                            </details>
                        );
                    })}
                </div>
                <p className="mt-4 rounded-xl bg-muted/55 p-3 text-xs leading-5 text-muted-foreground">The smaller linked cards inside each chapter are shared Published CMS records. Edit those from Admin Pages/Cards so their public detail pages and Scrollwise stay consistent.</p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-5" aria-labelledby="scrollwise-scenes-title">
                <h3 id="scrollwise-scenes-title" className="font-semibold">Narrative images</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Choose one 32:9 panorama and one separately composed mobile image for every chapter. Open only the chapter you want to edit.</p>
                <div className="mt-4 space-y-3">
                    {sceneOptions.map(({ key, label }, index) => (
                        <details key={key} open={index === 0} className="group rounded-xl border border-border/70 bg-background p-3">
                            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <span>{label}</span><ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                            </summary>
                            <div className="mt-3 grid gap-4 border-t border-border/70 pt-4 lg:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)]">
                                {(["desktopUrl", "mobileUrl"] as const).map((field) => {
                                    const mobile = field === "mobileUrl";
                                    return <label key={field} className="grid content-start gap-2 text-sm font-medium">{mobile ? "Mobile · 3:4" : "Desktop · 32:9"}
                                        <ImagePreview src={scenes[key][field]} mobile={mobile} />
                                        <select value={scenes[key][field]} onChange={(event) => updateScene(key, field, event.target.value)} className="h-11 min-w-0 rounded-xl border border-border/70 bg-card px-3 text-sm">
                                            <option value="">Select an image…</option>
                                            {scenes[key][field] && !images.some((item) => item.url === scenes[key][field]) ? <option value={scenes[key][field]}>{scenes[key][field]}</option> : null}
                                            {images.map((item) => <option key={item.id} value={item.url}>{item.title}</option>)}
                                        </select>
                                    </label>;
                                })}
                            </div>
                        </details>
                    ))}
                </div>
                {media.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading Media Library…</p> : null}
                {media.isError ? <p role="alert" className="mt-3 text-sm text-destructive">Media Library could not be loaded. Retry before saving image changes.</p> : null}
            </section>

            {mutation.error ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{mutation.error instanceof Error ? mutation.error.message : "Unable to save Scrollwise settings."}</p> : null}
            <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-[var(--elevation-2)] backdrop-blur">
                <span aria-live="polite" className="me-auto flex items-center gap-2 text-sm text-muted-foreground">{saved ? <><CheckCircle2 className="size-4 text-primary" aria-hidden="true" />Saved. Open Preview to review changes.</> : "Changes remain private until this theme is published."}</span>
                <Button type="button" disabled={mutation.isPending || !complete || media.isError} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : "Save Scrollwise settings"}</Button>
            </div>
        </section>
    );
}

export function ScrollwiseThemeSettings() {
    const query = useQuery({
        queryKey: ["admin-scrollwise-theme-settings"],
        queryFn: async () => readEnvelope<SettingItem[]>(await fetch("/api/cms/settings", { cache: "no-store" })),
    });
    if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading Scrollwise settings…</p>;
    if (query.error) return <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{query.error.message}</p>;
    const sceneSetting = query.data?.find((setting) => setting.key === "site.scrollwiseScenes");
    const experienceSetting = query.data?.find((setting) => setting.key === "site.scrollwiseExperience");
    const copySetting = query.data?.find((setting) => setting.key === "site.scrollwiseCopy");
    if (!sceneSetting || !experienceSetting || !copySetting) return <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Scrollwise settings are not initialized. Run the governed Scrollwise media importer.</p>;
    return <ScrollwiseThemeSettingsForm key={`${sceneSetting.updatedAt}:${experienceSetting.updatedAt}:${copySetting.updatedAt}`} sceneSetting={sceneSetting} experienceSetting={experienceSetting} copySetting={copySetting} />;
}
