"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageSquareText } from "lucide-react";

import { ChatInput } from "@/components/ai/ChatInput";
import { ChatMessage, type ChatCitation } from "@/components/ai/ChatMessage";
import { Container } from "@/components/layout/Container";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { MAX_ASSISTANT_HANDOFF_LENGTH } from "@/lib/ai/handoff";

type ChatContent = {
  badge: string;
  heading: string;
  description: string;
  placeholder: string;
  initialMessage: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputAriaLabel: string;
  loadingText: string;
  assistantReply: string;
  assistantHint: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  state?: "ready" | "thinking" | "streaming";
  citations?: ChatCitation[];
  suggestions?: string[];
};

type ChatInterfaceProps = {
  content: ChatContent;
  lang: "en" | "fa";
  variant?: "embedded" | "page";
  initialPrompt?: string | null;
};

export function ChatInterface({ content, lang, variant = "embedded", initialPrompt }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "assistant-initial",
      role: "assistant",
      content: content.initialMessage,
      timestamp: "Now",
      state: "ready",
      suggestions: [],
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const requestController = useRef<AbortController | null>(null);
  const initialPromptSent = useRef(false);

  useEffect(() => () => requestController.current?.abort(), []);

  const hasMessages = messages.length > 0;
  const lastAssistantMessage = [...messages].reverse().find((item) => item.role === "assistant");

  const placeholder = useMemo(() => {
    if (messages.length === 1) {
      return content.placeholder;
    }
    return content.assistantHint;
  }, [content.assistantHint, content.placeholder, messages.length]);

  const sendMessage = useCallback(async (candidate: string) => {
    const trimmed = candidate.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const requestId = Date.now();
    const userMessage: Message = {
      id: `user-${requestId}`,
      role: "user",
      content: trimmed,
      timestamp: "Now",
      state: "ready",
    };
    const assistantId = `assistant-${requestId}`;
    const history = [...messages.filter((message) => message.id !== "assistant-initial"), userMessage]
      .slice(-8)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }));
    setMessages((current) => [...current, userMessage, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: "Preparing",
      state: "thinking",
      citations: [],
      suggestions: [],
    }]);
    setDraft("");
    setIsLoading(true);
    const controller = new AbortController();
    requestController.current = controller;

    const updateAssistant = (update: (message: Message) => Message) => {
      setMessages((current) => current.map((message) =>
        message.id === assistantId ? update(message) : message));
    };

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: lang, messages: history }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error("Chat request failed.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let providerError: string | null = null;
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const frame = JSON.parse(line) as {
            type?: string;
            delta?: unknown;
            message?: unknown;
            citation?: ChatCitation;
          };
          if (frame.type === "delta" && typeof frame.delta === "string") {
            updateAssistant((message) => ({
              ...message,
              content: message.content + frame.delta,
              state: "streaming",
            }));
          } else if (
            frame.type === "citation"
            && frame.citation
            && typeof frame.citation.id === "string"
            && typeof frame.citation.label === "string"
            && typeof frame.citation.href === "string"
            && /^\/[a-z0-9][a-z0-9/?=&_-]*$/i.test(frame.citation.href)
          ) {
            updateAssistant((message) => ({
              ...message,
              citations: [...(message.citations ?? []), frame.citation as ChatCitation],
            }));
          } else if (frame.type === "error") {
            providerError = typeof frame.message === "string" ? frame.message : "Chat unavailable.";
          }
        }
        if (done) break;
      }
      if (providerError) throw new Error(providerError);
      updateAssistant((message) => ({ ...message, state: "ready", timestamp: "Now" }));
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === "AbortError";
      updateAssistant((message) => ({
        ...message,
        content: message.content || (cancelled
          ? (lang === "fa" ? "پاسخ متوقف شد." : "Response stopped.")
          : (lang === "fa" ? "دستیار هوشمند موقتاً در دسترس نیست." : "The AI assistant is temporarily unavailable.")),
        state: "ready",
        timestamp: "Now",
      }));
    } finally {
      if (requestController.current === controller) requestController.current = null;
      setIsLoading(false);
    }
  }, [isLoading, lang, messages]);

  const handleSend = () => {
    void sendMessage(draft);
  };

  useEffect(() => {
    if (!initialPrompt || initialPromptSent.current) return;
    initialPromptSent.current = true;
    void sendMessage(initialPrompt);
  }, [initialPrompt, sendMessage]);

  const suggestionChips = lastAssistantMessage?.suggestions ?? [];

  const handleSelectSuggestion = (value: string) => {
    setDraft(value.slice(0, MAX_ASSISTANT_HANDOFF_LENGTH));
  };

  return (
    <section id="assistant" dir={lang === "fa" ? "rtl" : "ltr"} className={`ds-chat-section-surface border-b border-border/70 ${variant === "page" ? "min-h-[calc(100vh-var(--header-height))]" : ""}`}>
      <Container className="ds-section-padding">
        <SectionReveal className="ds-chat-premium ds-subtle-ring mx-auto max-w-5xl p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="ds-eyebrow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-primary ds-subtle-ring">
                <Bot className="size-4" />
                {content.badge}
              </div>
              {variant === "page" ? (
                <h1 className="ds-heading-2 mt-4 font-semibold text-foreground">{content.heading}</h1>
              ) : (
                <h2 className="ds-heading-2 mt-4 font-semibold text-foreground">{content.heading}</h2>
              )}
              <p className="ds-body-lg mt-5 text-muted-foreground">{content.description}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <MessageSquareText className="size-4" />
              {placeholder}
            </div>
          </div>

          <div className="ds-content-gap ds-radius-card border border-border/70 bg-muted/34 p-4 ds-subtle-ring shadow-[var(--elevation-1)] sm:p-6">
            {!hasMessages ? (
              <div className="ds-chat-empty flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/70 p-8 text-center">
                <div className="max-w-md">
                  <p className="text-lg font-semibold text-foreground">{content.emptyStateTitle}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{content.emptyStateDescription}</p>
                </div>
              </div>
            ) : (
              <div className="ds-chat-scroll flex flex-col gap-4 overflow-y-auto px-1 py-1">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id ?? `${message.role}-${index}`}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                    state={message.state}
                    citations={message.citations}
                  />
                ))}
              </div>
            )}

            <div className="mt-6">
              <ChatInput
                value={draft}
                onChange={(value) => setDraft(value.slice(0, MAX_ASSISTANT_HANDOFF_LENGTH))}
                isLoading={isLoading}
                disabled={false}
                onSend={handleSend}
                onCancel={() => requestController.current?.abort()}
                label={content.inputLabel}
                placeholder={content.inputPlaceholder}
                ariaLabel={content.inputAriaLabel}
                suggestionChips={suggestionChips}
                onSelectSuggestion={handleSelectSuggestion}
                maxLength={MAX_ASSISTANT_HANDOFF_LENGTH}
              />
            </div>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
