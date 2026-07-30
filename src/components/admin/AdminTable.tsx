import type { ReactNode } from "react";

type AdminTableColumn = {
    key: string;
    label: string;
};

type AdminTableRow = Record<string, ReactNode>;

type AdminTableProps = {
    columns: AdminTableColumn[];
    rows: AdminTableRow[];
};

export function AdminTable({ columns, rows }: AdminTableProps) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-[var(--elevation-1)]">
            <table className="min-w-full divide-y divide-border/70">
                <thead className="bg-muted/40">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className="px-4 py-3 text-start text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {columns.map((column) => (
                                <td key={column.key} className="px-4 py-3 text-sm text-foreground">
                                    {row[column.key] ?? "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
