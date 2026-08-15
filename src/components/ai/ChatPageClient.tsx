"use client";

import { useEffect, useState } from "react";

import { ASSISTANT_HANDOFF_STORAGE_KEY, parseAssistantHandoff } from "@/lib/ai/handoff";

import { ChatInterface } from "./ChatInterface";

type ChatContent = Parameters<typeof ChatInterface>[0]["content"];

type ChatPageClientProps = {
    content: ChatContent;
    lang: "en" | "fa";
};

export function ChatPageClient({ content, lang }: ChatPageClientProps) {
    const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

    useEffect(() => {
        const consume = () => {
            let nextPrompt: string | null = null;
            try {
                const handoff = parseAssistantHandoff(window.sessionStorage.getItem(ASSISTANT_HANDOFF_STORAGE_KEY), lang);
                window.sessionStorage.removeItem(ASSISTANT_HANDOFF_STORAGE_KEY);
                nextPrompt = handoff?.message ?? null;
            } catch {
                nextPrompt = null;
            }
            setInitialPrompt(nextPrompt);
        };

        const timeout = window.setTimeout(consume, 0);
        return () => window.clearTimeout(timeout);
    }, [lang]);

    return <ChatInterface content={content} lang={lang} variant="page" initialPrompt={initialPrompt} />;
}
