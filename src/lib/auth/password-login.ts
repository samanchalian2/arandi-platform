import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { normalizeEmail, normalizeIranianMobile } from "./identifiers";
import { verifyPassword } from "./password";
import {
    createDatabaseSession,
    type CreatedSession,
    type SessionContext,
} from "./session-store";
import { hashSensitiveValue } from "./tokens";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const IP_WINDOW_MINUTES = 15;
const MAX_IP_FAILURES = 20;
const DUMMY_PASSWORD_HASH = "$argon2id$v=19$m=65536,t=3,p=1$GlVcaOGgBnAWB5DWnTbflQ$w/xH4xmLJK3VSV6r2kYulm8/nIMhsirwqkBexXUb0xY";

export class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid credentials.");
        this.name = "InvalidCredentialsError";
    }
}

function identifierWhere(identifier: string) {
    try {
        return { phoneE164: normalizeIranianMobile(identifier) };
    } catch {
        return { email: normalizeEmail(identifier) };
    }
}

function lockoutUntil(now: Date): Date {
    return new Date(now.getTime() + LOCKOUT_MINUTES * 60_000);
}

export async function authenticateWithPassword(
    identifier: string,
    password: string,
    context: SessionContext,
    now = new Date(),
): Promise<CreatedSession> {
    const ipHash = context.ip ? hashSensitiveValue(context.ip, context.pepper) : null;
    const recentWindow = new Date(now.getTime() - IP_WINDOW_MINUTES * 60_000);

    if (ipHash) {
        const recentFailures = await prisma.securityEvent.count({
            where: {
                eventType: "login.password",
                outcome: "failure",
                ipHash,
                createdAt: { gte: recentWindow },
            },
        });
        if (recentFailures >= MAX_IP_FAILURES) {
            throw new InvalidCredentialsError();
        }
    }

    let where: { phoneE164?: string; email?: string };
    try {
        where = identifierWhere(identifier);
    } catch {
        await verifyPassword(DUMMY_PASSWORD_HASH, password);
        await prisma.securityEvent.create({
            data: {
                eventType: "login.password",
                outcome: "failure",
                ipHash,
                metadata: {},
            },
        });
        throw new InvalidCredentialsError();
    }

    const user = await prisma.user.findFirst({
        where,
        include: { credential: true },
    });

    if (!user?.credential) {
        await verifyPassword(DUMMY_PASSWORD_HASH, password);
        await prisma.securityEvent.create({
            data: {
                userId: user?.id,
                eventType: "login.password",
                outcome: "failure",
                ipHash,
                metadata: {},
            },
        });
        throw new InvalidCredentialsError();
    }

    if (
        user.status !== "active"
        || (user.credential.lockedUntil && user.credential.lockedUntil > now)
    ) {
        await verifyPassword(DUMMY_PASSWORD_HASH, password);
        throw new InvalidCredentialsError();
    }

    const valid = await verifyPassword(user.credential.passwordHash, password);
    if (!valid) {
        await prisma.$transaction(async (tx) => {
            const credential = await tx.userCredential.update({
                where: { userId: user.id },
                data: {
                    failedAttempts: { increment: 1 },
                },
            });
            if (credential.failedAttempts >= MAX_FAILED_ATTEMPTS) {
                await tx.userCredential.update({
                    where: { userId: user.id },
                    data: { lockedUntil: lockoutUntil(now) },
                });
            }
            await tx.securityEvent.create({
                data: {
                    userId: user.id,
                    eventType: "login.password",
                    outcome: "failure",
                    ipHash,
                    metadata: { failedAttempts: credential.failedAttempts },
                },
            });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
        throw new InvalidCredentialsError();
    }

    await prisma.$transaction(async (tx) => {
        await tx.userCredential.update({
            where: { userId: user.id },
            data: { failedAttempts: 0, lockedUntil: null },
        });
        await tx.user.update({
            where: { id: user.id },
            data: { lastLoginAt: now },
        });
        await tx.securityEvent.create({
            data: {
                userId: user.id,
                eventType: "login.password",
                outcome: "success",
                ipHash,
                metadata: {},
            },
        });
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return createDatabaseSession(user.id, context, now);
}
