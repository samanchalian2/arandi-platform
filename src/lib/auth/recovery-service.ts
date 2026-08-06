import { Prisma } from "@prisma/client";

import type { EmailGateway } from "@/integrations/email/gateway";
import { prisma } from "@/lib/prisma";

import { normalizeEmail } from "./identifiers";
import { hashPassword } from "./password";
import {
    createOpaqueToken,
    expiresInMinutes,
    hashOpaqueToken,
    isPlausibleOpaqueToken,
    RECOVERY_TOKEN_BYTES,
    RECOVERY_TTL_MINUTES,
} from "./tokens";

const RECOVERY_COOLDOWN_MINUTES = 5;
const RECOVERY_MAX_PER_HOUR = 3;

export class RecoveryRejectedError extends Error {
    constructor() {
        super("The recovery link is invalid or expired.");
        this.name = "RecoveryRejectedError";
    }
}

export async function requestPasswordRecovery(
    emailInput: string,
    recoveryBaseUrl: string,
    gateway: EmailGateway,
    now = new Date(),
): Promise<void> {
    if (gateway.provider === "disabled") {
        throw new Error("Email provider is not configured.");
    }

    const email = normalizeEmail(emailInput);
    const user = await prisma.user.findUnique({ where: { email } });
    const token = createOpaqueToken(RECOVERY_TOKEN_BYTES);
    const tokenHash = hashOpaqueToken(token);

    if (!user || user.status !== "active") {
        // Keep token generation work in the unknown-account path to reduce
        // observable differences without persisting personal data.
        void tokenHash;
        return;
    }

    const cooldownStart = new Date(now.getTime() - RECOVERY_COOLDOWN_MINUTES * 60_000);
    const hourStart = new Date(now.getTime() - 60 * 60_000);
    const [latest, recentCount] = await Promise.all([
        prisma.passwordRecoveryToken.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        }),
        prisma.passwordRecoveryToken.count({
            where: { userId: user.id, createdAt: { gte: hourStart } },
        }),
    ]);

    // Deliberately return success for rate-limited requests so callers cannot
    // use response status to discover whether the account exists.
    if (latest && latest.createdAt > cooldownStart) return;
    if (recentCount >= RECOVERY_MAX_PER_HOUR) return;

    const expiresAt = expiresInMinutes(RECOVERY_TTL_MINUTES, now);
    const recoveryToken = await prisma.passwordRecoveryToken.create({
        data: {
            userId: user.id,
            email,
            tokenHash,
            expiresAt,
        },
    });
    const recoveryUrl = new URL("/recover", recoveryBaseUrl);
    recoveryUrl.searchParams.set("token", token);

    try {
        await gateway.sendPasswordRecovery({
            recipient: email,
            recoveryUrl: recoveryUrl.toString(),
            expiresAt,
        });
    } catch (error) {
        await prisma.passwordRecoveryToken.delete({ where: { id: recoveryToken.id } });
        throw error;
    }
}

export async function consumePasswordRecovery(
    token: string,
    newPassword: string,
    now = new Date(),
): Promise<void> {
    if (!isPlausibleOpaqueToken(token, RECOVERY_TOKEN_BYTES)) {
        throw new RecoveryRejectedError();
    }
    const passwordHash = await hashPassword(newPassword);
    const tokenHash = hashOpaqueToken(token);

    const result = await prisma.$transaction(async (tx) => {
        const recovery = await tx.passwordRecoveryToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (
            !recovery
            || recovery.consumedAt
            || recovery.expiresAt <= now
            || recovery.user.status !== "active"
        ) {
            return false;
        }

        const consumed = await tx.passwordRecoveryToken.updateMany({
            where: {
                id: recovery.id,
                consumedAt: null,
                expiresAt: { gt: now },
            },
            data: { consumedAt: now },
        });
        if (consumed.count !== 1) return false;

        await tx.userCredential.upsert({
            where: { userId: recovery.userId },
            create: {
                userId: recovery.userId,
                passwordHash,
                passwordChangedAt: now,
            },
            update: {
                passwordHash,
                passwordChangedAt: now,
                failedAttempts: 0,
                lockedUntil: null,
            },
        });
        await tx.authSession.updateMany({
            where: { userId: recovery.userId, revokedAt: null },
            data: { revokedAt: now },
        });
        await tx.passwordRecoveryToken.updateMany({
            where: {
                userId: recovery.userId,
                id: { not: recovery.id },
                consumedAt: null,
            },
            data: { consumedAt: now },
        });
        await tx.securityEvent.create({
            data: {
                userId: recovery.userId,
                eventType: "password.recovery",
                outcome: "success",
                metadata: {},
            },
        });
        return true;
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    if (!result) throw new RecoveryRejectedError();
}
