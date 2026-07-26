import { AIAvatar } from "@/components/ai/AIAvatar";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? <AIAvatar /> : null}
      <div
        className={cn(
          "max-w-[85%] rounded-[1.25rem] border px-4 py-3 text-sm leading-7 shadow-sm",
          isUser
            ? "border-primary/20 bg-primary text-primary-foreground"
            : "border-border/70 bg-background text-foreground",
        )}
      >
        <p className="whitespace-pre-line" dir="auto">
          {content}
        </p>
        {timestamp ? (
          <p className={cn("mt-2 text-xs opacity-70", isUser ? "text-primary-foreground/80" : "text-muted-foreground")}> 
            {timestamp}
          </p>
        ) : null}
      </div>
    </div>
  );
}
