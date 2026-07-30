import { Button } from "@/components/ui/button";

import { AdminModal } from "./AdminModal";

type AdminDeleteConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    deleting?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function AdminDeleteConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    deleting = false,
    onConfirm,
    onCancel,
}: AdminDeleteConfirmDialogProps) {
    return (
        <AdminModal open={open} title={title} description={description}>
            <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onCancel} disabled={deleting}>
                    {cancelLabel}
                </Button>
                <Button variant="destructive" size="sm" onClick={onConfirm} disabled={deleting}>
                    {deleting ? "Deleting..." : confirmLabel}
                </Button>
            </div>
        </AdminModal>
    );
}
