import { Button } from "@/components/ui/button";

import { AdminCancelButton } from "./AdminCancelButton";

type AdminSaveBarProps = {
    dirty: boolean;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
};

export function AdminSaveBar({ dirty, saving, onSave, onCancel }: AdminSaveBarProps) {
    return (
        <div className="sticky bottom-3 z-20 flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-[var(--elevation-2)]">
            <p className="text-sm text-muted-foreground">{dirty ? "You have unsaved changes" : "No pending changes"}</p>
            <div className="flex items-center gap-2">
                <AdminCancelButton onClick={onCancel} disabled={saving} />
                <Button size="sm" onClick={onSave} disabled={!dirty || saving}>
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    );
}
