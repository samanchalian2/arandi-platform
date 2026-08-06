import { prisma } from "@/lib/prisma";

import {
    createOpaqueToken,
    expiresInDays,
    hashOpaqueToken,
    hashSensitiveValue,
    SESSION_TTL_DAYS,
} from "./tokens";
import { verifyCsrfToken } from "./csrf";

export type SessionContext = {
    ip?: string | null;
    userAgent?: string | null;
    pepper: string;
};

export type CreatedSession = {
    sessionToken: string;
    csrfToken: string;
    expiresAt: Date;
};

export type AuthenticatedSession = {
    sessionId: string;
    userId: string;
    displayName: string;
    phoneE164: string | null;
    email: string | null;
    roles: string[];
    permissions: string[];
    expiresAt: Date;
};

export async function createDatabaseSession(
    userId: string,
    context: SessionContext,
    now = new Date(),
): Promise<CreatedSession> {
    const sessionToken = createOpaqueToken();
    const csrfToken = createOpaqueToken();
    const expiresAt = expiresInDays(SESSION_TTL_DAYS, now);

    await prisma.authSession.create({
        data: {
            userId,
            tokenHash: hashOpaqueToken(sessionToken),
            csrfHash: hashOpaqueToken(csrfToken),
            expiresAt,
            ipHash: context.ip ? hashSensitiveValue(context.ip, context.pepper) : null,
            userAgentHash: context.userAgent
                ? hashSensitiveValue(context.userAgent, context.pepper)
                : null,
        },
    });

    return { sessionToken, csrfToken, expiresAt };
}

export async function readDatabaseSession(
    sessionToken: string | null | undefined,
    now = new Date(),
): Promise<AuthenticatedSession | null> {
    if (!sessionToken || sessionToken.length < 20) return null;

    const session = await prisma.authSession.findUnique({
        where: { tokenHash: hashOpaqueToken(sessionToken) },
        include: {
            user: {
                include: {
                    roles: {
                        include: { role: true },
                    },
                },
            },
        },
    });

    if (
        !session
        || session.revokedAt
        || session.expiresAt <= now
        || session.user.status !== "active"
    ) {
        return null;
    }

    return {
        sessionId: session.id,
        userId: session.userId,
        displayName: session.user.displayName,
        phoneE164: session.user.phoneE164,
        email: session.user.email,
        roles: session.user.roles.map(({ role }) => role.key),
        permissions: Array.from(new Set(
            session.user.roles.flatMap(({ role }) => role.permissions),
        )),
        expiresAt: session.expiresAt,
    };
}

export async function revokeDatabaseSession(sessionToken: string, now = new Date()): Promise<void> {
    await prisma.authSession.updateMany({
        where: {
            tokenHash: hashOpaqueToken(sessionToken),
            revokedAt: null,
        },
        data: { revokedAt: now },
    });
}

export async function validateDatabaseSessionCsrf(
    sessionToken: string | null | undefined,
    cookieToken: string | null,
    headerToken: string | null,
    now = new Date(),
): Promise<boolean> {
    if (!sessionToken) return false;
    const session = await prisma.authSession.findUnique({
        where: { tokenHash: hashOpaqueToken(sessionToken) },
        select: {
            csrfHash: true,
            expiresAt: true,
            revokedAt: true,
        },
    });
    if (!session || session.revokedAt || session.expiresAt <= now) return false;
    return verifyCsrfToken(session.csrfHash, cookieToken, headerToken);
}
