import { AdminValidationMessage } from "./AdminValidationMessage";

type SelectOption = {
    value: string;
    label: string;
};

type AdminSelectProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    error?: string;
    disabled?: boolean;
};

export function AdminSelect({ label, value, onChange, options, error, disabled }: AdminSelectProps) {
    return (
        <label className="block">
            <span className="text-sm font-medium">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                className="mt-1 h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm disabled:opacity-60"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <AdminValidationMessage message={error} />
        </label>
    );
}
