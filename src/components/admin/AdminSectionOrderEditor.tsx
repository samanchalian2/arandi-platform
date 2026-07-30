import { Button } from "@/components/ui/button";

type AdminSectionOrderEditorProps = {
    canReorder: boolean;
    dirty: boolean;
    saving: boolean;
    onSave: () => void;
    onReset: () => void;
};

export function AdminSectionOrderEditor({ canReorder, dirty, saving, onSave, onReset }: AdminSectionOrderEditorProps) {
    if (!canReorder) {
        return (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                Reordering is disabled for your role.
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground">{dirty ? "Reorder preview active. Save to apply." : "Drag sections to reorder."}</p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onReset} disabled={!dirty || saving}>
                    Reset
                </Button>
                <Button size="sm" onClick={onSave} disabled={!dirty || saving}>
                    {saving ? "Saving..." : "Save Order"}
                </Button>
            </div>
        </div>
    );
}
