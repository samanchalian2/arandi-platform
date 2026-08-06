"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function PasswordRecovery() {
    const [token, setToken] = useState<string | null | undefined>(undefined);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        const recoveryToken = url.searchParams.get("token");
        queueMicrotask(() => setToken(recoveryToken));
        if (recoveryToken) {
            url.searchParams.delete("token");
            window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        }
    }, []);

    const resetting = Boolean(token);

    if (token === undefined) {
        return (
            <div className="w-full max-w-lg rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground shadow-[var(--elevation-2)]">
                Preparing secure recovery…
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--elevation-2)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Secure account access</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                {resetting ? "Choose a new password" : "Recover your password"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {resetting
                    ? "Use at least 12 characters with a letter and a number."
                    : "Enter your verified email. If an eligible account exists, we will send a time-limited link."}
            </p>
            <form
                className="mt-6 space-y-4"
                onSubmit={async (event) => {
                    event.preventDefault();
                    setError(null);
                    setMessage(null);
                    if (resetting && password !== confirmPassword) {
                        setError("Passwords do not match.");
                        return;
                    }
                    setPending(true);
                    try {
                        const response = await fetch(
                            resetting ? "/api/auth/recovery/consume" : "/api/auth/recovery/request",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(resetting ? { token, password } : { email }),
                            },
                        );
                        const body = await response.json() as { message?: string };
                        if (!response.ok) {
                            setError(body.message ?? "Recovery is unavailable.");
                            return;
                        }
                        setMessage(resetting
                            ? "Your password has been changed. You can now sign in."
                            : body.message ?? "If the account is eligible, a recovery link will be sent.");
                        if (resetting) {
                            setPassword("");
                            setConfirmPassword("");
                        }
                    } catch {
                        setError("Recovery is unavailable.");
                    } finally {
                        setPending(false);
                    }
                }}
            >
                {resetting ? (
                    <>
                        <label className="block">
                            <span className="text-sm font-medium">New password</span>
                            <input
                                type="password"
                                autoComplete="new-password"
                                minLength={12}
                                maxLength={128}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                disabled={pending}
                                required
                                className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium">Confirm new password</span>
                            <input
                                type="password"
                                autoComplete="new-password"
                                minLength={12}
                                maxLength={128}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                disabled={pending}
                                required
                                className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                            />
                        </label>
                    </>
                ) : (
                    <label className="block">
                        <span className="text-sm font-medium">Verified email</span>
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={pending}
                            required
                            className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                        />
                    </label>
                )}
                {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
                {message ? <p role="status" className="text-sm text-foreground">{message}</p> : null}
                <Button className="w-full" type="submit" disabled={pending}>
                    {pending ? "Please wait..." : resetting ? "Change password" : "Send recovery link"}
                </Button>
            </form>
            <div className="mt-5 text-center">
                <Link href="/admin/login" className="text-sm font-medium text-primary hover:underline">
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}
