import { AIAvatar } from "@/components/ai/AIAvatar";
import { cn } from "@/lib/utils";

export type ChatCitation = {
  id: string;
  label: string;
  href?: string;
};

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  state?: "ready" | "thinking" | "streaming";
  citations?: ChatCitation[];
};

export function ChatMessage({ role, content, timestamp, state = "ready", citations = [] }: ChatMessageProps) {
  const isUser = role === "user";
  const avatarState = state === "ready" ? "idle" : state;

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? <AIAvatar state={avatarState} animated={state !== "ready"} /> : null}
      <div
        className={cn(
          "ds-chat-bubble ds-hover-lift rounded-2xl border px-4 py-3 text-sm leading-7 shadow-[var(--elevation-1)]",
          isUser
            ? "ds-chat-bubble-user border-primary/22 text-primary-foreground"
            : "ds-chat-bubble-assistant border-border/70 text-foreground",
        )}
      >
        {state === "thinking" && !isUser ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/90">Thinking</p>
        ) : null}
        <p className="whitespace-pre-line" dir="auto">
          {content}
        </p>
        {citations.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {citations.map((citation) => (
              citation.href ? (
                <a key={citation.id} href={citation.href} target="_blank" rel="noreferrer" className="ds-chip ds-focus-visible no-underline hover:no-underline">
                  {citation.label}
                </a>
              ) : (
                <span key={citation.id} className="ds-chip">{citation.label}</span>
              )
            ))}
          </div>
        ) : null}
        {timestamp ? (
          <p className={cn("mt-2 text-xs opacity-70", isUser ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {timestamp}
          </p>
        ) : null}
      </div>
    </div>
  );
}
