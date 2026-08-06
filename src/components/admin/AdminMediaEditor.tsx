"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { MediaItem, MediaMetadataInput } from "@/lib/admin/media";

import { AdminModal } from "./AdminModal";
import { AdminTextarea } from "./AdminTextarea";
import { AdminTextField } from "./AdminTextField";

type AdminMediaEditorProps = {
    open: boolean;
    item?: MediaItem | null;
    saving: boolean;
    error?: string | null;
    onCancel: () => void;
    onSubmit: (input: MediaMetadataInput, file?: File) => void;
};

export function AdminMediaEditor({
    open,
    item,
    saving,
    error,
    onCancel,
    onSubmit,
}: AdminMediaEditorProps) {
    const [title, setTitle] = useState(item?.title ?? "");
    const [alt, setAlt] = useState(item?.alt ?? "");
    const [caption, setCaption] = useState(item?.caption ?? "");
    const [file, setFile] = useState<File | undefined>();

    const titleError = title.trim() ? undefined : "Title is required.";
    const fileError = !item && !file ? "Choose a JPEG, PNG, or WebP image." : undefined;

    return (
        <AdminModal
            open={open}
            onClose={onCancel}
            title={item ? "Edit media details" : "Upload image"}
            description={item
                ? "Update accessible text and editorial metadata."
                : "Images are validated, sanitised, and stored with a random filename."}
        >
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (titleError || fileError) return;
                    onSubmit({ title: title.trim(), alt: alt.trim(), caption: caption.trim() }, file);
                }}
            >
                {!item ? (
                    <label className="block">
                        <span className="text-sm font-medium">Image file</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={saving}
                            onChange={(event) => setFile(event.target.files?.[0])}
                            className="mt-1 block w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm file:me-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                        />
                        {fileError ? <span className="mt-1 block text-xs text-destructive">{fileError}</span> : null}
                    </label>
                ) : null}
                <AdminTextField
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    maxLength={200}
                    error={titleError}
                    disabled={saving}
                />
                <AdminTextField
                    label="Alternative text"
                    value={alt}
                    onChange={setAlt}
                    maxLength={500}
                    disabled={saving}
                />
                <AdminTextarea
                    label="Caption"
                    value={caption}
                    onChange={setCaption}
                    maxLength={2000}
                    rows={3}
                    disabled={saving}
                />
                {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={saving || Boolean(titleError || fileError)}>
                        {saving ? "Saving..." : item ? "Save changes" : "Upload"}
                    </Button>
                </div>
            </form>
        </AdminModal>
    );
}
