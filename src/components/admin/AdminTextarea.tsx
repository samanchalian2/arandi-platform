import { AdminValidationMessage } from "./AdminValidationMessage";

type AdminTextareaProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
    maxLength?: number;
    disabled?: boolean;
};

export function AdminTextarea({
    label,
    value,
    onChange,
    placeholder,
    rows = 4,
    error,
    maxLength,
    disabled,
}: AdminTextareaProps) {
    return (
        <label className="block">
            <span className="text-sm font-medium">{label}</span>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                disabled={disabled}
                className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm disabled:opacity-60"
            />
            <AdminValidationMessage message={error} />
        </label>
    );
}
