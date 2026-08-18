"use client";

import { ArrowUp, Bot } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
    ASSISTANT_HANDOFF_STORAGE_KEY,
    MAX_ASSISTANT_HANDOFF_LENGTH,
    normalizeAssistantHandoff,
} from "@/lib/ai/handoff";

type FloatingChatLauncherProps = {
    lang: "en" | "fa";
};

export function FloatingChatLauncher({ lang }: FloatingChatLauncherProps) {
    const router = useRouter();
    const [draft, setDraft] = useState("");
    const isRtl = lang === "fa";
    const copy = isRtl
        ? { label: "گفت‌وگو با دستیار آرندی", placeholder: "پرسش‌تان را مطرح کنید؛ پاسخ، همین‌جاست.", submit: "ارسال پیام" }
        : { label: "Chat with Arandi Assistant", placeholder: "Ask your question—your answer is right here.", submit: "Send message" };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const handoff = normalizeAssistantHandoff(draft, lang);
        if (!handoff) return;

        try {
            window.sessionStorage.setItem(ASSISTANT_HANDOFF_STORAGE_KEY, JSON.stringify(handoff));
        } catch {
            // The dedicated page remains reachable if browser storage is unavailable.
        }
        router.push(`/assistant?lang=${lang}`);
    };

    return (
        <aside
            dir={isRtl ? "rtl" : "ltr"}
            aria-label={copy.label}
            className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 pointer-events-none px-4 sm:px-6"
        >
            <form onSubmit={submit} className="ds-chat-shell ds-subtle-ring pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-2 rounded-full bg-background/94 p-2 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-4" />
                </span>
                <label className="sr-only" htmlFor="floating-assistant-input">{copy.label}</label>
                <input
                    id="floating-assistant-input"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={copy.placeholder}
                    maxLength={MAX_ASSISTANT_HANDOFF_LENGTH}
                    dir={isRtl ? "rtl" : "ltr"}
                    className={`min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}
                />
                <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="ds-focus-visible inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--elevation-1)] transition disabled:cursor-not-allowed disabled:opacity-45"
                    aria-label={copy.submit}
                >
                    <ArrowUp className="size-4 rtl:rotate-180" />
                </button>
            </form>
        </aside>
    );
}
