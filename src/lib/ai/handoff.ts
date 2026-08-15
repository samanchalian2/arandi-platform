export const MAX_ASSISTANT_HANDOFF_LENGTH = 1_000;
export const ASSISTANT_HANDOFF_STORAGE_KEY = "arandi:assistant-handoff:v1";

export type AssistantHandoff = {
    message: string;
    language: "en" | "fa";
};

export function normalizeAssistantHandoff(value: unknown, language: "en" | "fa"): AssistantHandoff | null {
    if (typeof value !== "string") return null;
    const message = value.trim().slice(0, MAX_ASSISTANT_HANDOFF_LENGTH);
    return message ? { message, language } : null;
}

export function parseAssistantHandoff(value: string | null, language: "en" | "fa"): AssistantHandoff | null {
    if (!value) return null;
    try {
        const parsed = JSON.parse(value) as Partial<AssistantHandoff>;
        if (parsed.language !== language) return null;
        return normalizeAssistantHandoff(parsed.message, language);
    } catch {
        return null;
    }
}
