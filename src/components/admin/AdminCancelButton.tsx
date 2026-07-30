import { Button } from "@/components/ui/button";

type AdminCancelButtonProps = {
    onClick: () => void;
    disabled?: boolean;
};

export function AdminCancelButton({ onClick, disabled }: AdminCancelButtonProps) {
    return (
        <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
            Cancel
        </Button>
    );
}
