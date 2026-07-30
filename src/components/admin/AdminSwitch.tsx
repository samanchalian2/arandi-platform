type AdminSwitchProps = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
};

export function AdminSwitch({ label, checked, onChange, disabled }: AdminSwitchProps) {
    return (
        <label className="inline-flex items-center gap-2 text-sm">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-border/70"
            />
            <span>{label}</span>
        </label>
    );
}
