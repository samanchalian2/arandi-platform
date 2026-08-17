import { Prisma, PrismaClient } from "@prisma/client";

import { defaultScrollwiseCopy } from "../src/lib/scrollwise-copy";

const prisma = new PrismaClient();

const scenes = [
    ["gateway", "v2-01-gateway", "Prelude — the disconnect"],
    ["discover", "v2-02-discover", "Seeing"],
    ["design", "v2-03-design", "Designing the path"],
    ["buildSecure", "v2-04-build-secure", "Building the foundation"],
    ["oilGas", "v2-05-oil-gas", "Field and operations center"],
    ["petrochemical", "v2-06-petrochemical", "Plant and laboratory"],
    ["connectedOperations", "v2-07-connected-operations", "Grid and energy"],
    ["intelligence", "v2-08-intelligence", "Intelligence"],
    ["outcomes", "v2-09-outcomes", "Proof"],
    ["finale", "v2-10-finale", "Finale — the complete picture"],
] as const;

const proofMedia = [
    ["v2-proof-bid-boland.webp", "Bid Boland — integrated IT foundation"],
    ["v2-proof-sonqor.webp", "Sonqor — project workshop and head office"],
    ["v2-proof-negin-zafar.webp", "Negin Zafar — connected workplace"],
    ["v2-proof-noorin-bonyad.webp", "Noorin Bonyad — multi-site operations"],
] as const;

function json(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
}

async function main() {
    for (const [, filename, title] of scenes) {
        for (const variant of ["desktop", "mobile"] as const) {
            const dimensions = variant === "desktop" ? { width: 3200, height: 900 } : { width: 900, height: 1200 };
            const url = `/media-generated/scrollwise/${filename}-${variant}.webp`;
            await prisma.media.upsert({
                where: { url },
                update: {
                    title: `Scrollwise · ${title} · ${variant}`,
                    alt: `${title} — original illustrative industrial scene`,
                    caption: "Original generated illustration for the Arandi Scrollwise theme; not a customer-site photograph.",
                    type: "image/webp",
                    ...dimensions,
                    metadata: json({ generated: true, theme: "scrollwise", variant }),
                },
                create: {
                    url,
                    title: `Scrollwise · ${title} · ${variant}`,
                    alt: `${title} — original illustrative industrial scene`,
                    caption: "Original generated illustration for the Arandi Scrollwise theme; not a customer-site photograph.",
                    type: "image/webp",
                    ...dimensions,
                    metadata: json({ generated: true, theme: "scrollwise", variant }),
                },
            });
        }
    }

    for (const [filename, title] of proofMedia) {
        const url = `/media-generated/scrollwise/${filename}`;
        await prisma.media.upsert({
            where: { url },
            update: { title: `Scrollwise · Proof · ${title}`, alt: `${title} — illustrative project vignette`, caption: "Original generated Scrollwise illustration based only on published project scope; not a customer-site photograph.", type: "image/webp", width: 1600, height: 1000, metadata: json({ generated: true, theme: "scrollwise", variant: "proof" }) },
            create: { url, title: `Scrollwise · Proof · ${title}`, alt: `${title} — illustrative project vignette`, caption: "Original generated Scrollwise illustration based only on published project scope; not a customer-site photograph.", type: "image/webp", width: 1600, height: 1000, metadata: json({ generated: true, theme: "scrollwise", variant: "proof" }) },
        });
    }

    const value = Object.fromEntries(scenes.map(([key, filename]) => [key, {
        desktopUrl: `/media-generated/scrollwise/${filename}-desktop.webp`,
        mobileUrl: `/media-generated/scrollwise/${filename}-mobile.webp`,
    }]));
    await prisma.setting.upsert({
        where: { key: "site.scrollwiseScenes" },
        update: { value: json(value), group: "theme", isPublic: false },
        create: { key: "site.scrollwiseScenes", value: json(value), group: "theme", isPublic: false },
    });
    const experience = { motionPreset: "cinematic", headingScale: 100, veilOpacity: 0.94, storyHeight: 150, interludeHeight: 90 };
    const existingExperience = await prisma.setting.findUnique({ where: { key: "site.scrollwiseExperience" }, select: { value: true } });
    const currentExperience = existingExperience?.value && typeof existingExperience.value === "object" && !Array.isArray(existingExperience.value)
        ? existingExperience.value as Record<string, unknown>
        : {};
    await prisma.setting.upsert({
        where: { key: "site.scrollwiseExperience" },
        update: { value: json({ ...experience, ...currentExperience, headingScale: typeof currentExperience.headingScale === "number" ? currentExperience.headingScale : experience.headingScale }), group: "theme", isPublic: false },
        create: { key: "site.scrollwiseExperience", value: json(experience), group: "theme", isPublic: false },
    });
    const existingCopy = await prisma.setting.findUnique({ where: { key: "site.scrollwiseCopy" }, select: { value: true } });
    const currentCopy = existingCopy?.value && typeof existingCopy.value === "object" && !Array.isArray(existingCopy.value)
        ? existingCopy.value as Record<string, unknown>
        : {};
    const hasV2Narrative = (["en", "fa"] as const).every((language) => {
        const localized = currentCopy[language];
        return localized && typeof localized === "object" && !Array.isArray(localized) && "finale" in localized;
    });
    const mergedCopy = hasV2Narrative ? Object.fromEntries((["en", "fa"] as const).map((language) => {
        const currentLanguage = currentCopy[language] && typeof currentCopy[language] === "object" && !Array.isArray(currentCopy[language])
            ? currentCopy[language] as Record<string, unknown>
            : {};
        return [language, Object.fromEntries(Object.entries(defaultScrollwiseCopy[language]).map(([scene, fallback]) => {
            const currentScene = currentLanguage[scene] && typeof currentLanguage[scene] === "object" && !Array.isArray(currentLanguage[scene])
                ? currentLanguage[scene] as Record<string, unknown>
                : {};
            return [scene, { ...fallback, ...currentScene }];
        }))];
    })) : defaultScrollwiseCopy;
    await prisma.setting.upsert({
        where: { key: "site.scrollwiseCopy" },
        update: { value: json(mergedCopy), group: "theme", isPublic: false },
        create: { key: "site.scrollwiseCopy", value: json(mergedCopy), group: "theme", isPublic: false },
    });
    console.log("Scrollwise Media records and governed theme settings are ready.");
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : "Scrollwise media import failed.");
        process.exitCode = 1;
    })
    .finally(async () => prisma.$disconnect());
