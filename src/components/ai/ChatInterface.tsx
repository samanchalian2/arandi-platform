"use client";

import { useMemo, useState } from "react";
import { Bot, MessageSquareText } from "lucide-react";

import { AIAvatar } from "@/components/ai/AIAvatar";
import { ChatInput } from "@/components/ai/ChatInput";
import { ChatMessage } from "@/components/ai/ChatMessage";
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
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ChatInterfaceProps = {
  content: ChatContent;
  lang: "en" | "fa";
};

export function ChatInterface({ content, lang }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: content.initialMessage,
      timestamp: "Now",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasMessages = messages.length > 0;

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
      { role: "user", content: trimmed, timestamp: "Now" },
      {
        role: "assistant",
        content: content.assistantReply,
        timestamp: "Preparing",
      },
    ]);
    setDraft("");
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  return (
    <section id="assistant" dir={lang === "fa" ? "rtl" : "ltr"} className="border-b border-border/70 bg-[linear-gradient(180deg,_rgba(240,246,255,0.95),_rgba(255,255,255,1))]">
      <Container className="py-20 md:py-24 lg:py-28">
        <SectionReveal className="mx-auto max-w-5xl rounded-[2rem] border border-border/70 bg-background/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Bot className="size-4" />
                {content.badge}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
                {content.heading}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">{content.description}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <MessageSquareText className="size-4" />
              {placeholder}
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-border/70 bg-muted/30 p-4 sm:p-6">
            {!hasMessages ? (
              <div className="flex min-h-[18rem] items-center justify-center rounded-[1.25rem] border border-dashed border-border/70 bg-background/70 p-8 text-center">
                <div className="max-w-md">
                  <p className="text-lg font-semibold text-foreground">{content.emptyStateTitle}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{content.emptyStateDescription}</p>
                </div>
              </div>
            ) : (
              <div className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto px-1 py-1">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={`${message.role}-${index}`}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading ? (
                  <div className="flex justify-start gap-3">
                    <AIAvatar />
                    <div className="rounded-[1.25rem] border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
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
              />
            </div>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
