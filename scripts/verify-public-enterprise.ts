import "dotenv/config";

import assert from "node:assert/strict";

import { prisma } from "../src/lib/prisma";
import {
    mapPublishedEnterprisePage,
    type EnterpriseCollectionKey,
    type EnterpriseCollectionPage,
} from "../src/lib/public-content/enterprise-pages";
import { findPublishedPageBySlug } from "../src/lib/public-content/pages";

const keys: EnterpriseCollectionKey[] = ["services", "solutions", "industries", "projects"];
const expectedCards: Record<EnterpriseCollectionKey, string[]> = {
    services: ["digital-transformation-consulting", "infrastructure-network-data-center", "cloud-modern-infrastructure", "cybersecurity-business-continuity", "enterprise-solutions", "ai-solutions", "managed-it-services"],
    solutions: ["digital-foundation", "secure-modern-infrastructure", "enterprise-collaboration", "ai-knowledge-operations"],
    industries: ["energy-petrochemicals", "manufacturing", "financial-services", "government", "healthcare", "holdings"],
    projects: ["persian-gulf-petrochemical", "sonqor-methylamine", "negin-zafar", "noorin-bonyad"],
};

function assertProfileContent(key: EnterpriseCollectionKey, page: EnterpriseCollectionPage<EnterpriseCollectionKey>) {
    let cardIds: string[];
    switch (key) {
        case "services":
            cardIds = (page as EnterpriseCollectionPage<"services">).cards.map((card) => card.id);
            break;
        case "solutions":
            cardIds = (page as EnterpriseCollectionPage<"solutions">).catalog.cards.map((card) => card.id);
            break;
        case "industries":
            cardIds = (page as EnterpriseCollectionPage<"industries">).section.cards.map((card) => card.id);
            break;
        case "projects":
            cardIds = (page as EnterpriseCollectionPage<"projects">).section.cards.map((card) => card.id);
            break;
    }
    assert.deepEqual(
        cardIds,
        expectedCards[key],
        `${key} card order must match the approved company profile.`,
    );
    assert.ok(page.metadata.title.trim().length > 2, `${key} metadata title is required.`);
    assert.ok(page.metadata.description.trim().length >= 20, `${key} metadata description is required.`);
    assert.ok(page.hero.title.trim().length > 2, `${key} hero title is required.`);
    assert.ok(page.cta.title.trim().length > 2, `${key} CTA title is required.`);
}

async function main() {
    for (const language of ["en", "fa"] as const) {
        for (const key of keys) {
            const page = await findPublishedPageBySlug(key, language);
            assert.ok(page, `${key}/${language} must be Published.`);
            assertProfileContent(key, mapPublishedEnterprisePage(key, page, language));
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
