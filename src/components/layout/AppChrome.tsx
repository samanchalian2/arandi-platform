"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { FloatingChatLauncher } from "@/components/ai/FloatingChatLauncher";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { ScrollwiseHeader } from "@/components/scrollwise/ScrollwiseHeader";
import type { PublicTheme } from "@/lib/public-content";

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
    publicTheme: PublicTheme;
};

export function AppChrome({ children, contentByLanguage, lang, publicTheme }: AppChromeProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (pathname.startsWith("/admin")) {
        return children;
    }

    const currentLanguage = searchParams.get("lang") === "fa" ? "fa" : lang;
    const content = contentByLanguage[currentLanguage];
    const hideFloatingChat = pathname === "/assistant"
        || pathname.startsWith("/account")
        || pathname.startsWith("/recover");
    const isScrollwiseHome = publicTheme.slug === "scrollwise" && pathname === "/";

    return (
        <MotionProvider>
        <div
            className="flex min-h-screen flex-col bg-background text-foreground"
            data-theme={publicTheme.slug}
            data-theme-preview={publicTheme.isPreview ? "true" : undefined}
            style={publicTheme.cssVariables as CSSProperties}
        >
            <a
                href="#main-content"
                className="sr-only z-[100] rounded-md bg-background px-4 py-3 font-semibold text-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
            >
                {currentLanguage === "fa" ? "رفتن به محتوای اصلی" : "Skip to main content"}
            </a>
            {isScrollwiseHome
                ? <ScrollwiseHeader companyName={content.company.shortName} lang={currentLanguage} />
                : <Header content={content.navigation} company={content.company} lang={currentLanguage} />}
            <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
            {!isScrollwiseHome ? <Footer content={content.footer} company={content.company} navigation={content.navigation} lang={currentLanguage} /> : null}
            {!hideFloatingChat ? <FloatingChatLauncher lang={currentLanguage} /> : null}
        </div>
        </MotionProvider>
    );
}
