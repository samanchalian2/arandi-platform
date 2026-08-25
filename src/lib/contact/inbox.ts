import { Prisma } from "@prisma/client";

import { getEmailGateway, EmailGatewayUnavailableError, type EmailGateway } from "@/integrations/email/gateway";
import { prisma } from "@/lib/prisma";
import { getContactNotificationRecipient } from "./notifications";

export const contactStatuses = ["received", "in_progress", "replied", "closed"] as const;
export type ContactStatus = typeof contactStatuses[number];

export function parseContactStatus(value: unknown): ContactStatus {
    if (typeof value !== "string" || !contactStatuses.includes(value as ContactStatus)) throw new Error("Contact status is invalid.");
    return value as ContactStatus;
}

export function parseReplyBody(value: unknown): string {
    if (typeof value !== "string") throw new Error("Reply text is required.");
    const body = value.trim().replace(/\r\n/g, "\n");
    if (body.length < 2 || body.length > 8_000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(body)) throw new Error("Reply text is invalid.");
    return body;
}

export function parseReplySubject(value: unknown): string {
    if (typeof value !== "string") throw new Error("Reply subject is required.");
    const subject = value.trim().replace(/[\r\n]+/g, " ");
    if (subject.length < 2 || subject.length > 200) throw new Error("Reply subject is invalid.");
    return subject;
}

export async function sendContactReply(input: { submissionId: string; authorId: string; subject: string; body: string }, gateway: EmailGateway = getEmailGateway()) {
    const submission = await prisma.contactSubmission.findUnique({ where: { id: input.submissionId }, select: { id: true, email: true, languageCode: true } });
    if (!submission) throw new Error("Contact submission does not exist.");
    const reply = await prisma.contactReply.create({ data: { submissionId: submission.id, authorId: input.authorId.startsWith("mock-") ? null : input.authorId, recipient: submission.email, subject: input.subject, body: input.body } });
    const now = new Date();
    try {
        const receipt = await gateway.sendContactReply({ recipient: reply.recipient, subject: reply.subject, body: reply.body, language: submission.languageCode === "fa" ? "fa" : "en" });
        return prisma.$transaction(async (tx) => {
            const sent = await tx.contactReply.update({ where: { id: reply.id }, data: { deliveryState: "sent", deliveryAttempts: 1, lastDeliveryAt: now, deliveryProvider: receipt.provider, providerMessageId: receipt.providerMessageId } });
            await tx.contactSubmission.update({ where: { id: submission.id }, data: { status: "replied" } });
            await tx.securityEvent.create({ data: { userId: input.authorId.startsWith("mock-") ? null : input.authorId, eventType: "contact.reply.send", outcome: "success", metadata: { submissionId: submission.id, replyId: reply.id } } });
            return sent;
        });
    } catch (error) {
        const state = error instanceof EmailGatewayUnavailableError ? "unavailable" : "failed";
        return prisma.$transaction(async (tx) => {
            const failed = await tx.contactReply.update({ where: { id: reply.id }, data: { deliveryState: state, deliveryAttempts: 1, lastDeliveryAt: now, deliveryProvider: gateway.provider } });
            await tx.securityEvent.create({ data: { userId: input.authorId.startsWith("mock-") ? null : input.authorId, eventType: "contact.reply.send", outcome: state, metadata: { submissionId: submission.id, replyId: reply.id } } });
            return failed;
        });
    }
}

export async function resendContactNotification(input: { submissionId: string; authorId: string }, gateway: EmailGateway = getEmailGateway()) {
    const submission = await prisma.contactSubmission.findUnique({ where: { id: input.submissionId } });
    if (!submission) throw new Error("Contact submission does not exist.");
    const now = new Date();
    try {
        const receipt = await gateway.sendContactNotification({ recipient: await getContactNotificationRecipient(), replyTo: submission.email, reference: submission.reference, fullName: submission.fullName, organization: submission.organization, topic: submission.topic, message: submission.message, language: submission.languageCode === "fa" ? "fa" : "en" });
        return prisma.$transaction(async (tx) => {
            const sent = await tx.contactSubmission.update({ where: { id: submission.id }, data: { deliveryState: "sent", deliveryAttempts: { increment: 1 }, lastDeliveryAt: now, deliveryProvider: receipt.provider, providerMessageId: receipt.providerMessageId } });
            await tx.securityEvent.create({ data: { userId: input.authorId.startsWith("mock-") ? null : input.authorId, eventType: "contact.notification.retry", outcome: "success", metadata: { submissionId: submission.id } } });
            return sent;
        });
    } catch (error) {
        const state = error instanceof EmailGatewayUnavailableError ? "unavailable" : "failed";
        return prisma.$transaction(async (tx) => {
            const failed = await tx.contactSubmission.update({ where: { id: submission.id }, data: { deliveryState: state, deliveryAttempts: { increment: 1 }, lastDeliveryAt: now, deliveryProvider: gateway.provider } });
            await tx.securityEvent.create({ data: { userId: input.authorId.startsWith("mock-") ? null : input.authorId, eventType: "contact.notification.retry", outcome: state, metadata: { submissionId: submission.id } } });
            return failed;
        });
    }
}

export type ContactInboxFilters = { query?: string; status?: string; deliveryState?: string; language?: string; days?: number };

export async function getContactInbox(filters: ContactInboxFilters = {}) {
    const days = Number.isInteger(filters.days) ? Math.min(Math.max(filters.days!, 1), 365) : 90;
    const where: Prisma.ContactSubmissionWhereInput = {
        createdAt: { gte: new Date(Date.now() - days * 86_400_000) },
        ...(filters.status && contactStatuses.includes(filters.status as ContactStatus) ? { status: filters.status } : {}),
        ...(filters.deliveryState ? { deliveryState: filters.deliveryState.slice(0, 32) } : {}),
        ...(filters.language === "fa" || filters.language === "en" ? { languageCode: filters.language } : {}),
        ...(filters.query ? { OR: ["reference", "fullName", "email", "topic"].map((field) => ({ [field]: { contains: filters.query!.slice(0, 120), mode: "insensitive" } })) } : {}),
    };
    return prisma.contactSubmission.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { replies: { orderBy: { createdAt: "asc" }, select: { id: true, createdAt: true, recipient: true, subject: true, body: true, deliveryState: true, deliveryAttempts: true, lastDeliveryAt: true } } } });
}
