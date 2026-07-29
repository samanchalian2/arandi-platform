"use client";

import { useMemo, useState } from "react";
import { Bot, MessageSquareText } from "lucide-react";

import { AIAvatar } from "@/components/ai/AIAvatar";
import { ChatInput } from "@/components/ai/ChatInput";
import { ChatMessage, type ChatCitation } from "@/components/ai/ChatMessage";
import { Container } from "@/components/layout/Container";
import { SectionReveal } from "@/components/ui/SectionReveal";

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
};

export function ChatInterface({ content, lang }: ChatInterfaceProps) {
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

  const hasMessages = messages.length > 0;
  const lastAssistantMessage = [...messages].reverse().find((item) => item.role === "assistant");

  const placeholder = useMemo(() => {
    if (messages.length === 1) {
      return content.placeholder;
    }
    return content.assistantHint;
  }, [content.assistantHint, content.placeholder, messages.length]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: trimmed, timestamp: "Now", state: "ready" },
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: content.assistantReply,
        timestamp: "Preparing",
        state: "thinking",
        citations: [],
        suggestions: [],
      },
    ]);
    setDraft("");
    setIsLoading(true);

    window.setTimeout(() => {
      setMessages((current) =>
        current.map((item, index) =>
          index === current.length - 1 && item.role === "assistant"
            ? { ...item, state: "ready", timestamp: "Now" }
            : item,
        ),
      );
      setIsLoading(false);
    }, 700);
  };

  const suggestionChips = lastAssistantMessage?.suggestions ?? [];

  const handleSelectSuggestion = (value: string) => {
    setDraft(value);
  };

  return (
    <section id="assistant" dir={lang === "fa" ? "rtl" : "ltr"} className="ds-chat-section-surface border-b border-border/70">
      <Container className="ds-section-padding">
        <SectionReveal className="ds-chat-premium ds-subtle-ring mx-auto max-w-5xl p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="ds-eyebrow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-primary ds-subtle-ring">
                <Bot className="size-4" />
                {content.badge}
              </div>
              <h2 className="ds-heading-2 mt-4 font-semibold text-foreground">
                {content.heading}
              </h2>
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
                {isLoading ? (
                  <div className="flex justify-start gap-3">
                    <AIAvatar state="thinking" animated />
                    <div className="ds-thinking-pulse rounded-2xl border border-border/70 bg-background/92 px-4 py-3 text-sm text-muted-foreground shadow-[var(--elevation-1)]">
                      {content.loadingText}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-6">
              <ChatInput
                value={draft}
                onChange={setDraft}
                isLoading={isLoading}
                disabled={false}
                onSend={handleSend}
                label={content.inputLabel}
                placeholder={content.inputPlaceholder}
                ariaLabel={content.inputAriaLabel}
                suggestionChips={suggestionChips}
                onSelectSuggestion={handleSelectSuggestion}
              />
            </div>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
