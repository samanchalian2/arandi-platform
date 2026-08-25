"use client";

import { openAnalyticsPreferences } from "./AnalyticsConsent";

export function PrivacyPreferencesButton({ lang }: { lang: "en" | "fa" }) {
    return <button type="button" onClick={openAnalyticsPreferences} className="font-medium hover:text-primary hover:underline">{lang === "fa" ? "تنظیمات حریم خصوصی" : "Privacy preferences"}</button>;
}
