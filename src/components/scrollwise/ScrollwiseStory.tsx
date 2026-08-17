"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUpRight, Factory, Layers3, Workflow } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

import type { ScrollwiseChapter, ScrollwiseExperience } from "@/lib/public-content";
import { cn } from "@/lib/utils";
import { ScrollwiseCanvas } from "./ScrollwiseCanvas";
import { useScrollwiseMotionPreference } from "./motion-preference";

function smoothstep(value: number) {
    const clamped = Math.min(1, Math.max(0, value));
    return clamped * clamped * (3 - (2 * clamped));
}

function responsiveHeadingSize(scale: number, minimumRem: number, fluidVw: number, maximumRem: number) {
    const ratio = scale / 100;
    return `clamp(${(minimumRem * ratio).toFixed(3)}rem, ${(fluidVw * ratio).toFixed(3)}vw, ${(maximumRem * ratio).toFixed(3)}rem)`;
}

const signalCopy = {
    fa: ["داده‌های پراکنده", "فرایندهای ناپیوسته", "تصمیم‌های دیرهنگام"],
    en: ["Scattered data", "Broken workflows", "Delayed decisions"],
};

const intelligenceCopy = {
    fa: ["دستیار دانش سازمانی", "نگهداری پیش‌بینانه", "هوشمندسازی اسناد", "تحلیل عملیات"],
    en: ["Enterprise knowledge", "Predictive maintenance", "Document intelligence", "Operational analytics"],
};

