"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type AdminProductionLoginProps = {
    nextPath: string;
    recoveryHref?: string;
};

export function AdminProductionLogin({
    nextPath,
    recoveryHref = "/recover?audience=admin",
}: AdminProductionLoginProps) {
    const [mode, setMode] = useState<"password" | "otp">("password");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="mt-6">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1" role="tablist" aria-label="Sign-in method">
                {(["password", "otp"] as const).map((method) => (
                    <button
                        key={method}
                        type="button"
                        role="tab"
                        aria-selected={mode === method}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                            mode === method ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                        onClick={() => {
                            setMode(method);
                            setError(null);
                        }}
                    >
                        {method === "password" ? "Password" : "SMS code"}
                    </button>
                ))}
            </div>
        <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
                event.preventDefault();
                setPending(true);
                setError(null);
                try {
                    const endpoint = mode === "password"
                        ? "/api/auth/password"
                        : otpRequested
                            ? "/api/auth/otp/verify"
                            : "/api/auth/otp/request";
                    const payload = mode === "password"
                        ? { identifier, password }
                        : otpRequested
                            ? { phone, code }
                            : { phone };
                    const response = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    const body = await response.json() as { message?: string };
                    if (!response.ok) {
                        setError(body.message ?? "Invalid credentials.");
                        return;
                    }
                    if (mode === "otp" && !otpRequested) {
                        setOtpRequested(true);
                        return;
                    }
                    window.location.assign(nextPath);
                } catch {
                    setError("Authentication is unavailable.");
                } finally {
                    setPending(false);
                }
            }}
        >
            {mode === "password" ? <>
            <label className="block">
                <span className="text-sm font-medium">Mobile number or email</span>
                <input
                    name="identifier"
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    disabled={pending}
                    required
                    className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                />
            </label>
            <label className="block">
                <span className="text-sm font-medium">Password</span>
                <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={pending}
                    required
                    className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                />
            </label>
            <div className="text-end">
                <Link className="text-sm font-medium text-primary hover:underline" href={recoveryHref}>
                    Forgot password?
                </Link>
            </div>
            </> : <>
            <label className="block">
                <span className="text-sm font-medium">Iranian mobile number</span>
                <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => {
                        setPhone(event.target.value);
                        setOtpRequested(false);
                    }}
                    disabled={pending}
                    required
                    className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                />
            </label>
            {otpRequested ? (
                <label className="block">
                    <span className="text-sm font-medium">Six-digit code</span>
                    <input
                        name="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={code}
                        onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        disabled={pending}
                        required
                        className="mt-1 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm tracking-[0.35em]"
                    />
                </label>
            ) : null}
            </>}
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
                {pending
                    ? "Please wait..."
                    : mode === "otp" && !otpRequested
                        ? "Send code"
                        : "Sign in"}
            </Button>
        </form>
        </div>
    );
}
