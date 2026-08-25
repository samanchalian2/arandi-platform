import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

import type {
    ContactNotificationEmail,
    ContactReplyEmail,
    EmailGateway,
    RecoveryEmail,
} from "../src/integrations/email/gateway";
import type { OtpDelivery, SmsGateway } from "../src/integrations/sms/gateway";
import {
    consumePasswordRecovery,
    createDatabaseSession,
    hashOpaqueToken,
    hashPassword,
    OtpRejectedError,
    RecoveryRejectedError,
    requestLoginOtp,
    requestPasswordRecovery,
    verifyLoginOtp,
} from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";
import {
    GET as listServiceRequests,
    POST as createServiceRequest,
} from "../src/app/api/account/service-requests/route";

class CapturingSmsGateway implements SmsGateway {
    readonly provider = "test";
    lastDelivery: OtpDelivery | null = null;

    async sendOtp(delivery: OtpDelivery) {
        this.lastDelivery = delivery;
        return { provider: this.provider, providerMessageId: randomUUID() };
    }
}

class CapturingEmailGateway implements EmailGateway {
    readonly provider = "test";
    lastMessage: RecoveryEmail | null = null;

    async sendPasswordRecovery(message: RecoveryEmail) {
        this.lastMessage = message;
        return { provider: this.provider, providerMessageId: randomUUID() };
    }

    async sendContactNotification(_message: ContactNotificationEmail) {
        void _message;
        return { provider: this.provider, providerMessageId: randomUUID() };
    }

    async sendContactReply(_message: ContactReplyEmail) {
        void _message;
        return { provider: this.provider, providerMessageId: randomUUID() };
    }
}

const suffix = String(Date.now()).slice(-9);
const phoneE164 = `+989${suffix}`;
const unknownPhoneE164 = `+989${String(Date.now() + 1).slice(-9)}`;
const email = `auth-check-${randomUUID()}@example.test`;
const pepper = "runtime-verification-pepper-with-at-least-32-characters";
const initialPassword = "Initial-runtime-password-2026";
const replacementPassword = "Replacement-runtime-password-2026";
let userId: string | null = null;

