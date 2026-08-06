import { ArrowUp, LoaderCircle, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onSend?: () => void;
  onCancel?: () => void;
  label: string;
  placeholder: string;
  ariaLabel: string;
  suggestionChips?: string[];
  onSelectSuggestion?: (value: string) => void;
};

export function ChatInput({
  value,
  onChange,
  disabled = false,
  isLoading = false,
  onSend,
  onCancel,
  label,
  placeholder,
  ariaLabel,
  suggestionChips = [],
  onSelectSuggestion,
}: ChatInputProps) {
  return (
    <div className="ds-chat-shell ds-chat-input-area ds-subtle-ring rounded-2xl p-3 shadow-[var(--elevation-1)]">
      <label className="sr-only" htmlFor="ai-chat-input">
        {label}
      </label>
      {suggestionChips.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="ds-chip ds-focus-visible text-xs"
              onClick={() => onSelectSuggestion?.(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
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
          placeholder={placeholder}
          rows={2}
          disabled={disabled || isLoading}
          dir="auto"
          className="ds-focus-visible min-h-14 flex-1 resize-none rounded-2xl border border-transparent bg-muted/55 px-3 py-2 text-sm leading-7 text-foreground outline-none transition duration-[var(--duration-base)] ease-[var(--ease-standard)] focus:border-primary/30 focus:bg-background"
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 rounded-2xl shadow-[var(--elevation-1)]"
          disabled={disabled || (!isLoading && value.trim().length === 0)}
          aria-label={isLoading ? "Stop response" : ariaLabel}
          onClick={() => isLoading ? onCancel?.() : onSend?.()}
        >
          {isLoading
            ? onCancel
              ? <Square className="size-4" />
              : <LoaderCircle className="size-4 animate-spin" />
            : <ArrowUp className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
