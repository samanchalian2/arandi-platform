import "dotenv/config";

import assert from "node:assert/strict";

import { getEnterpriseContent } from "../src/content/enterprise";
import { prisma } from "../src/lib/prisma";
import {
    mapPublishedEnterprisePage,
    type EnterpriseCollectionKey,
} from "../src/lib/public-content/enterprise-pages";
import { findPublishedPageBySlug } from "../src/lib/public-content/pages";

const keys: EnterpriseCollectionKey[] = ["services", "solutions", "industries", "projects"];

async function main() {
    for (const language of ["en", "fa"] as const) {
        for (const key of keys) {
            const page = await findPublishedPageBySlug(key, language);
            assert.ok(page, `${key}/${language} must be Published.`);
            assert.deepEqual(
                mapPublishedEnterprisePage(key, page, language),
                getEnterpriseContent(language).pages[key],
                `${key}/${language} must preserve the existing public output contract.`,
            );
        }
    }

    const services = await prisma.page.findUniqueOrThrow({
        where: { slug: "services" },
        include: {
            sections: {
                where: { key: "services-catalog" },
                include: { cards: { orderBy: { order: "asc" } } },
            },
        },
    });
    const section = services.sections[0];
    const card = section?.cards[0];
    assert.ok(section && card, "Services verification fixtures must exist.");

    try {
        await prisma.page.update({ where: { id: services.id }, data: { publishState: "draft" } });
        assert.equal(await findPublishedPageBySlug("services", "en"), null);
    } finally {
        await prisma.page.update({
            where: { id: services.id },
            data: { publishState: services.publishState },
        });
    }

    try {
        await prisma.section.update({ where: { id: section.id }, data: { enabled: false } });
        const withoutSection = await findPublishedPageBySlug("services", "en");
        assert.ok(withoutSection);
        assert.equal(withoutSection.sections.length, 0);
    } finally {
        await prisma.section.update({
            where: { id: section.id },
            data: { enabled: section.enabled },
        });
    }

    try {
        await prisma.card.update({ where: { id: card.id }, data: { publishState: "draft" } });
        const withoutCard = await findPublishedPageBySlug("services", "en");
        assert.ok(withoutCard);
        assert.equal(withoutCard.sections[0]?.cards.length, section.cards.length - 1);
    } finally {
        await prisma.card.update({
            where: { id: card.id },
            data: { publishState: card.publishState },
        });
    }

    console.log("Enterprise public bridge verification passed; output parity and Published filters are intact.");
}

main()
    .finally(() => prisma.$disconnect())
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : "Enterprise public verification failed.");
        process.exitCode = 1;
    });
