import "dotenv/config";

import assert from "node:assert/strict";

import { getEnterpriseContent } from "../src/content/enterprise";
import { prisma } from "../src/lib/prisma";
import {
    mapPublishedFixedPage,
    type FixedEnterprisePageKey,
} from "../src/lib/public-content/fixed-pages";
import { findPublishedPageBySlug } from "../src/lib/public-content/pages";

const keys: FixedEnterprisePageKey[] = ["company", "contact"];

async function main() {
    for (const language of ["en", "fa"] as const) {
        for (const key of keys) {
            const page = await findPublishedPageBySlug(key, language);
            assert.ok(page, `${key}/${language} must be Published.`);
            assert.deepEqual(
                mapPublishedFixedPage(key, page, language),
                getEnterpriseContent(language).pages[key],
                `${key}/${language} must preserve the existing public output contract.`,
            );
        }
    }

    const contactSetting = await prisma.setting.findUniqueOrThrow({
        where: { key: "site.contact" },
        select: { isPublic: true, value: true },
    });
    assert.equal(contactSetting.isPublic, true);
    const settingValue = contactSetting.value as Record<string, Record<string, unknown>>;
    for (const language of ["en", "fa"] as const) {
        assert.equal(typeof settingValue[language]?.email, "string");
        assert.equal(typeof settingValue[language]?.phone, "string");
        assert.equal(typeof settingValue[language]?.address, "string");
    }

    const company = await prisma.page.findUniqueOrThrow({
        where: { slug: "company" },
        include: { sections: { where: { key: "company-content" } } },
    });
    const section = company.sections[0];
    assert.ok(section, "Company verification fixture must exist.");

    try {
        await prisma.page.update({ where: { id: company.id }, data: { publishState: "draft" } });
        assert.equal(await findPublishedPageBySlug("company", "en"), null);
    } finally {
        await prisma.page.update({
            where: { id: company.id },
            data: { publishState: company.publishState },
        });
    }

    try {
        await prisma.section.update({ where: { id: section.id }, data: { enabled: false } });
        const withoutSection = await findPublishedPageBySlug("company", "en");
        assert.ok(withoutSection);
        assert.equal(withoutSection.sections.length, 0);
    } finally {
        await prisma.section.update({
            where: { id: section.id },
            data: { enabled: section.enabled },
        });
    }

    console.log("Fixed public bridge verification passed; parity, contact settings, and Published filters are intact.");
}

main()
    .finally(() => prisma.$disconnect())
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : "Fixed public verification failed.");
        process.exitCode = 1;
    });
