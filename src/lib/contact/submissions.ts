import { randomBytes } from "node:crypto";

import { Prisma } from "@prisma/client";

import {
    EmailGatewayUnavailableError,
    type EmailGateway,
} from "@/integrations/email/gateway";
import { normalizeEmail } from "@/lib/auth/identifiers";
import { hashSensitiveValue } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export type ContactSubmissionInput = {
    fullName: string;
    email: string;
    organization: string | null;
    topic: string;
    message: string;
    language: "en" | "fa";
    consent: true;
};

export type ContactSubmissionContext = {
    ip: string | null;
    userAgent: string | null;
    pepper: string;
};

export class ContactValidationError extends Error {}
export class ContactRateLimitError extends Error {}

function boundedPlainText(
    value: unknown,
    field: string,
    minimum: number,
    maximum: number,
): string {
    if (typeof value !== "string") throw new ContactValidationError(`${field} is required.`);
    const text = value.trim().replace(/\r\n/g, "\n");
    if (
        text.length < minimum
        || text.length > maximum
        || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)
    ) {
        throw new ContactValidationError(`${field} is invalid.`);
    }
    return text;
}

export function parseContactSubmissionInput(body: Record<string, unknown>): ContactSubmissionInput {
    if (body.consent !== true) throw new ContactValidationError("consent is required.");
    const organization = typeof body.organization === "string" && body.organization.trim()
        ? boundedPlainText(body.organization, "organization", 2, 160)
        : null;
    let email: string;
    try {
        email = normalizeEmail(boundedPlainText(body.email, "email", 5, 254));
    } catch {
        throw new ContactValidationError("email is invalid.");
    }
    return {
        fullName: boundedPlainText(body.fullName, "fullName", 2, 120),
        email,
        organization,
        topic: boundedPlainText(body.topic, "topic", 2, 160),
        message: boundedPlainText(body.message, "message", 20, 4_000),
        language: body.language === "fa" ? "fa" : "en",
        consent: true,
    };
}

function reference(): string {
    return `CNT-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export async function acceptContactSubmission(
    input: ContactSubmissionInput,
    context: ContactSubmissionContext,
    gateway: EmailGateway,
    recipient: string,
    now = new Date(),
): Promise<{ reference: string; deliveryState: string; duplicate: boolean }> {
    const ipHash = context.ip ? hashSensitiveValue(context.ip, context.pepper) : null;
    const userAgentHash = context.userAgent
        ? hashSensitiveValue(context.userAgent, context.pepper)
        : null;
    const clientKey = ipHash ?? userAgentHash ?? "anonymous";
    const hourBucket = Math.floor(now.getTime() / 3_600_000);
    const dedupeHash = hashSensitiveValue([
        clientKey,
        input.email,
        input.topic,
        input.message,
        hourBucket,
    ].join("\n"), context.pepper);
    const hourStart = new Date(now.getTime() - 3_600_000);
    const cooldownStart = new Date(now.getTime() - 60_000);

    if (ipHash) {
        const [recentCount, latest] = await Promise.all([
            prisma.contactSubmission.count({
                where: { ipHash, createdAt: { gte: hourStart } },
            }),
            prisma.contactSubmission.findFirst({
                where: { ipHash },
                orderBy: { createdAt: "desc" },
                select: { createdAt: true, dedupeHash: true },
            }),
        ]);
        if (recentCount >= 5 || (latest && latest.createdAt > cooldownStart && latest.dedupeHash !== dedupeHash)) {
            throw new ContactRateLimitError("Contact submission rate limit exceeded.");
        }
    }

    let submission;
    try {
        submission = await prisma.contactSubmission.create({
            data: {
                reference: reference(),
                fullName: input.fullName,
                email: input.email,
                organization: input.organization,
                topic: input.topic,
                message: input.message,
                languageCode: input.language,
                consentAt: now,
                ipHash,
                userAgentHash,
                dedupeHash,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const existing = await prisma.contactSubmission.findUniqueOrThrow({
                where: { dedupeHash },
                select: { reference: true, deliveryState: true },
            });
            return { ...existing, duplicate: true };
        }
        throw error;
    }

    try {
        const receipt = await gateway.sendContactNotification({
            recipient,
            replyTo: input.email,
            reference: submission.reference,
            fullName: input.fullName,
            organization: input.organization,
            topic: input.topic,
            message: input.message,
            language: input.language,
        });
        await prisma.contactSubmission.update({
            where: { id: submission.id },
            data: {
                deliveryState: "sent",
                deliveryAttempts: 1,
                lastDeliveryAt: now,
                deliveryProvider: receipt.provider,
                providerMessageId: receipt.providerMessageId,
            },
        });
        return { reference: submission.reference, deliveryState: "sent", duplicate: false };
    } catch (error) {
        const deliveryState = error instanceof EmailGatewayUnavailableError ? "unavailable" : "failed";
        await prisma.contactSubmission.update({
            where: { id: submission.id },
            data: {
                deliveryState,
                deliveryAttempts: 1,
                lastDeliveryAt: now,
                deliveryProvider: gateway.provider,
            },
        });
        return { reference: submission.reference, deliveryState, duplicate: false };
    }
}
