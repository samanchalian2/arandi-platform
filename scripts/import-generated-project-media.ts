import path from "node:path";

import { Prisma } from "@prisma/client";
import sharp from "sharp";

import { prisma } from "@/lib/prisma";

type ProjectMedia = {
    cardKey: string;
    filename: string;
    title: string;
    alt: string;
    caption: string;
};

const projectMedia: ProjectMedia[] = [
    {
        cardKey: "enterprise:projects:bid-boland-gas-gathering",
        filename: "arandi-bid-boland-energy-card.webp",
        title: "Bid Boland energy infrastructure — generated cover",
        alt: "A generic energy facility at dusk with secure network infrastructure and technical staff",
        caption: "Illustrative generated cover image; replaceable from the Admin Media Library.",
    },
    {
        cardKey: "enterprise:projects:sonqor-methylamine",
        filename: "arandi-sonqor-petrochemical.png",
        title: "Sonqor petrochemical digital environment — generated cover",
        alt: "A generic industrial workshop and office connected by organized network infrastructure",
        caption: "Illustrative generated cover image; replaceable from the Admin Media Library.",
    },
    {
        cardKey: "enterprise:projects:negin-zafar",
        filename: "arandi-negin-zafar-network.png",
        title: "Negin Zafar commercial network — generated cover",
        alt: "A modern office and commercial interior with enterprise network infrastructure",
        caption: "Illustrative generated cover image; replaceable from the Admin Media Library.",
    },
    {
        cardKey: "enterprise:projects:noorin-bonyad",
        filename: "arandi-noorin-bonyad-operations.png",
        title: "Noorin Bonyad operations continuity — generated cover",
        alt: "A generic manufacturing operations room with server infrastructure and distant technical staff",
        caption: "Illustrative generated cover image; replaceable from the Admin Media Library.",
    },
];

async function main() {
    for (const item of projectMedia) {
        const filePath = path.join(process.cwd(), "public", "media-generated", item.filename);
        const dimensions = await sharp(filePath).metadata();
        const width = dimensions.width;
        const height = dimensions.height;

        if (!width || !height) {
            throw new Error(`Could not read dimensions for ${item.filename}.`);
        }

        const url = `/media-generated/${item.filename}`;
        const media = await prisma.media.upsert({
            where: { url },
            update: {
                title: item.title,
                alt: item.alt,
                caption: item.caption,
                type: "image/png",
                width,
                height,
                metadata: {
                    source: "generated-project-cover",
                    editableInAdmin: true,
                    replacement: "Upload or choose another image in Admin → Cards.",
                } as Prisma.InputJsonValue,
            },
            create: {
                title: item.title,
                alt: item.alt,
                caption: item.caption,
                url,
                type: "image/png",
                width,
                height,
                metadata: {
                    source: "generated-project-cover",
                    editableInAdmin: true,
                    replacement: "Upload or choose another image in Admin → Cards.",
                } as Prisma.InputJsonValue,
            },
        });

        const card = await prisma.card.findUnique({
            where: { key: item.cardKey },
            select: { id: true },
        });
        if (!card) {
            throw new Error(`Published project Card ${item.cardKey} was not found.`);
        }

        await prisma.card.update({
            where: { id: card.id },
            data: { mediaId: media.id },
        });
    }

    const existingSocial = await prisma.setting.findUnique({
        where: { key: "site.social" },
        select: { value: true },
    });
    const existingLinks = existingSocial?.value && typeof existingSocial.value === "object" && !Array.isArray(existingSocial.value)
        ? existingSocial.value as Record<string, unknown>
        : {};
    const socialLinks = {
        instagram: "https://instagram.com/arandi.io",
        telegram: typeof existingLinks.telegram === "string" ? existingLinks.telegram : "",
        whatsapp: typeof existingLinks.whatsapp === "string" ? existingLinks.whatsapp : "",
        bale: typeof existingLinks.bale === "string" ? existingLinks.bale : "",
    };

    await prisma.setting.upsert({
        where: { key: "site.social" },
        update: {
            value: socialLinks as Prisma.InputJsonValue,
        },
        create: {
            key: "site.social",
            group: "social",
            isPublic: true,
            value: socialLinks as Prisma.InputJsonValue,
        },
    });

    await prisma.media.upsert({
        where: { url: "/media-generated/arandi-hero-digital-infrastructure.webm" },
        update: {
            title: "Arandi digital infrastructure hero video",
            alt: "Abstract digital infrastructure and operations environment",
            caption: "10-second silent generated hero background video; select or replace it from Admin Settings.",
            type: "video/webm",
            width: 960,
            height: 540,
            metadata: { source: "generated-hero-video", durationSeconds: 10, editableInAdmin: true } as Prisma.InputJsonValue,
        },
        create: {
            title: "Arandi digital infrastructure hero video",
            alt: "Abstract digital infrastructure and operations environment",
            caption: "10-second silent generated hero background video; select or replace it from Admin Settings.",
            url: "/media-generated/arandi-hero-digital-infrastructure.webm",
            type: "video/webm",
            width: 960,
            height: 540,
            metadata: { source: "generated-hero-video", durationSeconds: 10, editableInAdmin: true } as Prisma.InputJsonValue,
        },
    });

    await prisma.media.upsert({
        where: { url: "/media-generated/arandi-bid-boland-energy-poster.webp" },
        update: {
            title: "Arandi hero poster — optimized",
            alt: "A generic energy facility with secure digital infrastructure",
            caption: "Optimized generated poster for the public Home hero; replaceable from Admin Settings.",
            type: "image/webp",
            width: 1672,
            height: 941,
            metadata: { source: "generated-hero-poster", editableInAdmin: true } as Prisma.InputJsonValue,
        },
        create: {
            title: "Arandi hero poster — optimized",
            alt: "A generic energy facility with secure digital infrastructure",
            caption: "Optimized generated poster for the public Home hero; replaceable from Admin Settings.",
            url: "/media-generated/arandi-bid-boland-energy-poster.webp",
            type: "image/webp",
            width: 1672,
            height: 941,
            metadata: { source: "generated-hero-poster", editableInAdmin: true } as Prisma.InputJsonValue,
        },
    });

    await prisma.setting.upsert({
        where: { key: "site.heroMedia" },
        update: {
            value: {
                enabled: true,
                videoUrl: "/media-generated/arandi-hero-digital-infrastructure.webm",
                posterUrl: "/media-generated/arandi-bid-boland-energy-poster.webp",
            } as Prisma.InputJsonValue,
        },
        create: {
            key: "site.heroMedia",
            group: "hero",
            isPublic: true,
            value: {
                enabled: true,
                videoUrl: "/media-generated/arandi-hero-digital-infrastructure.webm",
                posterUrl: "/media-generated/arandi-bid-boland-energy-poster.webp",
            } as Prisma.InputJsonValue,
        },
    });

    console.log("Imported generated project covers, the 10-second hero video, and the Instagram profile URL.");
}

main()
    .finally(() => prisma.$disconnect());
