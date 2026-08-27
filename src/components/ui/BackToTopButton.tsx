"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

type BackToTopButtonProps = {
    lang: "en" | "fa";
};

const REVEAL_OFFSET = 480;

export function BackToTopButton({ lang }: BackToTopButtonProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateVisibility = () => setIsVisible(window.scrollY > REVEAL_OFFSET);

        updateVisibility();
        window.addEventListener("scroll", updateVisibility, { passive: true });

        return () => window.removeEventListener("scroll", updateVisibility);
    }, []);

    if (!isVisible) return null;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={lang === "fa" ? "بازگشت به ابتدای صفحه" : "Back to top"}
            className="ds-focus-visible ds-back-to-top fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] end-4 z-40 inline-flex size-11 items-center justify-center rounded-full border border-slate-900/10 bg-background/94 text-foreground shadow-[0_16px_36px_-20px_rgba(15,23,42,0.6)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-background sm:end-6"
        >
            <ArrowUp aria-hidden="true" className="size-4" />
        </button>
    );
}
