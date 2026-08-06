import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminForbiddenPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border/70 bg-card p-6 text-center shadow-[var(--elevation-2)]">
        <p className="text-sm font-semibold text-destructive">403</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your current role is not allowed to view this admin route.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button render={<Link href="/admin/dashboard" />} nativeButton={false} variant="outline">
            Back to dashboard
          </Button>
          <Button render={<Link href="/admin/login?logout=true" />} nativeButton={false} variant="default">
            Switch mock role
          </Button>
        </div>
      </div>
    </div>
  );
}
