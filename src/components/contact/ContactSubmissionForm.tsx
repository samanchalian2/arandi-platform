"use client";

import { useState, type FormEvent } from "react";

type ContactFormContent = {
    labels: {
        fullName: string;
        workEmail: string;
        organization: string;
        topic: string;
        message: string;
    };
    placeholders: {
        fullName: string;
        workEmail: string;
        organization: string;
        topic: string;
        message: string;
    };
    note: string;
};

export function ContactSubmissionForm({
    lang,
    content,
}: {
    lang: "en" | "fa";
    content: ContactFormContent;
}) {
    const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [message, setMessage] = useState<string | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (state === "submitting") return;
        setState("submitting");
        setMessage(null);
        const form = event.currentTarget;
        const formData = new FormData(form);
        try {
            const response = await fetch("/api/public/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.get("fullName"),
                    email: formData.get("workEmail"),
                    organization: formData.get("organization"),
                    topic: formData.get("topic"),
                    message: formData.get("message"),
                    website: formData.get("website"),
                    consent: formData.get("consent") === "on",
                    language: lang,
                }),
            });
            const body = await response.json() as { message?: string; reference?: string };
            if (!response.ok) throw new Error(body.message || "Submission failed.");
            setState("success");
            setMessage(
                body.reference
                    ? `${body.message ?? ""} ${lang === "fa" ? "کد پیگیری:" : "Reference:"} ${body.reference}`
                    : body.message ?? (lang === "fa" ? "درخواست شما ثبت شد." : "Your request was received."),
            );
            form.reset();
        } catch (error) {
            setState("error");
            setMessage(error instanceof Error ? error.message : (lang === "fa" ? "ارسال درخواست ممکن نیست." : "Unable to submit."));
        }
    }

    const inputClass = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";
    return (
        <form onSubmit={submit} className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)] md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-foreground">{content.labels.fullName}</label>
                    <input id="fullName" name="fullName" required minLength={2} maxLength={120} autoComplete="name" className={inputClass} placeholder={content.placeholders.fullName} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="workEmail" className="text-sm font-medium text-foreground">{content.labels.workEmail}</label>
                    <input id="workEmail" name="workEmail" required maxLength={254} type="email" autoComplete="email" className={inputClass} placeholder={content.placeholders.workEmail} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="organization" className="text-sm font-medium text-foreground">{content.labels.organization}</label>
                    <input id="organization" name="organization" maxLength={160} autoComplete="organization" className={inputClass} placeholder={content.placeholders.organization} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="topic" className="text-sm font-medium text-foreground">{content.labels.topic}</label>
                    <input id="topic" name="topic" required minLength={2} maxLength={160} className={inputClass} placeholder={content.placeholders.topic} />
                </div>
            </div>
            <div className="mt-6 space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">{content.labels.message}</label>
                <textarea id="message" name="message" required minLength={20} maxLength={4000} rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" placeholder={content.placeholders.message} />
            </div>
            <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input name="consent" type="checkbox" required className="mt-1 size-4 accent-primary" />
                <span>
                    {lang === "fa"
                        ? "با ثبت این فرم، پردازش اطلاعات برای پاسخ‌گویی به درخواست را می‌پذیرم."
                        : "I consent to the processing of this information to respond to my request."}
                </span>
            </label>
            <div className="mt-5 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs leading-6 text-muted-foreground">{content.note}</div>
            <button
                type="submit"
                disabled={state === "submitting"}
                className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:cursor-wait disabled:opacity-60"
            >
                {state === "submitting"
                    ? (lang === "fa" ? "در حال ثبت…" : "Submitting…")
                    : (lang === "fa" ? "ثبت درخواست" : "Submit request")}
            </button>
            {message ? (
                <p role={state === "error" ? "alert" : "status"} className={`mt-4 text-sm ${state === "error" ? "text-destructive" : "text-primary"}`}>
                    {message}
                </p>
            ) : null}
        </form>
    );
}