async function main() {
try {
    const staleUsers = await prisma.user.findMany({
        where: {
            displayName: "Temporary auth verification",
            email: { startsWith: "auth-check-" },
        },
        select: { id: true },
    });
    if (staleUsers.length > 0) {
        const staleIds = staleUsers.map(({ id }) => id);
        await prisma.serviceRequest.deleteMany({ where: { userId: { in: staleIds } } });
        await prisma.securityEvent.deleteMany({ where: { userId: { in: staleIds } } });
        await prisma.user.deleteMany({ where: { id: { in: staleIds } } });
    }

    const role = await prisma.role.findUniqueOrThrow({ where: { key: "Customer" } });
    const user = await prisma.user.create({
        data: {
            displayName: "Temporary auth verification",
            phoneE164,
            email,
            credential: {
                create: { passwordHash: await hashPassword(initialPassword) },
            },
            roles: {
                create: { roleId: role.id },
            },
        },
    });
    userId = user.id;

    const sms = new CapturingSmsGateway();
    await requestLoginOtp(unknownPhoneE164, pepper, sms);
    assert.equal(sms.lastDelivery, null, "Unknown accounts must not receive an OTP.");
    assert.equal(
        await prisma.otpChallenge.count({ where: { phoneE164: unknownPhoneE164 } }),
        1,
        "Unknown accounts must still enter the same cooldown path.",
    );

    const firstOtpTime = new Date();
    await requestLoginOtp(phoneE164, pepper, sms, firstOtpTime);
    const firstDelivery = sms.lastDelivery as OtpDelivery | null;
    assert.ok(firstDelivery, "Known active account should reach the configured gateway.");
    const firstCode = firstDelivery.code;
    for (let attempt = 0; attempt < 5; attempt += 1) {
        await assert.rejects(
            verifyLoginOtp(phoneE164, "000000", { pepper }, firstOtpTime),
            OtpRejectedError,
        );
    }
    const exhausted = await prisma.otpChallenge.findFirstOrThrow({
        where: { userId, purpose: "login" },
        orderBy: { createdAt: "desc" },
    });
    assert.equal(exhausted.attempts, 5, "Failed OTP attempts must be committed.");
    await assert.rejects(
        verifyLoginOtp(phoneE164, firstCode, { pepper }, firstOtpTime),
        OtpRejectedError,
    );

    const secondOtpTime = new Date(firstOtpTime.getTime() + 61_000);
    await requestLoginOtp(phoneE164, pepper, sms, secondOtpTime);
    const secondDelivery = sms.lastDelivery as OtpDelivery | null;
    assert.ok(secondDelivery);
    const acceptedSession = await verifyLoginOtp(
        phoneE164,
        secondDelivery.code,
        { pepper },
        secondOtpTime,
    );
    await assert.rejects(
        verifyLoginOtp(phoneE164, secondDelivery.code, { pepper }, secondOtpTime),
        OtpRejectedError,
    );

    const cookieHeader = `arandi_session=${acceptedSession.sessionToken}; arandi_csrf=${acceptedSession.csrfToken}`;
    const missingCsrf = await createServiceRequest(new NextRequest(
        "https://arandi.example/api/account/service-requests",
        {
            method: "POST",
            headers: { cookie: cookieHeader, "Content-Type": "application/json" },
            body: JSON.stringify({
                subject: "Runtime service request",
                description: "This request verifies the customer ownership and CSRF boundary.",
            }),
        },
    ));
    assert.equal(missingCsrf.status, 403);

    const created = await createServiceRequest(new NextRequest(
        "https://arandi.example/api/account/service-requests",
        {
            method: "POST",
            headers: {
                cookie: cookieHeader,
                "Content-Type": "application/json",
                "x-csrf-token": acceptedSession.csrfToken,
            },
            body: JSON.stringify({
                userId: randomUUID(),
                subject: "Runtime service request",
                description: "This request verifies the customer ownership and CSRF boundary.",
            }),
        },
    ));
    assert.equal(created.status, 201);
    const createdBody = await created.json() as { item: { reference: string; userId?: string } };
    assert.match(createdBody.item.reference, /^AR-\d{4}-[A-F0-9]{12}$/);
    assert.equal(createdBody.item.userId, undefined, "Internal ownership IDs must not be exposed.");

    const listed = await listServiceRequests(new NextRequest(
        "https://arandi.example/api/account/service-requests",
        { headers: { cookie: cookieHeader } },
    ));
    assert.equal(listed.status, 200);
    const listedBody = await listed.json() as { items: Array<{ reference: string }> };
    assert.equal(listedBody.items.length, 1);
    assert.equal(listedBody.items[0]?.reference, createdBody.item.reference);

    const emailGateway = new CapturingEmailGateway();
    await requestPasswordRecovery(
        email,
        "https://arandi.example",
        emailGateway,
    );
    assert.ok(emailGateway.lastMessage);
    const recoveryToken = new URL(emailGateway.lastMessage.recoveryUrl).searchParams.get("token");
    assert.ok(recoveryToken);

    await createDatabaseSession(userId, { pepper });
    await consumePasswordRecovery(recoveryToken, replacementPassword);
    const activeSessions = await prisma.authSession.count({
        where: { userId, revokedAt: null },
    });
    assert.equal(activeSessions, 0, "Recovery must revoke OTP and pre-existing sessions.");
    await assert.rejects(
        consumePasswordRecovery(recoveryToken, replacementPassword),
        RecoveryRejectedError,
    );

    const acceptedSessionRow = await prisma.authSession.findUnique({
        where: { tokenHash: hashOpaqueToken(acceptedSession.sessionToken) },
    });
    assert.ok(acceptedSessionRow?.revokedAt);

} finally {
    if (userId) {
        await prisma.serviceRequest.deleteMany({ where: { userId } });
        await prisma.securityEvent.deleteMany({ where: { userId } });
        await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.otpChallenge.deleteMany({ where: { phoneE164: unknownPhoneE164 } });
    await prisma.$disconnect();
}
    console.log("Auth and customer runtime verification passed; temporary records removed.");
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Auth runtime verification failed.");
    process.exitCode = 1;
});
