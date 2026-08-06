import "dotenv/config";

import assert from "node:assert/strict";

import { prisma } from "../src/lib/prisma";
import {
    findPublicDocumentListSnapshot,
    findPublicSearchSnapshot,
    mapPublicDocumentList,
    mapPublicDocument,
    mapPublicSearchResults,
    type PublicDocumentType,
} from "../src/lib/public-content/documents";
import { findPublishedPageBySlug } from "../src/lib/public-content/pages";

const fixtures: Array<{ type: PublicDocumentType; slug: string }> = [
    { type: "article", slug: "building-an-ai-ready-enterprise" },
    { type: "knowledge", slug: "responsible-ai-foundations" },
    { type: "legal", slug: "privacy" },
];

async function main() {
    for (const language of ["en", "fa"] as const) {
        for (const fixture of fixtures) {
            const page = await findPublishedPageBySlug(fixture.slug, language);
            assert.ok(page, `${fixture.slug}/${language} must be Published.`);
            const mapped = mapPublicDocument(page);
            assert.equal(mapped.type, fixture.type);
            assert.equal(mapped.sections.length, 1);
            assert.ok(mapped.sections[0]?.paragraphs.length >= 3);
            assert.equal(JSON.stringify(mapped).includes('"id":'), false);
        }
        for (const type of ["article", "knowledge", "legal"] as const) {
            const items = mapPublicDocumentList(await findPublicDocumentListSnapshot(type, language));
            assert.equal(items.length, 1);
            assert.equal(JSON.stringify(items).includes('"id":'), false);
        }
    }

    assert.ok(mapPublicSearchResults(await findPublicSearchSnapshot("en"), "responsible", "en").some((item) => item.slug === "responsible-ai-foundations"));
    assert.ok(mapPublicSearchResults(await findPublicSearchSnapshot("fa"), "حریم", "fa").some((item) => item.slug === "privacy"));

    const suffix = Date.now().toString(36);
    const slug = `verify-public-document-${suffix}`;
    const page = await prisma.page.create({
        data: {
            slug,
            route: `/articles/${slug}`,
            pageType: "article",
            publishState: "published",
            seoKeywords: ["verify"],
            translations: {
                create: {
                    languageCode: "en",
                    title: "Verifier article",
                    seoTitle: "Verifier article title",
                    seoDescription: "Verifier description that is long enough for a public metadata contract.",
                },
            },
            sections: {
                create: {
                    key: "unsupported",
                    sectionType: "custom",
                    order: 1,
                    enabled: true,
                    style: {},
                    payload: {},
                    translations: {
                        create: {
                            languageCode: "en",
                            title: "Unsupported",
                            description: "This Section must fail the public renderer.",
                            data: {},
                        },
                    },
                },
            },
        },
        include: { sections: true },
    });

    try {
        const missingLocale = await findPublishedPageBySlug(slug, "fa");
        assert.ok(missingLocale);
        assert.throws(() => mapPublicDocument(missingLocale), /translation is unavailable/);

        const unsupported = await findPublishedPageBySlug(slug, "en");
        assert.ok(unsupported);
        assert.throws(() => mapPublicDocument(unsupported), /hero is incomplete|unsupported Section/);

        await prisma.page.update({ where: { id: page.id }, data: { publishState: "draft" } });
        assert.equal(await findPublishedPageBySlug(slug, "en"), null);
        await prisma.page.update({ where: { id: page.id }, data: { publishState: "published" } });

        await prisma.section.update({ where: { id: page.sections[0]!.id }, data: { enabled: false } });
        const disabled = await findPublishedPageBySlug(slug, "en");
        assert.ok(disabled);
        assert.throws(() => mapPublicDocument(disabled), /hero is incomplete/);
    } finally {
        await prisma.page.delete({ where: { id: page.id } });
    }

    console.log("Public document verification passed; parity, search projection, fail-closed rendering, and cleanup are intact.");
}

main()
    .finally(() => prisma.$disconnect())
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : "Public document verification failed.");
        process.exitCode = 1;
    });
