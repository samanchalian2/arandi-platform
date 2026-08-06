"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Footer } from "./Footer";
import { Header } from "./Header";

type NavigationContent = Parameters<typeof Header>[0]["content"];
type CompanyContent = Parameters<typeof Header>[0]["company"];
type FooterContent = Parameters<typeof Footer>[0]["content"];

type AppChromeProps = {
    children: ReactNode;
    contentByLanguage: Record<"en" | "fa", {
        navigation: NavigationContent;
        company: CompanyContent;
        footer: FooterContent;
    }>;
    lang: "en" | "fa";
};

export function AppChrome({ children, contentByLanguage, lang }: AppChromeProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (pathname.startsWith("/admin")) {
        return children;
    }

    const currentLanguage = searchParams.get("lang") === "fa" ? "fa" : lang;
    const content = contentByLanguage[currentLanguage];

    return (
        <div className="flex min-h-screen flex-col">
            <a
                href="#main-content"
                className="sr-only z-[100] rounded-md bg-background px-4 py-3 font-semibold text-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
            >
                {currentLanguage === "fa" ? "رفتن به محتوای اصلی" : "Skip to main content"}
            </a>
            <Header content={content.navigation} company={content.company} lang={currentLanguage} />
            <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
            <Footer content={content.footer} company={content.company} />
        </div>
    );
}
