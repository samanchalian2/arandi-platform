import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

import { DELETE as deletePage } from "../src/app/api/cms/pages/[identifier]/route";
import { GET as listPages, POST as createPage } from "../src/app/api/cms/pages/route";
import { createDatabaseSession } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";
import { findPublishedPageBySlug } from "../src/lib/public-content/pages";

const pepper = "page-template-verification-pepper-with-at-least-32-characters";
const marker = randomUUID().replaceAll("-", "").slice(0, 12);
const slug = `verify-article-${marker}`;
const route = `/articles/${slug}`;
const createdUserIds: string[] = [];
let createdPageId: string | null = null;

async function actor(roleKey: string) {
    const roleRecord = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    const user = await prisma.user.create({
        data: {
            displayName: `Temporary page verification ${roleKey}`,
            email: `page-${roleKey.toLowerCase()}-${marker}@example.test`,
            roles: { create: { roleId: roleRecord.id } },
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
    const method = init.method ?? "GET";
    return new NextRequest(url, {
        method,
        headers: {
            cookie: `arandi_session=${session.sessionToken}; arandi_csrf=${session.csrfToken}`,
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(method !== "GET" && init.csrf !== false
                ? { "x-csrf-token": session.csrfToken }
                : {}),
        },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    });
}

function payload(overrides: Record<string, unknown> = {}) {
    return {
        slug,
        route,
        template: "article",
        status: "draft",
        seoKeywords: ["verification", "article"],
        translations: {
            en: {
                title: "Verification article",
                seoTitle: "Verification article title",
                seoDescription: "This description is long enough to validate the English article template.",
            },
            fa: {
                title: "مقاله اعتبارسنجی",
                seoTitle: "عنوان مقاله اعتبارسنجی",
                seoDescription: "این توضیح فارسی برای اعتبارسنجی قالب مقاله به اندازه کافی کامل است.",
            },
        },
        ...overrides,
    };
}

async function cleanup() {
    if (createdPageId) await prisma.page.deleteMany({ where: { id: createdPageId } });
    if (createdUserIds.length > 0) {
        await prisma.securityEvent.deleteMany({ where: { userId: { in: createdUserIds } } });
        await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
}

async function main() {
    const baseline = {
        pages: await prisma.page.count(),
        sections: await prisma.section.count(),
    };
    try {
        const admin = await actor("Admin");
        const editor = await actor("Editor");
        const translator = await actor("Translator");
        const viewer = await actor("Viewer");

        assert.equal((await listPages(request(
            "https://arandi.example/api/cms/pages",
            viewer,
        ))).status, 200);
        assert.equal((await createPage(request(
            "https://arandi.example/api/cms/pages",
            translator,
            { method: "POST", body: payload() },
        ))).status, 403);
        assert.equal((await createPage(request(
            "https://arandi.example/api/cms/pages",
            editor,
            { method: "POST", body: payload(), csrf: false },
        ))).status, 403);

        const incomplete = await createPage(request(
            "https://arandi.example/api/cms/pages",
            editor,
            {
                method: "POST",
                body: payload({
                    slug: `${slug}-incomplete`,
                    route: `${route}-incomplete`,
                    translations: {
                        en: payload().translations.en,
                    },
                }),
            },
        ));
        assert.equal(incomplete.status, 400);
        assert.equal(await prisma.page.count(), baseline.pages);
        assert.equal(await prisma.section.count(), baseline.sections);

        const created = await createPage(request(
            "https://arandi.example/api/cms/pages?lang=en",
            editor,
            { method: "POST", body: payload() },
        ));
        assert.equal(created.status, 201);
        const createdBody = await created.json() as { data: { id: string; status: string; pageType: string } };
        createdPageId = createdBody.data.id;
        assert.equal(createdBody.data.status, "draft");
        assert.equal(createdBody.data.pageType, "article");

        const stored = await prisma.page.findUniqueOrThrow({
            where: { id: createdPageId },
            include: {
                translations: true,
                sections: {
                    include: { translations: true, cards: true },
                    orderBy: { order: "asc" },
                },
            },
        });
        assert.equal(stored.publishState, "draft");
        assert.equal(stored.translations.length, 2);
        assert.deepEqual(stored.sections.map(({ key }) => key), ["hero", "article-body"]);
        assert.ok(stored.sections.every(({ translations }) => translations.length === 2));
        assert.ok(stored.sections.every(({ cards }) => cards.length === 0));
        assert.equal(await findPublishedPageBySlug(slug), null);

        const duplicateSlug = await createPage(request(
            "https://arandi.example/api/cms/pages",
            editor,
            {
                method: "POST",
                body: payload({ route: `${route}-other` }),
            },
        ));
        assert.equal(duplicateSlug.status, 409);
        const duplicateRoute = await createPage(request(
            "https://arandi.example/api/cms/pages",
            editor,
            {
                method: "POST",
                body: payload({ slug: `${slug}-other` }),
            },
        ));
        assert.equal(duplicateRoute.status, 409);
        assert.equal(await prisma.page.count(), baseline.pages + 1);

        const deleted = await deletePage(
            request(
                `https://arandi.example/api/cms/pages/${createdPageId}`,
                admin,
                { method: "DELETE" },
            ),
            { params: Promise.resolve({ identifier: createdPageId }) },
        );
        assert.equal(deleted.status, 200);
        createdPageId = null;
        assert.equal(await prisma.page.count(), baseline.pages);
        assert.equal(await prisma.section.count(), baseline.sections);
    } finally {
        await cleanup();
        await prisma.$disconnect();
    }
    console.log("Page template runtime verification passed; baseline counts restored and temporary records removed.");
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Page template verification failed.");
    process.exitCode = 1;
});
