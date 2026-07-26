import { ArrowUp, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onSend?: () => void;
};

export function ChatInput({ value, onChange, disabled = false, isLoading = false, onSend }: ChatInputProps) {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-background/95 p-3 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)]">
      <label className="sr-only" htmlFor="ai-chat-input">
        Ask Arandi Assistant
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="ai-chat-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend?.();
            }
          }}
          placeholder="Ask about infrastructure, AI, or transformation..."
          rows={2}
          disabled={disabled || isLoading}
          dir="auto"
          className="min-h-[3.25rem] flex-1 resize-none rounded-2xl border border-transparent bg-muted/50 px-3 py-2 text-sm leading-7 text-foreground outline-none transition focus:border-primary/30 focus:bg-background"
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 rounded-2xl"
          disabled={disabled || isLoading || value.trim().length === 0}
          aria-label="Send message"
          onClick={() => onSend?.()}
        >
          {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
