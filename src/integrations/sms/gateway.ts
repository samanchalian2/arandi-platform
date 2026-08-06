export type OtpDelivery = {
    phoneE164: string;
    code: string;
    purpose: "login" | "registration" | "phone_verification";
};

export type DeliveryReceipt = {
    provider: string;
    providerMessageId: string;
};

export interface SmsGateway {
    readonly provider: string;
    sendOtp(delivery: OtpDelivery): Promise<DeliveryReceipt>;
}

export class SmsGatewayUnavailableError extends Error {
    constructor(message = "SMS provider is not configured.") {
        super(message);
        this.name = "SmsGatewayUnavailableError";
    }
}

class DisabledSmsGateway implements SmsGateway {
    readonly provider = "disabled";

    async sendOtp(): Promise<DeliveryReceipt> {
        throw new SmsGatewayUnavailableError();
    }
}

export function getSmsGateway(
    env: Record<string, string | undefined> = process.env,
): SmsGateway {
    const provider = env.SMS_PROVIDER?.trim().toLowerCase();
    if (!provider || provider === "disabled") {
        return new DisabledSmsGateway();
    }
    if (provider === "smsir") {
        throw new SmsGatewayUnavailableError(
            "SMS.ir is selected but its verified provider adapter is not configured.",
        );
    }
    throw new SmsGatewayUnavailableError("Configured SMS provider is unsupported.");
}
