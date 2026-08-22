export type RecoveryEmail = {
    recipient: string;
    recoveryUrl: string;
    expiresAt: Date;
};

export type EmailReceipt = {
    provider: string;
    providerMessageId: string;
};

export type ContactNotificationEmail = {
    recipient: string;
    replyTo: string;
    reference: string;
    fullName: string;
    organization: string | null;
    topic: string;
    message: string;
    language: "en" | "fa";
};

export type ContactReplyEmail = {
    recipient: string;
    subject: string;
    body: string;
    language: "en" | "fa";
};

export interface EmailGateway {
    readonly provider: string;
    sendPasswordRecovery(message: RecoveryEmail): Promise<EmailReceipt>;
    sendContactNotification(message: ContactNotificationEmail): Promise<EmailReceipt>;
    sendContactReply(message: ContactReplyEmail): Promise<EmailReceipt>;
}

export class EmailGatewayUnavailableError extends Error {
    constructor(message = "Email provider is not configured.") {
        super(message);
        this.name = "EmailGatewayUnavailableError";
    }
}

class DisabledEmailGateway implements EmailGateway {
    constructor(
        readonly provider = "disabled",
        private readonly unavailableMessage = "Email provider is not configured.",
    ) {}

    async sendPasswordRecovery(): Promise<EmailReceipt> {
        throw new EmailGatewayUnavailableError(this.unavailableMessage);
    }

    async sendContactNotification(): Promise<EmailReceipt> {
        throw new EmailGatewayUnavailableError(this.unavailableMessage);
    }

    async sendContactReply(): Promise<EmailReceipt> {
        throw new EmailGatewayUnavailableError(this.unavailableMessage);
    }
}

class SmtpEmailGateway implements EmailGateway {
    readonly provider = "smtp";

    constructor(
        private readonly transport: nodemailer.Transporter,
        private readonly from: string,
    ) {}

    async sendPasswordRecovery(message: RecoveryEmail): Promise<EmailReceipt> {
        return this.send({
            to: message.recipient,
            subject: "Password recovery | Arandi",
            text: `Use this link before ${message.expiresAt.toISOString()}: ${message.recoveryUrl}`,
        });
    }

    async sendContactNotification(message: ContactNotificationEmail): Promise<EmailReceipt> {
        const title = message.language === "fa" ? "درخواست تماس جدید" : "New contact request";
        return this.send({
            to: message.recipient,
            replyTo: message.replyTo,
            subject: `[${message.reference}] ${title}: ${message.topic}`,
            text: [
                `${message.language === "fa" ? "نام" : "Name"}: ${message.fullName}`,
                `${message.language === "fa" ? "ایمیل" : "Email"}: ${message.replyTo}`,
                message.organization ? `${message.language === "fa" ? "سازمان" : "Organization"}: ${message.organization}` : null,
                `${message.language === "fa" ? "موضوع" : "Topic"}: ${message.topic}`,
                "",
                message.message,
            ].filter(Boolean).join("\n"),
        });
    }

    async sendContactReply(message: ContactReplyEmail): Promise<EmailReceipt> {
        return this.send({ to: message.recipient, subject: message.subject, text: message.body });
    }

    private async send(message: nodemailer.SendMailOptions): Promise<EmailReceipt> {
        try {
            const receipt = await this.transport.sendMail({ from: this.from, ...message });
            return { provider: this.provider, providerMessageId: receipt.messageId };
        } catch {
            throw new Error("SMTP delivery failed.");
        }
    }
}

export function getEmailGateway(
    env: Record<string, string | undefined> = process.env,
): EmailGateway {
    const provider = env.EMAIL_PROVIDER?.trim().toLowerCase();
    if (!provider || provider === "disabled") {
        return new DisabledEmailGateway();
    }
    if (provider === "smtp") {
        const host = env.SMTP_HOST?.trim();
        const port = Number(env.SMTP_PORT?.trim());
        const user = env.SMTP_USER?.trim();
        const password = env.SMTP_PASSWORD;
        const from = env.SMTP_FROM?.trim();
        if (!host || !Number.isInteger(port) || port < 1 || port > 65_535 || !user || !password || !from) {
            return new DisabledEmailGateway("smtp", "SMTP is selected but its server-only transport is not configured.");
        }
        return new SmtpEmailGateway(nodemailer.createTransport({
            host,
            port,
            secure: env.SMTP_SECURE === "true" || port === 465,
            auth: { user, pass: password },
        }), from);
    }
    throw new EmailGatewayUnavailableError("Configured email provider is unsupported.");
}
import nodemailer from "nodemailer";
