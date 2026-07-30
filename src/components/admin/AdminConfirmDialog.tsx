import { AdminModal } from "./AdminModal";

type AdminConfirmDialogProps = {
    open?: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
};

export function AdminConfirmDialog({
    open = false,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
}: AdminConfirmDialogProps) {
    return (
        <AdminModal open={open} title={title} description={description}>
            <div className="flex items-center justify-end gap-2">
                <span className="rounded-lg border border-border/70 px-3 py-1.5 text-xs text-muted-foreground">{cancelLabel}</span>
                <span className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">{confirmLabel}</span>
            </div>
        </AdminModal>
    );
}
