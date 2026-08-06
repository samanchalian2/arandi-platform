import { Prisma } from "@prisma/client";

import type { SmsGateway } from "@/integrations/sms/gateway";
import { prisma } from "@/lib/prisma";

import { normalizeIranianMobile } from "./identifiers";
import {
    createDatabaseSession,
    type CreatedSession,
    type SessionContext,
} from "./session-store";
import {
    constantTimeHashMatches,
    createOtpCode,
    expiresInMinutes,
    hashOtpCode,
    OTP_TTL_MINUTES,
} from "./tokens";

const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_PER_HOUR = 5;

export class OtpRejectedError extends Error {
    constructor() {
        super("The verification code is invalid or expired.");
        this.name = "OtpRejectedError";
    }
}

export class OtpRateLimitedError extends Error {
    constructor() {
        super("Please wait before requesting another code.");
        this.name = "OtpRateLimitedError";
    }
}

export async function requestLoginOtp(
    phoneInput: string,
    pepper: string,
    gateway: SmsGateway,
    now = new Date(),
): Promise<void> {
    if (gateway.provider === "disabled") {
        throw new Error("SMS provider is not configured.");
    }

    const phoneE164 = normalizeIranianMobile(phoneInput);
    const cooldownStart = new Date(now.getTime() - OTP_COOLDOWN_SECONDS * 1_000);
    const hourStart = new Date(now.getTime() - 60 * 60_000);
    const [latest, recentCount, user] = await Promise.all([
        prisma.otpChallenge.findFirst({
            where: { phoneE164, purpose: "login" },
            orderBy: { createdAt: "desc" },
        }),
        prisma.otpChallenge.count({
            where: {
                phoneE164,
                purpose: "login",
                createdAt: { gte: hourStart },
            },
        }),
        prisma.user.findUnique({ where: { phoneE164 } }),
    ]);

    if (latest && latest.createdAt > cooldownStart) throw new OtpRateLimitedError();
    if (recentCount >= OTP_MAX_PER_HOUR) throw new OtpRateLimitedError();

    const code = createOtpCode();
    const challenge = await prisma.otpChallenge.create({
        data: {
            userId: user?.status === "active" ? user.id : null,
            phoneE164,
            purpose: "login",
            codeHash: hashOtpCode(code, pepper),
            expiresAt: expiresInMinutes(OTP_TTL_MINUTES, now),
        },
    });

    if (!user || user.status !== "active") return;

    try {
        await gateway.sendOtp({
            phoneE164,
            code,
            purpose: "login",
        });
    } catch (error) {
        await prisma.otpChallenge.delete({ where: { id: challenge.id } });
        throw error;
    }
}

export async function verifyLoginOtp(
    phoneInput: string,
    code: string,
    context: SessionContext,
    now = new Date(),
): Promise<CreatedSession> {
    const phoneE164 = normalizeIranianMobile(phoneInput);

    const result = await prisma.$transaction(async (tx) => {
        const challenge = await tx.otpChallenge.findFirst({
            where: {
                phoneE164,
                purpose: "login",
                consumedAt: null,
            },
            orderBy: { createdAt: "desc" },
        });
        if (
            !challenge
            || challenge.expiresAt <= now
            || challenge.attempts >= challenge.maxAttempts
        ) {
            return { accepted: false as const };
        }

        let actualHash: string;
        try {
            actualHash = hashOtpCode(code, context.pepper);
        } catch {
            actualHash = "";
        }
        if (!constantTimeHashMatches(challenge.codeHash, actualHash)) {
            await tx.otpChallenge.update({
                where: { id: challenge.id },
                data: { attempts: { increment: 1 } },
            });
            return { accepted: false as const };
        }
        if (!challenge.userId) return { accepted: false as const };

        const user = await tx.user.findUnique({ where: { id: challenge.userId } });
        if (!user || user.status !== "active") return { accepted: false as const };

        const consumed = await tx.otpChallenge.updateMany({
            where: {
                id: challenge.id,
                consumedAt: null,
                attempts: { lt: challenge.maxAttempts },
                expiresAt: { gt: now },
            },
            data: {
                consumedAt: now,
                attempts: { increment: 1 },
            },
        });
        if (consumed.count !== 1) return { accepted: false as const };
        await tx.user.update({
            where: { id: user.id },
            data: {
                phoneVerifiedAt: user.phoneVerifiedAt ?? now,
                lastLoginAt: now,
            },
        });
        await tx.securityEvent.create({
            data: {
                userId: user.id,
                eventType: "login.otp",
                outcome: "success",
                metadata: {},
            },
        });
        return { accepted: true as const, userId: user.id };
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    if (!result.accepted) throw new OtpRejectedError();
    return createDatabaseSession(result.userId, context, now);
}
