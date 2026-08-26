"use client";

import { useState } from "react";
import { Menu, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { buildEnterpriseNavigationItems, type NavigationContent } from "@/content/navigation";
import { cn } from "@/lib/utils";
import { setScrollwiseMotionPaused, useScrollwiseMotionPreference } from "./motion-preference";

type ScrollwiseHeaderProps = {
    companyName: string;
    navigation: NavigationContent;
    lang: "en" | "fa";
    showMotionControl: boolean;
    menuMode: "narrative" | "classic";
    logoSize: number;
    titleSize: number;
};

export function ScrollwiseHeader({ companyName, navigation, lang, showMotionControl, menuMode, logoSize, titleSize }: ScrollwiseHeaderProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const motionPaused = useScrollwiseMotionPreference();
    const fa = lang === "fa";
    const chapters = fa
        ? [["gateway", "مسئله"], ["discover", "کشف"], ["design", "نقشه"], ["buildSecure", "بنیان"], ["oilGas", "نفت و گاز"], ["petrochemical", "پتروشیمی"], ["connectedOperations", "انرژی"], ["intelligence", "هوشمندی"], ["outcomes", "نتیجه"]]
        : [["gateway", "Problem"], ["discover", "Discover"], ["design", "Roadmap"], ["buildSecure", "Foundation"], ["oilGas", "Oil & gas"], ["petrochemical", "Petrochemicals"], ["connectedOperations", "Energy"], ["intelligence", "Intelligence"], ["outcomes", "Outcomes"]];
    const nextLanguage = fa ? "en" : "fa";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLanguage);
    const classicItems = [
        ...buildEnterpriseNavigationItems(navigation.enterpriseLinks, lang),
        { path: "/articles", href: `/articles?lang=${lang}`, label: fa ? "مقالات" : "Articles" },
    ];
    const isClassicMenu = menuMode === "classic";
    const menuLabel = isClassicMenu
        ? (fa ? "صفحات اصلی" : "Primary pages")
        : (fa ? "فصل‌های روایت" : "Story chapters");

    const toggleMotion = () => {
        const next = !motionPaused;
        setScrollwiseMotionPaused(next);
    };

    return (
        <header className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-header)] p-3 sm:p-5" dir={fa ? "rtl" : "ltr"}>
            <div className="pointer-events-auto mx-auto flex max-w-[94rem] items-center justify-between gap-3 rounded-2xl border border-slate-900/8 bg-white/82 px-3 py-2 shadow-[0_0.75rem_3rem_rgb(28_37_48_/_0.05)] backdrop-blur-xl sm:px-4">
                <Link href={`/?lang=${lang}`} className="ds-focus-visible inline-flex min-h-11 min-w-11 items-center gap-2.5 rounded-xl px-2 text-foreground sm:px-2.5" aria-label={`${companyName} ${fa ? "خانه" : "Home"}`}>
                    <Image src="/brand/arandi-symbol.png" alt="" width={logoSize} height={logoSize} priority unoptimized className="shrink-0 object-contain" style={{ width: logoSize, height: logoSize }} />
                    <span className={cn("hidden font-semibold sm:inline", fa ? "tracking-normal" : "uppercase tracking-[0.2em]")} style={{ fontSize: titleSize }}>{companyName}</span>
                </Link>

                <nav aria-label={menuLabel} className="hidden items-center gap-0.5 xl:flex">
                    {isClassicMenu
                        ? classicItems.map((item) => <Link key={item.path} href={item.href} aria-current={pathname === item.path || (item.path === "/articles" && pathname.startsWith("/articles/")) ? "page" : undefined} className="ds-focus-visible rounded-full px-2.5 py-2 text-[0.68rem] font-semibold text-foreground/70 hover:bg-foreground/5 hover:text-foreground">{item.label}</Link>)
                        : chapters.map(([id, label]) => <a key={id} href={`#${id}`} className="ds-focus-visible rounded-full px-2.5 py-2 text-[0.68rem] font-semibold text-foreground/70 hover:bg-foreground/5 hover:text-foreground">{label}</a>)}
                </nav>

                <div className="flex items-center gap-1.5">
                    {showMotionControl ? <button type="button" onClick={toggleMotion} aria-pressed={motionPaused} aria-label={motionPaused ? (fa ? "فعال‌کردن حرکت" : "Enable motion") : (fa ? "توقف حرکت" : "Pause motion")} className="ds-focus-visible inline-flex size-11 items-center justify-center rounded-xl border border-slate-900/8 bg-white/72 text-foreground hover:bg-white">
                        {motionPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
                    </button> : null}
                    <Link href={`${pathname}?${params.toString()}`} className="ds-focus-visible inline-flex size-11 items-center justify-center rounded-xl border border-slate-900/8 bg-white/72 text-xs font-bold uppercase text-foreground hover:bg-white" lang={nextLanguage}>
                        {nextLanguage}
                    </Link>
                    <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="scrollwise-mobile-menu" aria-label={menuOpen ? (fa ? "بستن منو" : "Close menu") : (fa ? "باز کردن منو" : "Open menu")} className="ds-focus-visible inline-flex size-11 items-center justify-center rounded-xl border border-slate-900/8 bg-white/72 text-foreground hover:bg-white xl:hidden">
                        {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>
            {menuOpen ? <nav id="scrollwise-mobile-menu" aria-label={menuLabel} className="pointer-events-auto mx-auto mt-2 max-h-[calc(100svh-6rem)] max-w-[94rem] overflow-y-auto rounded-2xl border border-slate-900/8 bg-white/96 p-2 shadow-[0_1rem_4rem_rgb(28_37_48_/_0.08)] backdrop-blur-xl xl:hidden">
                {isClassicMenu
                    ? classicItems.map((item) => <Link key={item.path} href={item.href} aria-current={pathname === item.path || (item.path === "/articles" && pathname.startsWith("/articles/")) ? "page" : undefined} onClick={() => setMenuOpen(false)} className="ds-focus-visible block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">{item.label}</Link>)
                    : <>
                        {chapters.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="ds-focus-visible block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">{label}</a>)}
                        <Link href={`/projects?lang=${lang}`} className="ds-focus-visible block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-muted">{fa ? "مشاهده پروژه‌ها" : "View projects"}</Link>
                    </>}
            </nav> : null}
        </header>
    );
}
