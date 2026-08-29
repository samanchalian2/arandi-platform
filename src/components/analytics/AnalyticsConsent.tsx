"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const consentKey = "arandi_analytics_consent";
const visitorKey = "arandi_analytics_visitor";
const sessionKey = "arandi_analytics_session";

function token(): string | null {
    if (typeof crypto === "undefined") return null;
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID().replace(/-/g, "");
    if (typeof crypto.getRandomValues !== "function") return null;
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}
function readConsent() {
    try {
        return typeof window === "undefined" ? null : window.localStorage.getItem(consentKey);
    } catch {
        return null;
    }
}

function subscribeToConsent(onStoreChange: () => void) {
    const notify = () => onStoreChange();
    window.addEventListener("storage", notify);
    window.addEventListener("arandi:analytics-consent-change", notify);
    return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("arandi:analytics-consent-change", notify);
    };
}

export function openAnalyticsPreferences() {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("arandi:analytics-preferences"));
}

export function AnalyticsConsent({ lang }: { lang: "en" | "fa" }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // Keep the server and the first client render identical. Reading localStorage
    // during the initial render can otherwise cause a hydration failure once a
    // previous consent decision exists.
    const decision = useSyncExternalStore(subscribeToConsent, readConsent, () => null);
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [storageError, setStorageError] = useState(false);
    const requestedLanguage = searchParams.get("lang");
    const currentLanguage = requestedLanguage === "en" || requestedLanguage === "fa"
        ? requestedLanguage
        : lang;
    const fa = currentLanguage === "fa";

    useEffect(() => {
        const show = () => { setStorageError(false); setPreferencesOpen(true); };
        window.addEventListener("arandi:analytics-preferences", show);
        return () => window.removeEventListener("arandi:analytics-preferences", show);
    }, []);
    useEffect(() => {
        if (decision !== "accepted" || navigator.doNotTrack === "1") return;
        const visitorToken = window.localStorage.getItem(visitorKey) ?? token();
        const sessionToken = window.sessionStorage.getItem(sessionKey) ?? token();
        if (!visitorToken || !sessionToken) return;
        window.localStorage.setItem(visitorKey, visitorToken);
        window.sessionStorage.setItem(sessionKey, sessionToken);
        void fetch("/api/public/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ consent: true, visitorToken, sessionToken, path: pathname, language: currentLanguage, referrer: document.referrer || null }) });
    }, [decision, pathname, currentLanguage]);

    if (decision && !preferencesOpen) return null;
    const decide = (value: "accepted" | "rejected") => {
        try {
            window.localStorage.setItem(consentKey, value);
            if (value === "rejected") {
                window.localStorage.removeItem(visitorKey);
                window.sessionStorage.removeItem(sessionKey);
            }
            setStorageError(false);
            setPreferencesOpen(false);
            window.dispatchEvent(new Event("arandi:analytics-consent-change"));
        } catch {
            setStorageError(true);
        }
    };
    return <aside dir={fa ? "rtl" : "ltr"} aria-label={fa ? "تنظیمات حریم خصوصی" : "Privacy preferences"} className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-xl rounded-2xl border border-border/80 bg-background/95 p-4 shadow-[var(--elevation-2)] backdrop-blur sm:bottom-5">
        <p className="text-sm font-semibold text-foreground">{fa ? "آمار بازدید با رضایت شما" : "Analytics with your consent"}</p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">{fa ? "برای بهبود سایت، بازدید صفحات، منبع ورود و نوع دستگاه را بدون ذخیره IP یا اطلاعات خام مرورگر ثبت می‌کنیم." : "To improve the site, we measure pages, referral source and device category without storing IP addresses or raw browser data."}</p>
        {storageError ? <p role="alert" className="mt-2 text-xs font-medium text-destructive">{fa ? "تنظیم انتخاب حریم خصوصی در این مرورگر ممکن نشد. لطفاً تنظیمات ذخیره‌سازی مرورگر را بررسی و دوباره تلاش کنید." : "Your privacy preference could not be saved in this browser. Check browser storage settings and try again."}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => decide("accepted")} className="min-h-10 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground">{fa ? "پذیرش آمار" : "Accept analytics"}</button><button type="button" onClick={() => decide("rejected")} className="min-h-10 rounded-xl border border-border px-3 text-sm font-semibold text-foreground">{fa ? "رد کردن" : "Decline"}</button></div>
    </aside>;
}
