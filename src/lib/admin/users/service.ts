import { Prisma } from "@prisma/client";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { ManageableRoleKey } from "./input";

export class UserAdministrationConflictError extends Error {}
export class UserAdministrationNotFoundError extends Error {}

export type CreateManagedUserInput = {
    displayName: string;
    email: string | null;
    phoneE164: string | null;
    roleKeys: ManageableRoleKey[];
    password?: string;
};

export type UpdateManagedUserInput = {
    displayName: string;
    email: string | null;
    phoneE164: string | null;
    status: "active" | "suspended";
    roleKeys: ManageableRoleKey[];
};

const publicUserSelect = {
    id: true,
    createdAt: true,
    updatedAt: true,
    displayName: true,
    email: true,
    phoneE164: true,
    status: true,
    phoneVerifiedAt: true,
    emailVerifiedAt: true,
    lastLoginAt: true,
    credential: { select: { lockedUntil: true } },
    roles: {
        select: { role: { select: { key: true, name: true } } },
        orderBy: { role: { key: "asc" as const } },
    },
    sessions: {
        where: { revokedAt: null },
        select: { id: true, expiresAt: true },
    },
} satisfies Prisma.UserSelect;

export function mapManagedUser(user: Prisma.UserGetPayload<{ select: typeof publicUserSelect }>) {
    return {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        displayName: user.displayName,
        email: user.email,
        phoneE164: user.phoneE164,
        status: user.status,
        phoneVerifiedAt: user.phoneVerifiedAt,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        lockedUntil: user.credential?.lockedUntil ?? null,
        roles: user.roles.map(({ role }) => ({ key: role.key, name: role.name })),
        activeSessionCount: user.sessions.filter(({ expiresAt }) => expiresAt > new Date()).length,
    };
}

export async function listManagedUsers(options: {
    query?: string;
    status?: "active" | "suspended";
    role?: ManageableRoleKey;
    page: number;
    pageSize: number;
}) {
    const where: Prisma.UserWhereInput = {
        ...(options.status ? { status: options.status } : {}),
        ...(options.role ? { roles: { some: { role: { key: options.role } } } } : {}),
        ...(options.query ? {
            OR: [
                { displayName: { contains: options.query, mode: "insensitive" } },
                { email: { contains: options.query, mode: "insensitive" } },
                { phoneE164: { contains: options.query } },
            ],
        } : {}),
    };
    const [total, users] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            skip: (options.page - 1) * options.pageSize,
            take: options.pageSize,
            select: publicUserSelect,
        }),
    ]);
    return {
        items: users.map(mapManagedUser),
        page: options.page,
        pageSize: options.pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / options.pageSize)),
    };
}

export async function createManagedUser(
    actorUserId: string,
    input: CreateManagedUserInput,
) {
    if (!input.email && !input.phoneE164) {
        throw new UserAdministrationConflictError("An email or mobile number is required.");
    }
    const passwordHash = input.password ? await hashPassword(input.password) : null;
    return prisma.$transaction(async (tx) => {
        const roles = await tx.role.findMany({
            where: { key: { in: input.roleKeys } },
            select: { id: true, key: true },
        });
        if (roles.length !== input.roleKeys.length) {
            throw new UserAdministrationConflictError("One or more roles are unavailable.");
        }
        const user = await tx.user.create({
            data: {
                displayName: input.displayName,
                email: input.email,
                phoneE164: input.phoneE164,
                ...(passwordHash ? { credential: { create: { passwordHash } } } : {}),
                roles: {
                    create: roles.map(({ id }) => ({ roleId: id })),
                },
            },
            select: publicUserSelect,
        });
        await tx.securityEvent.create({
            data: {
                userId: user.id,
                eventType: "admin.user.create",
                outcome: "success",
                metadata: { actorUserId, roleKeys: input.roleKeys },
            },
        });
        return mapManagedUser(user);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function updateManagedUser(
    actorUserId: string,
    targetUserId: string,
    input: UpdateManagedUserInput,
) {
    if (!input.email && !input.phoneE164) {
        throw new UserAdministrationConflictError("An email or mobile number is required.");
    }
    return prisma.$transaction(async (tx) => {
        const target = await tx.user.findUnique({
            where: { id: targetUserId },
            include: { roles: { include: { role: true } } },
        });
        if (!target) throw new UserAdministrationNotFoundError();
        if (targetUserId === actorUserId && input.status !== "active") {
            throw new UserAdministrationConflictError("You cannot suspend your own account.");
        }

        const currentlySuperAdmin = target.roles.some(({ role }) => role.key === "SuperAdmin");
        const remainsActiveSuperAdmin = input.status === "active" && input.roleKeys.includes("SuperAdmin");
        if (currentlySuperAdmin && !remainsActiveSuperAdmin) {
            const activeSuperAdmins = await tx.user.count({
                where: {
                    status: "active",
                    roles: { some: { role: { key: "SuperAdmin" } } },
                },
            });
            if (activeSuperAdmins <= 1) {
                throw new UserAdministrationConflictError("The last active SuperAdmin cannot be removed or suspended.");
            }
        }
        if (targetUserId === actorUserId && !input.roleKeys.includes("SuperAdmin")) {
            throw new UserAdministrationConflictError("You cannot remove your own SuperAdmin role.");
        }

        const roles = await tx.role.findMany({
            where: { key: { in: input.roleKeys } },
            select: { id: true },
        });
        if (roles.length !== input.roleKeys.length) {
            throw new UserAdministrationConflictError("One or more roles are unavailable.");
        }

        await tx.user.update({
            where: { id: targetUserId },
            data: {
                displayName: input.displayName,
                email: input.email,
                phoneE164: input.phoneE164,
                status: input.status,
            },
        });
        await tx.userRole.deleteMany({ where: { userId: targetUserId } });
        await tx.userRole.createMany({
            data: roles.map(({ id }) => ({ userId: targetUserId, roleId: id })),
            skipDuplicates: true,
        });
        if (input.status === "suspended") {
            await tx.authSession.updateMany({
                where: { userId: targetUserId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        await tx.securityEvent.create({
            data: {
                userId: targetUserId,
                eventType: "admin.user.update",
                outcome: "success",
                metadata: {
                    actorUserId,
                    status: input.status,
                    roleKeys: input.roleKeys,
                },
            },
        });
        const updated = await tx.user.findUniqueOrThrow({
            where: { id: targetUserId },
            select: publicUserSelect,
        });
        return mapManagedUser(updated);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function revokeManagedUserSessions(
    actorUserId: string,
    targetUserId: string,
) {
    if (actorUserId === targetUserId) {
        throw new UserAdministrationConflictError("Use sign out for your own session.");
    }
    return prisma.$transaction(async (tx) => {
        const target = await tx.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
        if (!target) throw new UserAdministrationNotFoundError();
        const revoked = await tx.authSession.updateMany({
            where: { userId: targetUserId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        await tx.securityEvent.create({
            data: {
                userId: targetUserId,
                eventType: "admin.session.revoke",
                outcome: "success",
                metadata: { actorUserId, revokedCount: revoked.count },
            },
        });
        return { revokedCount: revoked.count };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
