import { Button } from "@/components/ui/button";
import type { CardListItem } from "@/lib/admin/cards";

type AdminCardOrderEditorProps = {
    items: CardListItem[];
    disabled: boolean;
    saving: boolean;
    dirty: boolean;
    errorMessage: string | null;
    onMove: (id: string, direction: -1 | 1) => void;
    onSave: () => void;
    onReset: () => void;
};

export function AdminCardOrderEditor({
    items,
    disabled,
    saving,
    dirty,
    errorMessage,
    onMove,
    onSave,
    onReset,
}: AdminCardOrderEditorProps) {
    return (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="font-semibold">Card order</h2>
                    <p className="text-sm text-muted-foreground">
                        {disabled ? "Clear search and filters to reorder the complete collection." : "Preview, then save canonical order."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={onReset} disabled={!dirty || saving}>
                        Reset
                    </Button>
                    <Button type="button" size="sm" onClick={onSave} disabled={disabled || !dirty || saving}>
                        {saving ? "Saving..." : "Save Order"}
                    </Button>
                </div>
            </div>
            <ol className="space-y-2">
                {items.map((card, index) => (
                    <li key={card.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-border/60 p-3">
                        <span className="w-7 shrink-0 text-sm font-semibold">{index + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-sm">{card.title} ({card.key})</span>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={`Move ${card.title} up`}
                            disabled={disabled || saving || index === 0}
                            onClick={() => onMove(card.id, -1)}
                        >
                            Up
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={`Move ${card.title} down`}
                            disabled={disabled || saving || index === items.length - 1}
                            onClick={() => onMove(card.id, 1)}
                        >
                            Down
                        </Button>
                    </li>
                ))}
            </ol>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
        </section>
    );
}
