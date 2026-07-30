import { AdminValidationMessage } from "./AdminValidationMessage";

type AdminTextFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    maxLength?: number;
    disabled?: boolean;
};

export function AdminTextField({
    label,
    value,
    onChange,
    placeholder,
    error,
    maxLength,
    disabled,
}: AdminTextFieldProps) {
    return (
        <label className="block">
            <span className="text-sm font-medium">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                className="mt-1 h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm disabled:opacity-60"
            />
            <AdminValidationMessage message={error} />
        </label>
    );
}