function StoryScene({ chapter, index, lang, staticMotion, storyHeight, headingScale }: {
    chapter: ScrollwiseChapter;
    index: number;
    lang: "en" | "fa";
    staticMotion: boolean;
    storyHeight: number;
    headingScale: number;
}) {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const fa = lang === "fa";
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.72, 0.94], [0, 1, 1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.22, 0.72, 1], [36, 0, 0, -26]);
    const x = useTransform(scrollYProgress, [0, 0.24, 0.76, 1], [fa ? 54 : -54, 0, 0, fa ? -34 : 34]);
    const episode = chapter.role === "episode" || chapter.key === "oilGas";
    const minHeight = episode ? Math.round(storyHeight * 0.72) : chapter.role === "finale" ? Math.round(storyHeight * 1.08) : storyHeight;
    const alignStart = chapter.key === "gateway" || chapter.key === "design" || chapter.key === "oilGas" || chapter.key === "connectedOperations" || chapter.key === "outcomes";
    const headingSize = responsiveHeadingSize(headingScale, episode ? 1.4 : 1.55, episode ? 2.45 : 2.8, episode ? 2.45 : 2.8);
    const panelClass = chapter.key === "gateway"
        ? "border-transparent bg-white/64 shadow-none backdrop-blur-md"
        : chapter.key === "design"
            ? "border-primary/18 bg-[#f7f8ff]/86 shadow-[0_1.5rem_5rem_rgb(48_55_94_/_0.08)]"
            : chapter.key === "buildSecure"
                ? "border-cyan-900/12 bg-[#f5fbfc]/88 shadow-[0_1.5rem_5rem_rgb(20_63_75_/_0.08)]"
                : chapter.key === "intelligence"
                    ? "border-violet-900/12 bg-[#faf8ff]/88 shadow-[0_1.5rem_5rem_rgb(65_40_110_/_0.08)]"
                    : chapter.role === "finale"
                        ? "border-amber-900/10 bg-[#fffdf7]/86 shadow-[0_1.5rem_5rem_rgb(92_70_22_/_0.08)]"
                        : "border-slate-900/8 bg-white/84 shadow-[0_1.5rem_5rem_rgb(28_37_48_/_0.07)]";

    return (
        <section ref={ref} id={chapter.key} className="relative flex items-center" style={{ minHeight: `${minHeight}svh` }} aria-labelledby={`${chapter.key}-title`} data-scrollwise-scene={chapter.key} data-scrollwise-role={chapter.role} data-assistant-prompt={chapter.assistantPrompt}>
            <m.div className={cn("relative z-10 mx-auto flex w-full max-w-[94rem] px-5 py-28 sm:px-8 lg:px-12", chapter.role === "finale" && "justify-center")} style={staticMotion ? undefined : { opacity, x, y }}>
                <div className={cn("w-full max-w-[34rem] self-center rounded-[1.75rem] border p-6 backdrop-blur-xl sm:p-8", panelClass, alignStart ? "lg:me-auto" : "lg:ms-auto", chapter.role === "finale" && "lg:mx-auto lg:text-center", fa ? "text-right" : "text-left")}>
                    <div className={cn("flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary", chapter.role === "finale" && "justify-center")}>
                        {chapter.chapterNumber ? <span className="text-foreground/45">{chapter.chapterNumber}</span> : null}
                        <span aria-hidden="true" className="h-px w-9 bg-primary/45" />
                        <span>{chapter.eyebrow}</span>
                    </div>
                    {index === 0 ? <h1 id={`${chapter.key}-title`} className="mt-5 max-w-[22ch] font-semibold leading-[1.16] tracking-[-0.025em] text-foreground rtl:leading-[1.48] rtl:tracking-normal" style={{ fontSize: headingSize }}>{chapter.title}</h1> : <h2 id={`${chapter.key}-title`} className={cn("mt-5 max-w-[22ch] font-semibold leading-[1.16] tracking-[-0.025em] text-foreground rtl:leading-[1.48] rtl:tracking-normal", chapter.role === "finale" && "mx-auto")} style={{ fontSize: headingSize }}>{chapter.title}</h2>}
                    <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-foreground/72 sm:text-base sm:leading-8">{chapter.description}</p>
                    {chapter.key === "discover" ? <ul className="mt-6 grid gap-2 sm:grid-cols-3">{signalCopy[lang].map((signal) => <li key={signal} className="rounded-xl border border-emerald-900/10 bg-white/68 px-3 py-3 text-xs font-semibold text-foreground/75">{signal}</li>)}</ul> : null}
                    {chapter.key === "intelligence" ? <ul className="mt-6 grid gap-2 sm:grid-cols-2">{intelligenceCopy[lang].map((item) => <li key={item} className="rounded-xl border border-violet-900/10 bg-white/66 px-3 py-3 text-xs font-semibold text-foreground/75">{item}</li>)}</ul> : null}
                    <p className="mt-6 border-s-2 border-primary/35 ps-4 text-sm leading-7 text-foreground/62">{chapter.bridge}</p>
                    {chapter.action ? <a href={chapter.action.href} className="ds-focus-visible mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[var(--elevation-1)] transition-transform hover:-translate-y-0.5">{chapter.action.label}{chapter.role === "finale" ? <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" /> : <ArrowDown className="size-4" aria-hidden="true" />}</a> : null}
                </div>
            </m.div>
            {index === 0 ? <div className="absolute bottom-20 start-1/2 z-10 -translate-x-1/2 rounded-full border border-slate-900/8 bg-white/88 px-4 py-2 text-center text-[0.64rem] font-bold uppercase tracking-[0.22em] text-foreground/60 shadow-sm backdrop-blur-xl rtl:translate-x-1/2"><span>{fa ? "برای دیدن مسیر اسکرول کنید" : "Scroll to follow the path"}</span><ArrowDown className="mx-auto mt-1 size-4 animate-bounce motion-reduce:animate-none" aria-hidden="true" /></div> : null}
        </section>
    );
}

function ChapterInterlude({ chapter, nextChapter, lang, staticMotion, interludeHeight, headingScale }: {
    chapter: ScrollwiseChapter;
    nextChapter?: ScrollwiseChapter;
    lang: "en" | "fa";
    staticMotion: boolean;
    interludeHeight: number;
    headingScale: number;
}) {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.78, 1], [0, 1, 1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.24, 0.78, 1], [24, 0, 0, -18]);
    const fa = lang === "fa";
    const compact = nextChapter?.role === "episode" || chapter.role === "episode";
    const destination = nextChapter ? `#${nextChapter.key}` : chapter.action?.href ?? `/contact?lang=${lang}`;
    const proof = chapter.key === "outcomes";
    const height = compact ? Math.max(48, Math.round(interludeHeight * 0.62)) : interludeHeight;

    return (
        <section ref={ref} id={`${chapter.key}-menu`} className="relative flex items-center px-5 py-16 sm:px-8" style={{ minHeight: `${height}svh` }} aria-labelledby={`${chapter.key}-menu-title`} data-scrollwise-interlude={chapter.key} data-scrollwise-major={compact ? undefined : "true"} data-assistant-prompt={chapter.assistantPrompt}>
            <m.div className={cn("relative z-20 mx-auto w-full border border-slate-900/8 bg-white/82 shadow-[0_2rem_7rem_rgb(28_37_48_/_0.07)] backdrop-blur-2xl", compact ? "max-w-3xl rounded-[1.5rem] px-6 py-5 sm:px-8" : "max-w-5xl rounded-[2rem] p-6 sm:p-10 lg:p-12")} style={staticMotion ? undefined : { opacity, y }}>
                <div className={cn("mx-auto max-w-3xl", fa ? "text-right" : "text-left")}>
                    {!compact ? <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-primary">{chapter.interlude.eyebrow}</p> : null}
                    <h3 id={`${chapter.key}-menu-title`} className={cn("max-w-3xl font-semibold tracking-[-0.012em] text-foreground rtl:tracking-normal", compact ? "text-base leading-7 sm:text-lg" : "mt-4 leading-[1.3] rtl:leading-[1.58]")} style={compact ? undefined : { fontSize: responsiveHeadingSize(headingScale, 1.1, 1.85, 1.85) }}>{compact ? chapter.bridge : chapter.interlude.title}</h3>
                    {!compact ? <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/68 sm:text-base">{chapter.interlude.description}</p> : null}
                </div>
                {chapter.highlights.length > 0 ? <nav aria-label={fa ? `مسیرهای مرتبط با ${chapter.eyebrow}` : `Explore ${chapter.eyebrow}`} className={cn("mx-auto mt-7 grid max-w-4xl gap-3", proof ? "sm:grid-cols-2" : "sm:grid-cols-2")} data-scrollwise-menu={chapter.key}>
                    {chapter.highlights.slice(0, 4).map((item) => <Link key={`${chapter.key}-${item.title}`} href={item.href} className="group ds-focus-visible overflow-hidden rounded-2xl border border-slate-900/8 bg-white/76 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white">
                        {proof && item.image ? <Image src={item.image} alt="" width={1600} height={1000} sizes="(max-width: 640px) 92vw, 440px" className="aspect-[8/5] w-full object-cover" /> : null}
                        <span className="block p-4"><span className="flex items-start justify-between gap-3 text-sm font-bold text-foreground">{item.title}<ArrowUpRight className="mt-0.5 size-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden="true" /></span><span className="mt-2 line-clamp-3 block text-xs leading-5 text-foreground/62">{item.summary}</span></span>
                    </Link>)}
                </nav> : null}
                {!compact ? <div className="mx-auto mt-7 flex max-w-3xl justify-end rtl:justify-start"><a href={destination} className="ds-focus-visible inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition-transform hover:-translate-y-0.5">{chapter.interlude.nextLabel}{nextChapter ? <ArrowDown className="size-4" aria-hidden="true" /> : <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />}</a></div> : null}
            </m.div>
        </section>
    );
}

export function ScrollwiseStory({ experience }: { experience: ScrollwiseExperience }) {
    const storyRef = useRef<HTMLDivElement>(null);
    const motionPaused = useScrollwiseMotionPreference();
    const reducedMotion = useReducedMotion();
    const staticMotion = Boolean(reducedMotion || motionPaused);
    const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
    const veilOpacity = useTransform(scrollYProgress, (value) => {
        if (staticMotion) return 0;
        const segments = experience.chapters.map((chapter, index) => {
            const story = chapter.role === "episode" || chapter.key === "oilGas" ? experience.display.storyHeight * 0.72 : chapter.role === "finale" ? experience.display.storyHeight * 1.08 : experience.display.storyHeight;
            const next = experience.chapters[index + 1];
            const interlude = chapter.role === "finale" ? 0 : next?.role === "episode" || chapter.role === "episode" ? Math.max(48, experience.display.interludeHeight * 0.62) : experience.display.interludeHeight;
            return { story, total: story + interlude };
        });
        const total = segments.reduce((sum, segment) => sum + segment.total, 0);
        let offset = Math.min(total - Number.EPSILON, Math.max(0, value) * total);
        let sceneIndex = 0;
        while (sceneIndex < segments.length - 1 && offset > segments[sceneIndex].total) {
            offset -= segments[sceneIndex].total;
            sceneIndex += 1;
        }
        const segment = segments[sceneIndex];
        const local = offset / segment.total;
        const next = experience.chapters[sceneIndex + 1];
        if (next?.role === "episode") return 0;
        const storyEnd = segment.story / segment.total;
        const riseStart = storyEnd * 0.84;
        const fallStart = Math.max(storyEnd, 0.88);
        if (local < riseStart) return 0;
        if (local < storyEnd) return experience.display.veilOpacity * smoothstep((local - riseStart) / Math.max(0.01, storyEnd - riseStart));
        if (local < fallStart) return experience.display.veilOpacity;
        return experience.display.veilOpacity * (1 - smoothstep((local - fallStart) / Math.max(0.01, 1 - fallStart)));
    });
    const fa = experience.language === "fa";

    return (
        <div className="scrollwise-story overflow-x-clip bg-background text-foreground" dir={fa ? "rtl" : "ltr"} lang={experience.language} data-motion-paused={motionPaused ? "true" : undefined} data-heading-scale={experience.display.headingScale}>
            <div ref={storyRef} className="relative">
                <div className="sticky top-0 z-0 h-svh overflow-hidden bg-background" aria-hidden="true">
                    <picture className="absolute inset-0"><source media="(max-width: 767px)" srcSet={experience.chapters[0]?.mobileImage} width="900" height="1200" /><img src={experience.chapters[0]?.desktopImage} alt="" width={3200} height={900} loading="eager" fetchPriority="high" className="h-full w-full object-cover" /></picture>
                    <div className="absolute inset-0"><ScrollwiseCanvas chapters={experience.chapters} progress={scrollYProgress} staticMotion={staticMotion} motionPreset={experience.display.motionPreset} /></div>
                    <div className="scrollwise-stage-wash absolute inset-0" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_16%,transparent_84%,rgba(255,255,255,0.28)_100%)]" />
                    <m.div className="absolute inset-0 z-10 bg-white" style={{ opacity: veilOpacity }} data-scrollwise-veil />
                </div>
                <div className="relative z-10 -mt-[100svh]">
                    {experience.chapters.map((chapter, index) => <div key={chapter.key} className="relative border-t border-foreground/5 first:border-t-0" data-scrollwise-chapter={chapter.key}>
                        <StoryScene chapter={chapter} index={index} lang={experience.language} staticMotion={staticMotion} storyHeight={experience.display.storyHeight} headingScale={experience.display.headingScale} />
                        {chapter.role !== "finale" ? <ChapterInterlude chapter={chapter} nextChapter={experience.chapters[index + 1]} lang={experience.language} staticMotion={staticMotion} interludeHeight={experience.display.interludeHeight} headingScale={experience.display.headingScale} /> : null}
                    </div>)}
                </div>
            </div>
            <aside aria-label={fa ? "خلاصه تجربه آرندی" : "Arandi experience summary"} className="relative border-y border-foreground/10 bg-foreground px-5 py-14 text-background sm:px-8"><div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{fa ? "از گسست تا قابلیت پایدار" : "From disconnect to durable capability"}</p><h2 className="mt-4 max-w-2xl font-semibold leading-[1.35] rtl:leading-[1.6]" style={{ fontSize: responsiveHeadingSize(experience.display.headingScale, 1.25, 2.2, 2.2) }}>{fa ? "یک شریک فنی برای تمام چرخه تحول" : "One technical partner across the transformation lifecycle"}</h2></div><dl className="grid grid-cols-3 gap-6 text-center">{[{ icon: Workflow, value: experience.metrics.projects, label: fa ? "پروژه" : "Projects" }, { icon: Layers3, value: experience.metrics.services, label: fa ? "خدمت" : "Services" }, { icon: Factory, value: experience.metrics.industries, label: fa ? "صنعت" : "Industries" }].map(({ icon: Icon, value, label }) => <div key={label}><Icon className="mx-auto size-4 text-accent" aria-hidden="true" /><dt className="mt-2 text-xs text-background/65">{label}</dt><dd className="mt-1 text-2xl font-bold">{value}</dd></div>)}</dl></div></aside>
            <footer className="bg-background px-5 pb-32 pt-12 text-sm text-foreground/65 sm:px-8"><div className="mx-auto flex max-w-[94rem] flex-col justify-between gap-5 border-t border-foreground/10 pt-6 sm:flex-row sm:items-center"><p>© {new Date().getFullYear()} Arandi Bonyan</p><nav aria-label={fa ? "پیوندهای پایانی" : "Closing links"} className="flex flex-wrap gap-x-5 gap-y-3"><Link href={`/projects?lang=${experience.language}`} className="hover:text-primary">{fa ? "پروژه‌ها" : "Projects"}</Link><Link href={`/contact?lang=${experience.language}`} className="hover:text-primary">{fa ? "تماس" : "Contact"}</Link><Link href={`/legal/privacy?lang=${experience.language}`} className="hover:text-primary">{fa ? "حریم خصوصی" : "Privacy"}</Link></nav></div></footer>
        </div>
    );
}
