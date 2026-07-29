import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type AIAvatarProps = {
  state?: "idle" | "thinking" | "streaming";
  animated?: boolean;
};

export function AIAvatar({ state = "idle", animated = false }: AIAvatarProps) {
  return (
    <div
      className={cn(
        "ds-subtle-ring flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-primary shadow-[var(--elevation-1)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        state === "streaming" && "scale-[1.03]",
        animated && state !== "idle" && "ds-thinking-pulse",
      )}
      aria-hidden="true"
    >
      <Sparkles className="size-5" />
    </div>
  );
}
