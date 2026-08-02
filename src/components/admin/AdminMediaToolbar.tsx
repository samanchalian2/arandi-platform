import { AdminSelect } from "./AdminSelect";

type AdminMediaToolbarProps = {
    type: string;
    sortBy: string;
    sortDirection: string;
    onTypeChange: (value: string) => void;
    onSortByChange: (value: string) => void;
    onSortDirectionChange: (value: string) => void;
};

export function AdminMediaToolbar({
    type,
    sortBy,
    sortDirection,
    onTypeChange,
    onSortByChange,
    onSortDirectionChange,
}: AdminMediaToolbarProps) {
    return (
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 md:grid-cols-3">
            <AdminSelect
                label="Asset type"
                value={type}
                onChange={onTypeChange}
                options={[
                    { value: "all", label: "All types" },
                    { value: "image", label: "Images" },
                    { value: "video", label: "Videos" },
                    { value: "document", label: "Documents" },
                    { value: "other", label: "Other" },
                ]}
            />
            <AdminSelect
                label="Sort by"
                value={sortBy}
                onChange={onSortByChange}
                options={[
                    { value: "updatedAt", label: "Last updated" },
                    { value: "title", label: "Title" },
                    { value: "type", label: "Type" },
                ]}
            />
            <AdminSelect
                label="Direction"
                value={sortDirection}
                onChange={onSortDirectionChange}
                options={[
                    { value: "desc", label: "Descending" },
                    { value: "asc", label: "Ascending" },
                ]}
            />
        </div>
    );
}
