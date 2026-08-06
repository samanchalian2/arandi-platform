import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

import { GET as getSecurityEvents } from "../src/app/api/admin/security-events/route";
import { PATCH as updateUserRoute } from "../src/app/api/admin/users/[id]/route";
import { POST as revokeSessionsRoute } from "../src/app/api/admin/users/[id]/sessions/revoke/route";
import { GET as listUsersRoute, POST as createUserRoute } from "../src/app/api/admin/users/route";
import { createDatabaseSession } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const pepper = "admin-runtime-verification-pepper-with-at-least-32-characters";
const marker = randomUUID();
const actorEmail = `admin-check-super-${marker}@example.test`;
const adminEmail = `admin-check-admin-${marker}@example.test`;
const viewerEmail = `admin-check-viewer-${marker}@example.test`;
const targetEmail = `admin-check-target-${marker}@example.test`;
const createdIds: string[] = [];

function requestWithSession(
    url: string,
    session: { sessionToken: string; csrfToken: string },
    init: { method?: string; body?: unknown; csrf?: boolean } = {},
) {
    return new NextRequest(url, {
        method: init.method ?? "GET",
        headers: {
            cookie: `arandi_session=${session.sessionToken}; arandi_csrf=${session.csrfToken}`,
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(init.csrf ? { "x-csrf-token": session.csrfToken } : {}),
        },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    });
}

async function createActor(displayName: string, email: string, roleKey: string) {
    const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    const user = await prisma.user.create({
        data: {
            displayName,
            email,
            roles: { create: { roleId: role.id } },
        },
    });
    createdIds.push(user.id);
    return {
        user,
        session: await createDatabaseSession(user.id, { pepper }),
    };
}

async function cleanup() {
    if (createdIds.length === 0) return;
    await prisma.serviceRequest.deleteMany({ where: { userId: { in: createdIds } } });
    await prisma.securityEvent.deleteMany({ where: { userId: { in: createdIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdIds } } });
}

async function main() {
    try {
        const stale = await prisma.user.findMany({
            where: { displayName: { startsWith: "Temporary admin verification" } },
            select: { id: true },
        });
        if (stale.length > 0) {
            createdIds.push(...stale.map(({ id }) => id));
            await cleanup();
            createdIds.length = 0;
        }

        const superAdmin = await createActor("Temporary admin verification SuperAdmin", actorEmail, "SuperAdmin");
        const admin = await createActor("Temporary admin verification Admin", adminEmail, "Admin");
        const viewer = await createActor("Temporary admin verification Viewer", viewerEmail, "Viewer");

        const adminList = await listUsersRoute(requestWithSession(
            "https://arandi.example/api/admin/users?pageSize=10",
            admin.session,
        ));
        assert.equal(adminList.status, 200, "Admin should have read-only user access.");

        const viewerList = await listUsersRoute(requestWithSession(
            "https://arandi.example/api/admin/users",
            viewer.session,
        ));
        assert.equal(viewerList.status, 403);

        const payload = {
            displayName: "Temporary admin verification Target",
            email: targetEmail,
            phone: "",
            status: "active",
            roleKeys: ["Customer"],
        };
        const adminCreate = await createUserRoute(requestWithSession(
            "https://arandi.example/api/admin/users",
            admin.session,
            { method: "POST", body: payload, csrf: true },
        ));
        assert.equal(adminCreate.status, 403, "Admin must not mutate users.");

        const missingCsrf = await createUserRoute(requestWithSession(
            "https://arandi.example/api/admin/users",
            superAdmin.session,
            { method: "POST", body: payload },
        ));
        assert.equal(missingCsrf.status, 403);

        const created = await createUserRoute(requestWithSession(
            "https://arandi.example/api/admin/users",
            superAdmin.session,
            { method: "POST", body: payload, csrf: true },
        ));
        assert.equal(created.status, 201);
        const createdBody = await created.json() as { item: { id: string; email: string; activeSessionCount: number } };
        createdIds.push(createdBody.item.id);
        assert.equal(createdBody.item.email, targetEmail);
        assert.equal(createdBody.item.activeSessionCount, 0);

        const targetSession = await createDatabaseSession(createdBody.item.id, { pepper });
        const suspended = await updateUserRoute(
            requestWithSession(
                `https://arandi.example/api/admin/users/${createdBody.item.id}`,
                superAdmin.session,
                {
                    method: "PATCH",
                    csrf: true,
                    body: { ...payload, status: "suspended" },
                },
            ),
            { params: Promise.resolve({ id: createdBody.item.id }) },
        );
        assert.equal(suspended.status, 200);
        assert.equal(
            await prisma.authSession.count({
                where: { userId: createdBody.item.id, revokedAt: null },
            }),
            0,
            "Suspension must revoke all target sessions.",
        );
        void targetSession;

        const reactivated = await updateUserRoute(
            requestWithSession(
                `https://arandi.example/api/admin/users/${createdBody.item.id}`,
                superAdmin.session,
                {
                    method: "PATCH",
                    csrf: true,
                    body: { ...payload, status: "active" },
                },
            ),
            { params: Promise.resolve({ id: createdBody.item.id }) },
        );
        assert.equal(reactivated.status, 200);
        await createDatabaseSession(createdBody.item.id, { pepper });
        const revoked = await revokeSessionsRoute(
            requestWithSession(
                `https://arandi.example/api/admin/users/${createdBody.item.id}/sessions/revoke`,
                superAdmin.session,
                { method: "POST", csrf: true },
            ),
            { params: Promise.resolve({ id: createdBody.item.id }) },
        );
        assert.equal(revoked.status, 200);
        assert.equal((await revoked.json() as { revokedCount: number }).revokedCount, 1);

        const selfDemotion = await updateUserRoute(
            requestWithSession(
                `https://arandi.example/api/admin/users/${superAdmin.user.id}`,
                superAdmin.session,
                {
                    method: "PATCH",
                    csrf: true,
                    body: {
                        displayName: superAdmin.user.displayName,
                        email: actorEmail,
                        phone: "",
                        status: "active",
                        roleKeys: ["Admin"],
                    },
                },
            ),
            { params: Promise.resolve({ id: superAdmin.user.id }) },
        );
        assert.equal(selfDemotion.status, 409, "Self-demotion must be rejected.");

        const events = await getSecurityEvents(requestWithSession(
            "https://arandi.example/api/admin/security-events?pageSize=100",
            admin.session,
        ));
        assert.equal(events.status, 200);
        const eventsBody = await events.json() as {
            items: Array<Record<string, unknown> & { eventType: string }>;
        };
        const targetEvents = eventsBody.items.filter(({ eventType }) => eventType.startsWith("admin."));
        assert.ok(targetEvents.length >= 4);
        assert.ok(targetEvents.every((event) =>
            !("metadata" in event) && !("ipHash" in event)),
        );
    } finally {
        await cleanup();
        await prisma.$disconnect();
    }
    console.log("Admin user/runtime audit verification passed; temporary records removed.");
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Admin verification failed.");
    process.exitCode = 1;
});
