import { AdminSearchBar } from "./AdminSearchBar";
import { AdminSelect } from "./AdminSelect";

type AdminCardToolbarProps = {
    search: string;
    publishState: string;
    language: string;
    media: string;
    onSearchChange: (value: string) => void;
    onPublishStateChange: (value: string) => void;
    onLanguageChange: (value: string) => void;
    onMediaChange: (value: string) => void;
};

export function AdminCardToolbar({
    search,
    publishState,
    language,
    media,
    onSearchChange,
    onPublishStateChange,
    onLanguageChange,
    onMediaChange,
}: AdminCardToolbarProps) {
    return (
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 md:grid-cols-4">
            <AdminSearchBar value={search} onChange={onSearchChange} placeholder="Search title or key" />
            <AdminSelect
                label="Publish state"
                value={publishState}
                onChange={onPublishStateChange}
                options={[
                    { value: "all", label: "All states" },
                    { value: "draft", label: "Draft" },
                    { value: "in_review", label: "In review" },
                    { value: "approved", label: "Approved" },
                    { value: "published", label: "Published" },
                    { value: "archived", label: "Archived" },
                ]}
            />
            <AdminSelect
                label="Language"
                value={language}
                onChange={onLanguageChange}
                options={[
                    { value: "all", label: "All languages" },
                    { value: "en", label: "Has EN" },
                    { value: "fa", label: "Has FA" },
                ]}
            />
            <AdminSelect
                label="Media"
                value={media}
                onChange={onMediaChange}
                options={[
                    { value: "all", label: "Any media state" },
                    { value: "present", label: "Has media" },
                    { value: "missing", label: "No media" },
                ]}
            />
        </div>
    );
}
