"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { usePage } from "@/lib/admin/pages";
import { useSections } from "@/lib/admin/sections";

import { buttonVariants } from "@/components/ui/button";

import { AdminEmptyState } from "./AdminEmptyState";
import { AdminLoading } from "./AdminLoading";
import { AdminSectionList } from "./AdminSectionList";
import { AdminSectionToolbar } from "./AdminSectionToolbar";

type AdminPageSectionsManagementProps = {
    identifier: string;
    currentRole: "SuperAdmin" | "Admin" | "Editor" | "Translator" | "Viewer";
};

export function AdminPageSectionsManagement({ identifier, currentRole }: AdminPageSectionsManagementProps) {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "fa" ? "fa" : "en";

    const pageResult = usePage(identifier, lang);
    const sectionsResult = useSections(pageResult.data?.page.id ?? null, lang);

    if (pageResult.isLoading) {
        return <AdminLoading />;
    }

    if (pageResult.isError || !pageResult.data) {
        return <AdminEmptyState title="Unable to load page" description={pageResult.errorMessage ?? "Unexpected error"} />;
    }

    const backHref = `/admin/pages/${identifier}?lang=${lang}`;
    const canReorder = currentRole === "SuperAdmin" || currentRole === "Admin" || currentRole === "Editor";

    return (
        <div className="space-y-4">
            <AdminSectionToolbar
                title={`Sections: ${pageResult.data.page.translation?.title ?? identifier}`}
                description="Section list with edit navigation and order management"
                sectionCount={sectionsResult.sectionCount}
                actions={
                    <Link href={backHref} className={buttonVariants({ size: "sm", variant: "outline" })}>
                        Back to Page Details
                    </Link>
                }
            />

            <AdminSectionList
                sections={sectionsResult.items}
                isLoading={sectionsResult.isLoading}
                isError={sectionsResult.isError}
                errorMessage={sectionsResult.errorMessage}
                pageId={pageResult.data.page.id}
                pageIdentifier={identifier}
                lang={lang}
                canReorder={canReorder}
            />
        </div>
    );
}
