import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import type { ContactNotificationEmail, ContactReplyEmail, EmailGateway, RecoveryEmail } from "../src/integrations/email/gateway";
import { getAnalyticsSummary, recordPageView } from "../src/lib/analytics";
import { resendContactNotification, sendContactReply } from "../src/lib/contact";
import { hashOpaqueToken } from "../src/lib/auth/tokens";
import { prisma } from "../src/lib/prisma";

class TestGateway implements EmailGateway {
    readonly provider = "test";
    replies: ContactReplyEmail[] = [];
    notifications: ContactNotificationEmail[] = [];
    async sendPasswordRecovery(message: RecoveryEmail) { void message; return { provider: this.provider, providerMessageId: randomUUID() }; }
    async sendContactNotification(message: ContactNotificationEmail) { this.notifications.push(message); return { provider: this.provider, providerMessageId: randomUUID() }; }
    async sendContactReply(message: ContactReplyEmail) { this.replies.push(message); return { provider: this.provider, providerMessageId: randomUUID() }; }
}

async function main() {
    const marker = `inbox analytics ${Date.now()}`;
    const visitorToken = randomUUID().replace(/-/g, "");
    const sessionToken = randomUUID().replace(/-/g, "");
    let submissionId: string | null = null;
    try {
        const submission = await prisma.contactSubmission.create({ data: { reference: `CNT-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`, fullName: marker, email: "inbox-verifier@example.test", topic: "Controlled inbox check", message: "This controlled message verifies reply persistence without external delivery.", languageCode: "en", consentAt: new Date(), dedupeHash: `verify-${randomUUID()}` } });
        submissionId = submission.id;
        const gateway = new TestGateway();
        const reply = await sendContactReply({ submissionId: submission.id, authorId: "mock-admin", subject: "Re: Controlled inbox check", body: "This is a controlled reply." }, gateway);
        assert.equal(reply.deliveryState, "sent");
        assert.equal(gateway.replies.length, 1);
        assert.equal((await prisma.contactSubmission.findUniqueOrThrow({ where: { id: submission.id } })).status, "replied");
        const notification = await resendContactNotification({ submissionId: submission.id, authorId: "mock-admin" }, gateway);
        assert.equal(notification.deliveryState, "sent");
        assert.equal(gateway.notifications.length, 1);
        await recordPageView({ visitorToken, sessionToken, path: "/contact", language: "en", referrer: "https://www.google.com/search?q=arandi", userAgent: "Verifier Mobile Safari" });
        const stored = await prisma.analyticsSession.findUniqueOrThrow({ where: { tokenHash: hashOpaqueToken(sessionToken) } });
        assert.equal(JSON.stringify(stored).includes("Verifier Mobile Safari"), false);
        assert.equal(JSON.stringify(stored).includes("google.com/search"), false);
        const summary = await getAnalyticsSummary(1);
        assert.ok(summary.pageViews >= 1);
    } finally {
        if (submissionId) await prisma.contactSubmission.delete({ where: { id: submissionId } }).catch(() => undefined);
        await prisma.analyticsSession.deleteMany({ where: { tokenHash: hashOpaqueToken(sessionToken) } });
        await prisma.analyticsVisitor.deleteMany({ where: { tokenHash: hashOpaqueToken(visitorToken) } });
        await prisma.$disconnect();
    }
    console.log("Contact inbox and consent analytics verification passed; reply history and non-raw analytics storage are intact.");
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Verification failed."); process.exitCode = 1; });
