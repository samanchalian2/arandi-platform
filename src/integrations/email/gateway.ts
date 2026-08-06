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

export interface EmailGateway {
    readonly provider: string;
    sendPasswordRecovery(message: RecoveryEmail): Promise<EmailReceipt>;
    sendContactNotification(message: ContactNotificationEmail): Promise<EmailReceipt>;
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
}

export function getEmailGateway(
    env: Record<string, string | undefined> = process.env,
): EmailGateway {
    const provider = env.EMAIL_PROVIDER?.trim().toLowerCase();
    if (!provider || provider === "disabled") {
        return new DisabledEmailGateway();
    }
    if (provider === "smtp") {
        return new DisabledEmailGateway(
            "smtp",
            "SMTP is selected but its server-only transport is not configured.",
        );
    }
    throw new EmailGatewayUnavailableError("Configured email provider is unsupported.");
}
