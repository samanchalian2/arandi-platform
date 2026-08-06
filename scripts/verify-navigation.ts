import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

import { PATCH as updateNavigation } from "../src/app/api/cms/navigation/[id]/route";
import { DELETE as deleteNavigation } from "../src/app/api/cms/navigation/[id]/route";
import { PATCH as reorderNavigation } from "../src/app/api/cms/navigation/reorder/route";
import { GET as listNavigation, POST as createNavigation } from "../src/app/api/cms/navigation/route";
import { createDatabaseSession } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const pepper = "navigation-verification-pepper-with-at-least-32-characters";
const marker = randomUUID();
const createdUserIds: string[] = [];
let temporaryNavigationId: string | null = null;
let originalOrder: Array<{ id: string; order: number }> = [];

async function actor(roleKey: string) {
    const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    const user = await prisma.user.create({
        data: {
            displayName: `Temporary navigation verification ${roleKey}`,
            email: `nav-${roleKey.toLowerCase()}-${marker}@example.test`,
            roles: { create: { roleId: role.id } },
        },
    });
    createdUserIds.push(user.id);
    return createDatabaseSession(user.id, { pepper });
}

function request(
    url: string,
    session: { sessionToken: string; csrfToken: string },
    init: { method?: string; body?: unknown; csrf?: boolean } = {},
) {
    return new NextRequest(url, {
        method: init.method ?? "GET",
        headers: {
            cookie: `arandi_session=${session.sessionToken}; arandi_csrf=${session.csrfToken}`,
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(init.method && init.method !== "GET" && init.csrf !== false
                ? { "x-csrf-token": session.csrfToken }
                : {}),
        },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    });
}

async function cleanup() {
    if (temporaryNavigationId) {
        await prisma.navigation.deleteMany({ where: { id: temporaryNavigationId } });
    }
    if (originalOrder.length > 0) {
        await prisma.$transaction(originalOrder.map(({ id, order }) =>
            prisma.navigation.update({ where: { id }, data: { order } }),
        ));
    }
    if (createdUserIds.length > 0) {
        await prisma.securityEvent.deleteMany({ where: { userId: { in: createdUserIds } } });
        await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
}

async function main() {
    try {
        originalOrder = await prisma.navigation.findMany({
            select: { id: true, order: true },
            orderBy: { order: "asc" },
        });
        const admin = await actor("Admin");
        const editor = await actor("Editor");
        const translator = await actor("Translator");
        const viewer = await actor("Viewer");

        assert.equal((await listNavigation(request(
            "https://arandi.example/api/cms/navigation",
            viewer,
        ))).status, 403);
        assert.equal((await listNavigation(request(
            "https://arandi.example/api/cms/navigation",
            translator,
        ))).status, 200);

        const missingCsrf = await createNavigation(request(
            "https://arandi.example/api/cms/navigation",
            editor,
            {
                method: "POST",
                csrf: false,
                body: {
                    key: "missing_csrf",
                    href: "/missing-csrf",
                    translations: {
                        en: { label: "Missing CSRF" },
                        fa: { label: "بدون سی‌اس‌آر‌اف" },
                    },
                },
            },
        ));
        assert.equal(missingCsrf.status, 403);

        const created = await createNavigation(request(
            "https://arandi.example/api/cms/navigation?lang=en",
            editor,
            {
                method: "POST",
                body: {
                    key: `verify_${marker.replaceAll("-", "").slice(0, 12)}`,
                    href: "/verification",
                    isExternal: false,
                    openInNewTab: false,
                    translations: {
                        en: { label: "Verification" },
                        fa: { label: "اعتبارسنجی" },
                    },
                },
            },
        ));
        assert.equal(created.status, 201);
        const createdBody = await created.json() as { data: { id: string; order: number } };
        temporaryNavigationId = createdBody.data.id;

        const translatorStructural = await updateNavigation(
            request(
                `https://arandi.example/api/cms/navigation/${temporaryNavigationId}`,
                translator,
                { method: "PATCH", body: { href: "/forbidden" } },
            ),
            { params: Promise.resolve({ id: temporaryNavigationId }) },
        );
        assert.equal(translatorStructural.status, 403);

        const translated = await updateNavigation(
            request(
                `https://arandi.example/api/cms/navigation/${temporaryNavigationId}`,
                translator,
                {
                    method: "PATCH",
                    body: {
                        translations: {
                            fa: { label: "اعتبارسنجی ویرایش‌شده" },
                        },
                    },
                },
            ),
            { params: Promise.resolve({ id: temporaryNavigationId }) },
        );
        assert.equal(translated.status, 200);

        const allItems = await prisma.navigation.findMany({
            orderBy: [{ order: "asc" }, { id: "asc" }],
            select: { id: true },
        });
        const partialReorder = await reorderNavigation(request(
            "https://arandi.example/api/cms/navigation/reorder",
            editor,
            {
                method: "PATCH",
                body: { items: allItems.slice(0, -1).map(({ id }, index) => ({ id, order: index + 1 })) },
            },
        ));
        assert.equal(partialReorder.status, 400);

        const reversed = [...allItems].reverse();
        const completeReorder = await reorderNavigation(request(
            "https://arandi.example/api/cms/navigation/reorder",
            editor,
            {
                method: "PATCH",
                body: { items: reversed.map(({ id }, index) => ({ id, order: index + 1 })) },
            },
        ));
        assert.equal(completeReorder.status, 200);

        const deleted = await deleteNavigation(
            request(
                `https://arandi.example/api/cms/navigation/${temporaryNavigationId}`,
                admin,
                { method: "DELETE" },
            ),
            { params: Promise.resolve({ id: temporaryNavigationId }) },
        );
        assert.equal(deleted.status, 200);
        temporaryNavigationId = null;
    } finally {
        await cleanup();
        await prisma.$disconnect();
    }
    console.log("Navigation runtime verification passed; original order restored and temporary records removed.");
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Navigation verification failed.");
    process.exitCode = 1;
});
