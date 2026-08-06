"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    deleteMedia,
    updateMedia,
    uploadMedia,
    useMedia,
    type MediaItem,
    type MediaMetadataInput,
    type MediaSortField,
    type MediaTypeFilter,
} from "@/lib/admin/media";

import { AdminDeleteConfirmDialog } from "./AdminDeleteConfirmDialog";
import { AdminEmptyState } from "./AdminEmptyState";
import { AdminLoading } from "./AdminLoading";
import { AdminMediaEditor } from "./AdminMediaEditor";
import { AdminMediaItem } from "./AdminMediaItem";
import { AdminMediaToolbar } from "./AdminMediaToolbar";
import { AdminMediaTypeBadge } from "./AdminMediaTypeBadge";
import { AdminPagination } from "./AdminPagination";
import { AdminSearchBar } from "./AdminSearchBar";
import { AdminTable } from "./AdminTable";

const PAGE_SIZE = 12;

type AdminMediaManagementProps = {
    canWrite: boolean;
    canDelete: boolean;
};

export function AdminMediaManagement({ canWrite, canDelete }: AdminMediaManagementProps) {
    const [search, setSearch] = useState("");
    const [type, setType] = useState<MediaTypeFilter>("all");
    const [sortBy, setSortBy] = useState<MediaSortField>("updatedAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [editorOpen, setEditorOpen] = useState(false);
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
    const queryClient = useQueryClient();

    const result = useMedia({ search, type, sortBy, sortDirection, page, pageSize: PAGE_SIZE });
    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    };
    const uploadMutation = useMutation({
        mutationFn: ({ file, input }: { file: File; input: MediaMetadataInput }) => uploadMedia(file, input),
        onSuccess: async () => {
            setEditorOpen(false);
            await refresh();
        },
    });
    const updateMutation = useMutation({
        mutationFn: ({ item, input }: { item: MediaItem; input: MediaMetadataInput }) => updateMedia(item, input),
        onSuccess: async () => {
            setEditorOpen(false);
            setSelected(null);
            await refresh();
        },
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteMedia(id),
        onSuccess: async () => {
            setDeleteTarget(null);
            await refresh();
        },
    });
    const openEditor = (item?: MediaItem) => {
        setSelected(item ?? null);
        uploadMutation.reset();
        updateMutation.reset();
        setEditorOpen(true);
    };
    const actionsFor = (item: MediaItem) => (
        <div className="flex items-center gap-1">
            {canWrite ? (
                <Button variant="ghost" size="icon-sm" onClick={() => openEditor(item)} aria-label={`Edit ${item.title}`}>
                    <Pencil />
                </Button>
            ) : null}
            {canDelete ? (
                <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => {
                        deleteMutation.reset();
                        setDeleteTarget(item);
                    }}
                    aria-label={`Delete ${item.title}`}
                >
                    <Trash2 />
                </Button>
            ) : null}
        </div>
    );
    const rows = result.items.map((item) => ({
                title: item.title,
                type: <AdminMediaTypeBadge type={item.type} />,
                dimensions: item.width && item.height ? `${item.width} × ${item.height}` : "—",
                alt: item.alt || "—",
                updatedAt: new Date(item.updatedAt).toLocaleDateString(),
                source: (
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        Open
                    </a>
                ),
                actions: actionsFor(item),
            }));

    return (
        <div className="space-y-4">
            {canWrite ? (
                <div className="flex justify-end">
                    <Button size="sm" onClick={() => openEditor()}>
                        <Plus />
                        Upload image
                    </Button>
                </div>
            ) : null}
            <AdminSearchBar
                value={search}
                placeholder="Search by title, URL, type, or alternative text..."
                onChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
            />
            <AdminMediaToolbar
                type={type}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onTypeChange={(value) => {
                    setType(value as MediaTypeFilter);
                    setPage(1);
                }}
                onSortByChange={(value) => setSortBy(value as MediaSortField)}
                onSortDirectionChange={(value) => setSortDirection(value as "asc" | "desc")}
            />

            {result.isLoading ? <AdminLoading /> : null}
            {result.isError ? (
                <AdminEmptyState title="Unable to load media" description={result.errorMessage ?? "Unexpected error"} />
            ) : null}
            {!result.isLoading && !result.isError && result.total === 0 ? (
                <AdminEmptyState
                    title="No media found"
                    description="No assets match the current search and type filter."
                />
            ) : null}

            {!result.isLoading && !result.isError && result.total > 0 ? (
                <>
                    <div className="hidden md:block">
                        <AdminTable
                            columns={[
                                { key: "title", label: "Title" },
                                { key: "type", label: "Type" },
                                { key: "dimensions", label: "Dimensions" },
                                { key: "alt", label: "Alternative text" },
                                { key: "updatedAt", label: "Updated" },
                                { key: "source", label: "Source" },
                                ...(canWrite || canDelete ? [{ key: "actions", label: "Actions" }] : []),
                            ]}
                            rows={rows}
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:hidden">
                        {result.items.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <AdminMediaItem item={item} />
                                {canWrite || canDelete ? (
                                    <div className="flex justify-end">{actionsFor(item)}</div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                    <AdminPagination
                        page={page}
                        totalPages={result.totalPages}
                        totalItems={result.total}
                        onPageChange={setPage}
                    />
                </>
            ) : null}

            {!result.isLoading ? (
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => void result.refetch()}>
                        Refresh
                    </Button>
                </div>
            ) : null}

            {editorOpen ? (
                <AdminMediaEditor
                    open
                    item={selected}
                    saving={uploadMutation.isPending || updateMutation.isPending}
                    error={
                        uploadMutation.error instanceof Error
                            ? uploadMutation.error.message
                            : updateMutation.error instanceof Error
                                ? updateMutation.error.message
                                : null
                    }
                    onCancel={() => {
                        if (!uploadMutation.isPending && !updateMutation.isPending) {
                            setEditorOpen(false);
                            setSelected(null);
                        }
                    }}
                    onSubmit={(input, file) => {
                        if (selected) {
                            updateMutation.mutate({ item: selected, input });
                        } else if (file) {
                            uploadMutation.mutate({ file, input });
                        }
                    }}
                />
            ) : null}
            <AdminDeleteConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete media"
                description={`Delete “${deleteTarget?.title ?? ""}” permanently? Attached media cannot be deleted.`}
                deleting={deleteMutation.isPending}
                onCancel={() => {
                    if (!deleteMutation.isPending) setDeleteTarget(null);
                }}
                onConfirm={() => {
                    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
                }}
            />
            {deleteMutation.error instanceof Error ? (
                <p role="alert" className="text-sm text-destructive">{deleteMutation.error.message}</p>
            ) : null}
        </div>
    );
}
