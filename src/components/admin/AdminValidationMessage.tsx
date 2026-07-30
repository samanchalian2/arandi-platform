type AdminValidationMessageProps = {
    message?: string;
};

export function AdminValidationMessage({ message }: AdminValidationMessageProps) {
    if (!message) {
        return null;
    }

    return <p className="pt-1 text-xs text-destructive">{message}</p>;
}
